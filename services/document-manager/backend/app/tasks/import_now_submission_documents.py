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

MAX_RETRIES = 10


def get_originating_system(import_now_submission_document):
    url = import_now_submission_document.submission_document_url
    if 'j200.gov.bc.ca' in url:
        return 'VFCBC'
    if 'api.nrs.gov.bc.ca' in url:
        return 'NROS'
    raise Exception(f'Unknown originating system for document URL: {url}')


def task_result(job_id, task_id, success, message, success_docs, errors, doc_ids):
    result = {
        'job_id': job_id,
        'task_id': task_id,
        'success': success,
        'message': message,
        'success_docs': list(sorted(success_docs)),
        'fail_docs': list(sorted([i for i in doc_ids if i not in success_docs])),
        'errors': errors
    }
    return json.dumps(result)


@celery.task(bind=True, max_retries=MAX_RETRIES)
# TODO: Check performance of opening many db sessions in the loop.
# 1 min, 10 min, 30 min, 1 hour, 1 day, 3 day
def import_now_submission_documents(self, import_now_submission_documents_job_id):
    result = None
    success = False
    errors = []
    success_imports = []
    try:
        logger = get_task_logger(str(import_now_submission_documents_job_id))

        # Get the NoW Submission Documents Import job
        import_job = ImportNowSubmissionDocumentsJob.query.filter_by(
            import_now_submission_documents_job_id=import_now_submission_documents_job_id).one()

        # Update job-start information
        current_timestamp = datetime.utcnow()
        import_job.start_timestamp = current_timestamp
        if not import_job.create_timestamp:
            import_job.create_timestamp = current_timestamp

        # Get the documents to import
        import_documents = [
            doc for doc in import_job.import_now_submission_documents if not doc.document_id
        ]
        doc_ids = [doc.submission_document_id for doc in import_documents]

        # Import the documents
        for i, import_doc in enumerate(import_documents):
            doc_prefix = f'[Doc {i + 1}/{len(import_documents)}, ID {import_doc.submission_document_id}]:'
            logger.info(f'{doc_prefix} Importing...')
            try:
                # TODO: Remove me before publishing.
                if import_doc.submission_document_id >= 70:
                    raise Exception('ERROR!')

                # Stream the file from its hosted location
                originating_system = get_originating_system(import_doc)
                file_stream = None
                if originating_system == 'VFCBC':
                    file_stream = VFCBCDownloadService.download(import_doc.submission_document_url)
                elif originating_system == 'NROS':
                    # file_stream = NROSDownloadService.download(import_doc.submission_document_url)
                    continue

                # Upload the file (using the file stream) to the object store
                # TODO: Figure out what bucket_filename should be.
                filename = import_doc.submission_document_file_name
                bucket_filename = f'{import_job.now_application_guid}/{originating_system}/{filename}'
                uploaded, key = ObjectStoreStorageService().upload_fileobj(
                    filename=bucket_filename, fileobj=file_stream)

                # Create the document record
                current_timestamp = datetime.utcnow()
                guid = str(uuid.uuid4())
                db.session.rollback()
                # TODO: Figure out what full_storage_path and path_display_name should be.
                doc = Document(
                    document_guid=guid,
                    full_storage_path=f'.../{guid}',
                    upload_started_date=current_timestamp,
                    upload_completed_date=current_timestamp,
                    path_display_name=f'.../{filename}',
                    file_display_name=filename,
                    object_store_path=key,
                    create_user=import_job.create_user,
                    create_timestamp=current_timestamp,
                    update_user=import_job.create_user,
                    update_timestamp=current_timestamp)
                import_doc.document = doc
                import_doc.error = None
                db.session.add(doc)
                db.session.commit()

                success_imports.append(import_doc.submission_document_id)
                logger.info(f'{doc_prefix} Transfer {"COMPLETE" if uploaded else "UNNECESSARY"}')
            except Exception as e:
                import_doc.error = str(e)
                import_doc.save()
                logger.error(f'{doc_prefix} Transfer ERROR\n{e}')
                errors.append({'exception': str(e), 'document': import_doc.task_json()})

        # Determine the result of the import
        success = len(errors) == 0
        message = 'All required documents were imported' if success else 'Transfer finished with errors'
        result = task_result(
            job_id=import_now_submission_documents_job_id,
            task_id=import_now_submission_documents.request.id,
            success=success,
            message=message,
            success_docs=success_imports,
            errors=errors,
            doc_ids=doc_ids)

    except Exception as e:
        message = f'An unexpected exception occurred: {e}'
        logger.error(message)
        result = task_result(
            job_id=import_now_submission_documents_job_id,
            task_id=import_now_submission_documents.request.id,
            success=False,
            message=message,
            success_docs=success_imports,
            errors=errors,
            doc_ids=doc_ids)

    # Update job-end information
    current_timestamp = datetime.utcnow()
    import_job.end_timestamp = current_timestamp

    # Return the result of the import
    if success:
        import_job.complete_timestamp = current_timestamp
        import_job.import_now_submission_documents_job_status_code = 'SUCCESS'
        import_job.save()
        return result
    else:
        import_job.error = result
        if import_job.attempt == MAX_RETRIES:
            import_job.complete_timestamp = current_timestamp
            import_job.import_now_submission_documents_job_status_code = 'FAILURE'
        else:
            import_job.attempt += 1
        import_job.save()
        raise Exception(result)
