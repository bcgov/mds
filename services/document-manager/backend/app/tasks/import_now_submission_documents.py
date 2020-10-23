import json
import uuid

from datetime import datetime
from celery.utils.log import get_task_logger

from app.extensions import db
from app.services.object_store_storage_service import ObjectStoreStorageService
from app.docman.models.document import Document
from app.docman.models.import_now_submission_documents_job import ImportNowSubmissionDocumentsJob
from app.docman.models.import_now_submission_document import ImportNowSubmissionDocument
from app.tasks.celery import celery, doc_task_result
from app.config import Config
from app.services.nros_download_service import NROSDownloadService
from app.services.vfcbc_download_service import VFCBCDownloadService


def get_originating_system(import_now_submission_document):
    url = import_now_submission_document.submission_document_url
    if 'j200.gov.bc.ca' in url:
        return 'VFCBC'
    if 'api.nrs.gov.bc.ca' in url:
        return 'NROS'
    raise Exception(f'Unknown originating system for document URL: {url}')


@celery.task()
def import_now_submission_documents(import_id, doc_ids, chunk_index,
                                    import_now_submission_documents_job_id):
    result = None
    try:
        logger = get_task_logger(import_id)

        # Get the NoW Submission Documents Import job
        import_job = ImportNowSubmissionDocumentsJob.query.filter_by(
            import_now_submission_documents_job_id=import_now_submission_documents_job_id).one()

        # Get the documents to import
        import_documents = [
            doc for doc in import_job.import_now_submission_documents
            if doc.submission_document_id in doc_ids
        ]

        # Transfer the documents
        errors = []
        success_imports = []
        for i, import_doc in enumerate(import_documents):
            doc_prefix = f'[Chunk {chunk_index}, Doc {i + 1}/{len(import_documents)}, ID {import_doc.submission_document_id}]:'
            logger.info(f'{doc_prefix} Importing...')
            try:
                # Import the file to the filesystem
                originating_system = get_originating_system(import_doc)
                file_stream = None
                if originating_system == 'VFCBC':
                    file_stream = VFCBCDownloadService.download(import_doc.submission_document_url)
                elif originating_system == 'NROS':
                    pass
                    # file_stream = NROSDownloadService.download(import_doc.submission_document_url)

                # Upload the file to the object store
                filename = import_doc.submission_document_file_name
                bucket_filename = f'{import_job.now_application_guid}/{filename}'
                uploaded, key = ObjectStoreStorageService().upload_fileobj(
                    filename=bucket_filename, fileobj=file_stream)

                # Update the document's object store path
                date = datetime.utcnow()
                guid = str(uuid.uuid4())
                doc = Document(
                    document_guid=guid,
                    full_storage_path=f'.../{guid}',
                    upload_started_date=date,
                    upload_completed_date=date,
                    path_display_name=f'.../{filename}',
                    file_display_name=filename,
                    object_store_path=key,
                    create_user='mds')

                doc.save()

                # NOTE: Not sure if something like this will be needed...
                # db.session.rollback()
                # db.session.add(doc)
                # doc.object_store_path = key
                # doc.update_user = 'mds'
                # db.session.commit()

                success_imports.append(import_doc.submission_document_id)
                logger.info(f'{doc_prefix} Transfer {"COMPLETE" if uploaded else "UNNECESSARY"}')
            except Exception as e:
                logger.error(f'{doc_prefix} Transfer ERROR\n{e}')
                errors.append({'exception': str(e), 'document': doc.task_json()})

        # Determine the result of the import
        success = len(errors) == 0
        message = 'All required documents were imported' if success else 'Transfer finished with errors'
        result = doc_task_result(
            job_id=import_id,
            task_id=import_now_submission_documents.request.id,
            chunk=chunk_index,
            success=success,
            message=message,
            success_docs=success_imports,
            errors=errors,
            doc_ids=doc_ids)

    except Exception as e:
        message = f'An unexpected exception occurred: {e}'
        logger.error(message)
        result = doc_task_result(
            job_id=import_id,
            task_id=import_now_submission_documents.request.id,
            chunk=chunk_index,
            success=False,
            message=message,
            success_docs=[],
            errors=[],
            doc_ids=doc_ids)

    # Return the result of the import
    return result
