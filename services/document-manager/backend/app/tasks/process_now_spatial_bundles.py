import json
import re

import requests
from celery.utils.log import get_task_logger

from app.config import Config
from app.docman.models.document import Document
from app.docman.models.import_now_submission_documents_job import ImportNowSubmissionDocumentsJob
from app.docman.utils.spatial_bundle_service import SpatialBundleService
from app.tasks.celery import celery
from app.tasks.import_now_submission_documents import get_core_authorization_token

logger = get_task_logger(__name__)

_MINE_GUID_PATH_RE = re.compile(
    r'mines/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/'
)


def mine_guid_from_documents(documents):
    found = set()
    for doc in documents or []:
        for path in (getattr(doc, 'full_storage_path', None), getattr(doc, 'path_display_name', None)):
            if not path:
                continue
            match = _MINE_GUID_PATH_RE.search(path)
            if match:
                found.add(match.group(1).lower())
    if len(found) == 1:
        return next(iter(found))
    return None


def imported_documents_for_application(now_application_guid):
    """Every document imported for a NoW, across all of its import jobs.

    An import job only ever contains the documents that still needed importing, so scoping
    spatial processing to one job would leave previously imported files unvalidated.
    """
    documents = {}
    for job in ImportNowSubmissionDocumentsJob.find_by_now_application_guid(now_application_guid):
        for import_document in job.import_now_submission_documents:
            if import_document.document:
                documents[import_document.document_id] = import_document.document
    return list(documents.values())


def sync_bundle_to_core(result, authorization_token, mine_guid):
    """Persist spatial bundle validation result on Core MineDocumentBundle."""
    if not mine_guid:
        raise Exception('mine_guid is required to sync spatial bundles to Core')
    payload = {
        'name': result['name'],
        'docman_bundle_guid': result.get('docman_bundle_guid'),
        'geomark_id': result.get('geomark_id'),
        'validation_status': result.get('validation_status'),
        'validation_error': result.get('validation_error'),
        'validation_checks': result.get('validation_checks'),
        'document_manager_guids': result.get('document_guids') or [],
    }
    resp = requests.post(
        url=f'{Config.CORE_API_URL}/mines/{mine_guid}/document-bundle',
        headers={
            'Content-Type': 'application/json',
            'Authorization': authorization_token,
        },
        data=json.dumps(payload),
        timeout=60,
    )
    if resp.status_code not in (200, 201):
        raise Exception(
            f'Failed to sync spatial bundle to Core ({resp.status_code}): {resp.content}'
        )
    return resp.json()


def _process_and_sync(documents, token_ref=None, log_context='', mine_guid=None):
    """Detect/validate spatial groups in `documents` and persist results on Core."""
    mine_guid = mine_guid or mine_guid_from_documents(documents)
    results = SpatialBundleService.process_all_spatial_documents(documents, blocking=False)
    authorization_token = get_core_authorization_token(token_ref)

    synced = []
    errors = []
    for result in results:
        try:
            core_bundle = sync_bundle_to_core(result, authorization_token, mine_guid)
            synced.append(core_bundle)
        except Exception as e:
            logger.exception(f'Failed syncing spatial bundle {result.get("name")}: {e}')
            errors.append({'name': result.get('name'), 'error': str(e)})

    logger.info(f'Spatial processing {log_context}: {len(synced)} synced, {len(errors)} errors')
    if errors:
        raise Exception(
            f'Spatial processing {log_context} failed to sync {len(errors)} bundle(s) to Core: {errors}'
        )
    return {
        'success': True,
        'bundles': synced,
        'errors': [],
    }


@celery.task(
    bind=True,
    max_retries=3,
    acks_late=True,
    autoretry_for=(Exception,),
)
def process_now_spatial_bundles(self, import_now_submission_documents_job_id, mine_guid=None):
    """Non-blocking spatial detect/validate after NoW document import."""
    import_job = ImportNowSubmissionDocumentsJob.query.filter_by(
        import_now_submission_documents_job_id=import_now_submission_documents_job_id
    ).one_or_none()

    if not import_job:
        logger.error(
            f'Import job not found for spatial processing: {import_now_submission_documents_job_id}'
        )
        return {'success': False, 'message': 'Import job not found'}

    # Bundle and validate every document imported for this NoW, not just this job's.
    documents = imported_documents_for_application(import_job.now_application_guid)

    if not documents:
        logger.info(f'No documents to process for job {import_now_submission_documents_job_id}')
        return {'success': True, 'bundles': []}

    return _process_and_sync(
        documents,
        token_ref=import_now_submission_documents_job_id,
        log_context=f'for job {import_now_submission_documents_job_id}',
        mine_guid=mine_guid)


@celery.task(
    bind=True,
    max_retries=3,
    acks_late=True,
    autoretry_for=(Exception,),
)
def process_spatial_document_guids(self, document_guids, mine_guid=None):
    """Non-blocking spatial detect/validate for an explicit set of documents."""
    if not document_guids:
        return {'success': True, 'bundles': []}

    documents = Document.query.filter(Document.document_guid.in_(document_guids)).all()
    found_guids = {str(doc.document_guid) for doc in documents}
    missing = [str(guid) for guid in document_guids if str(guid) not in found_guids]
    if missing:
        raise Exception(f'Documents not found for spatial processing: {missing}')

    return _process_and_sync(
        documents,
        log_context=f'for {len(documents)} document(s)',
        mine_guid=mine_guid)
