import json
import uuid
import requests

from datetime import datetime
from celery.utils.log import get_task_logger

from app.extensions import db
from app.services.object_store_storage_service import ObjectStoreStorageService
from app.docman.models.document import Document
from app.docman.models.import_now_submission_documents_job import ImportNowSubmissionDocumentsJob
from app.docman.models.import_now_submission_document import ImportNowSubmissionDocument
from app.tasks.celery import celery, doc_task_result
from app.config import Config
from app.constants import TIMEOUT_1_MINUTE, TIMEOUT_5_MINUTES, TIMEOUT_10_MINUTES, TIMEOUT_30_MINUTES, TIMEOUT_60_MINUTES, TIMEOUT_12_HOURS, TIMEOUT_24_HOURS
from app.services.nros_download_service import NROSDownloadService
from app.services.vfcbc_download_service import VFCBCDownloadService

RETRY_DELAYS = [15, 15, 15, 15]
# RETRY_DELAYS = [
#     TIMEOUT_1_MINUTE, TIMEOUT_5_MINUTES, TIMEOUT_10_MINUTES, TIMEOUT_30_MINUTES,
#     TIMEOUT_60_MINUTES, TIMEOUT_60_MINUTES, TIMEOUT_60_MINUTES, TIMEOUT_12_HOURS, TIMEOUT_12_HOURS,
#     TIMEOUT_12_HOURS, TIMEOUT_24_HOURS, TIMEOUT_24_HOURS, TIMEOUT_24_HOURS
# ]
MAX_RETRIES = len(RETRY_DELAYS)


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


@celery.task(bind=True, acks_late=True)
def import_now_submission_documents(self, import_now_submission_documents_job_id):
    result = None
    success = False
    errors = []
    success_imports = []
    import_documents = []
    doc_ids = []
    try:
        logger = get_task_logger(str(import_now_submission_documents_job_id))

        # Get the NoW Submission Documents Import job
        import_job = ImportNowSubmissionDocumentsJob.query.filter_by(
            import_now_submission_documents_job_id=import_now_submission_documents_job_id).one()

        # Update job-start information
        import_job.attempt += 1
        current_timestamp = datetime.utcnow()
        import_job.start_timestamp = current_timestamp
        if not import_job.create_timestamp:
            import_job.create_timestamp = current_timestamp
        import_job.save()

        # Get the documents to import
        import_documents = [
            doc for doc in import_job.import_now_submission_documents if doc.document_id is None
        ]
        doc_ids = [doc.submission_document_id for doc in import_documents]

        # Import the documents
        for i, import_doc in enumerate(import_documents):
            doc_prefix = f'[Doc {i + 1}/{len(import_documents)}, ID {import_doc.submission_document_id}]:'
            logger.info(f'{doc_prefix} Importing attempt {import_job.attempt}/{MAX_RETRIES}...')
            try:
                # Stream the file from its hosted location
                originating_system = get_originating_system(import_doc)
                file_stream = None
                if originating_system == 'VFCBC':
                    file_stream = VFCBCDownloadService.download(import_doc.submission_document_url)
                elif originating_system == 'NROS':
                    file_stream = NROSDownloadService.download(import_doc.submission_document_url)

                # Upload the file (using the file stream) to the object store
                # TODO: Figure out what object_store_path should be.
                filename = import_doc.submission_document_file_name
                object_store_path = f'{import_job.now_application_guid}/{originating_system}/{filename}'
                uploaded, key = ObjectStoreStorageService().upload_fileobj(
                    filename=object_store_path, fileobj=file_stream)

                # Create the document record
                current_timestamp = datetime.utcnow()
                guid = str(uuid.uuid4())
                db.session.rollback()
                # TODO: Should full_storage_path and path_display_name be empty, since they were never stored on the filesystem?
                doc = Document(
                    document_guid=guid,
                    full_storage_path='',
                    upload_started_date=current_timestamp,
                    upload_completed_date=current_timestamp,
                    path_display_name='',
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

                data = {'document_manager_document_guid': str(guid)}
                resp = requests.put(
                    url=
                    f'{Config.CORE_API_URL}/now-submissions/applications/{import_job.now_application_guid}/document/{import_doc.submission_document_id}',
                    headers={
                        'Content-Type':
                        'application/json',
                        'Authorization':
                        'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICIyT1BJR0VrQ2JBTzFHZHZHcEE1dC1KTTRpamEwWmlFYzZLaXZzYlJSM3dnIn0.eyJleHAiOjE2MDM5Nzc1NTYsImlhdCI6MTYwMzkxOTk1NiwiYXV0aF90aW1lIjoxNjAzOTA3OTI4LCJqdGkiOiJhZjAzMTZjYi02ZmVjLTRlZTAtYTE4ZC04YmQ0MmRlN2FiNWIiLCJpc3MiOiJodHRwczovL3Nzby10ZXN0LnBhdGhmaW5kZXIuZ292LmJjLmNhL2F1dGgvcmVhbG1zL21kcyIsImF1ZCI6WyJyZWFsbS1tYW5hZ2VtZW50IiwiYWNjb3VudCIsImNlbnRyYWwtc2NoZWR1bGVyIl0sInN1YiI6ImVlNDUyMTM0LWMzOWEtNDU2Mi05MjI2LTdmNTliYzdjYjkyNSIsInR5cCI6IkJlYXJlciIsImF6cCI6Im1pbmVzLWFwcGxpY2F0aW9uLWxvY2FsIiwibm9uY2UiOiI5YjA5MDM0NS1hYTQzLTRjZjQtODIxOC1jMDViYWQyMzA1OGYiLCJzZXNzaW9uX3N0YXRlIjoiM2QzYjM1MjItNDUwZi00MmI2LTg0YjMtZGM1NzA1ODJlNmYwIiwiYWNyIjoiMCIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwczovL2xvY2FsaG9zdDozMDAwIiwiaHR0cDovL2xvY2FsaG9zdDozMDAwIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJjb3JlX2VkaXRfdmFyaWFuY2VzIiwiY29yZV9lZGl0X2ludmVzdGlnYXRpb25zIiwiZGlnZGFnX2FkbWluIiwiYWRtaW4iLCJjb3JlX2VkaXRfcmVwb3J0cyIsImNvcmVfY29udGFjdF9hZG1pbiIsImNvcmVfZWRpdF9wZXJtaXRzIiwibWRzX3VzZXJzIiwiY29yZV92aWV3X2FsbCIsIm1kc19hcHBsaWNhdGlvbl9hZG1pbnMiLCJvZmZsaW5lX2FjY2VzcyIsImNvcmVfY2xvc2VfcGVybWl0cyIsImNvcmVfZWRpdF9kbyIsInVtYV9hdXRob3JpemF0aW9uIiwibnJpc192aWV3X2FsbCIsImNvcmVfZWRpdF9zZWN1cml0aWVzIiwibWRzX3JlZ2lvbmFsX21pbmVzIiwiY29yZV9lZGl0X2FsbCIsImNvcmVfZWRpdF9taW5lcyIsImNvcmVfZ2Vvc3BhdGlhbCIsImNvcmVfZWRpdF9oaXN0b3JpY2FsX2FtZW5kbWVudHMiLCJjb3JlX2VkaXRfcGFydGllcyIsInRlc3RfZnVsbF9wZXJtaXNzaW9ucyIsImNvcmVfZWRpdF9zdWJtaXNzaW9ucyIsImNvcmVfZXhlY3V0aXZlX3ZpZXciLCJjb3JlX2FiYW5kb25lZF9taW5lcyIsImlkaXIiLCJjb3JlX2Vudmlyb25tZW50YWxfcmVwb3J0cyIsImNvcmVfYWRtaW4iXX0sInJlc291cmNlX2FjY2VzcyI6eyJyZWFsbS1tYW5hZ2VtZW50Ijp7InJvbGVzIjpbInZpZXctaWRlbnRpdHktcHJvdmlkZXJzIiwidmlldy1yZWFsbSIsIm1hbmFnZS1pZGVudGl0eS1wcm92aWRlcnMiLCJpbXBlcnNvbmF0aW9uIiwicmVhbG0tYWRtaW4iLCJjcmVhdGUtY2xpZW50IiwibWFuYWdlLXVzZXJzIiwicXVlcnktcmVhbG1zIiwidmlldy1hdXRob3JpemF0aW9uIiwicXVlcnktY2xpZW50cyIsInF1ZXJ5LXVzZXJzIiwibWFuYWdlLWV2ZW50cyIsIm1hbmFnZS1yZWFsbSIsInZpZXctZXZlbnRzIiwidmlldy11c2VycyIsInZpZXctY2xpZW50cyIsIm1hbmFnZS1hdXRob3JpemF0aW9uIiwibWFuYWdlLWNsaWVudHMiLCJxdWVyeS1ncm91cHMiXX0sImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfSwiY2VudHJhbC1zY2hlZHVsZXIiOnsicm9sZXMiOlsiYWRtaW4iXX19LCJzY29wZSI6Im9wZW5pZCIsImF1ZCI6Im1pbmVzLWFwcGxpY2F0aW9uLWxvY2FsIiwibmFtZSI6Ikh1c2Vpbm92LCBNZWtodGkgWCBFTVBSOkVYIiwicHJlZmVycmVkX3VzZXJuYW1lIjoibWh1c2Vpbm8iLCJnaXZlbl9uYW1lIjoiSHVzZWlub3YsIE1la2h0aSBYIEVNUFI6RVgifQ.ebHOgra7Dj8WlfWpYbKENyc0XVbADdFUmV9sUo7lmAHsFAut3LLm2QwCIH8lIDuDg0-S2ISfYyNR1Q1CTrIGnO5pbELxvpZB7FFUnc1a7FAzFb0pEUciUWL1j5dyKEmx5h3lK0qugDu0sFj50AO-IBxiO8wuFG9dyf1bpadQhvQ0L-D23q-UNxZI6S6ERwvI_Iik7QqFV65hJvy9HgNayXhDjUATkF4B6QKyRNU5BP5VAAeYwgaiZ0Lcam5qnddtRg9oxsYc63KlhVYbYwfoLrA7yJ0PewGhXY16j1Pm_9sF93Mxz3DyYGQOnLlqInqlZc2egNfe6lUc_XLfFtAYdA'
                    },
                    data=json.dumps(data))

                # TODO check this
                if resp.status_code != requests.codes.ok:
                    db.session.rollback()
                    db.session.delete(doc)
                    db.session.commit()
                    raise Exception(f'Request to update now_submission.document failed!')

                success_imports.append(import_doc.submission_document_id)
                logger.info(f'{doc_prefix} Import {"COMPLETE" if uploaded else "UNNECESSARY"}')
            except Exception as e:
                import_doc.error = str(e)
                import_doc.save()
                logger.error(f'{doc_prefix} Import ERROR\n{e}')
                errors.append({'exception': str(e), 'document': import_doc.task_json()})

        # Determine the result of the import
        success = len(errors) == 0
        message = 'All required documents were imported' if success else 'Import finished with errors'
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
    if success or len(import_documents) == 0:
        import_job.complete_timestamp = current_timestamp
        import_job.import_now_submission_documents_job_status_code = 'SUC'
        import_job.save()
        return result
    else:
        import_job.error = result
        if import_job.attempt == MAX_RETRIES:
            import_job.complete_timestamp = current_timestamp
            import_job.import_now_submission_documents_job_status_code = 'FAI'
            import_job.save()
            raise Exception(result)
        import_job.save()
        self.retry(exc=result, countdown=RETRY_DELAYS[import_job.attempt - 1])
