from app.extensions import api
from flask_restplus import fields

DOCUMENT_MODEL = api.model(
    'Document', {
        'document_guid': fields.String,
        'document_id': fields.Integer,
        'full_storage_path': fields.String,
        'upload_started_date': fields.DateTime,
        'upload_completed_date': fields.DateTime,
        'file_display_name': fields.String,
        'path_display_name': fields.String,
        'object_store_path': fields.String
    })

DOCUMENT_VERSION_MODEL = api.model(
    'DocumentVersion', {
        'document_guid': fields.String,
        'document_version_guid': fields.String,
        'created_by': fields.String,
        'upload_started_date': fields.DateTime,
        'upload_completed_date': fields.DateTime,
        'object_store_version_id': fields.String,
        'file_display_name': fields.String,
    })

IMPORT_NOW_SUBMISSION_DOCUMENT = api.model(
    'ImportNowSubmissionDocument', {
        'import_now_submission_documents_job_id': fields.Integer,
        'document_id': fields.Integer,
        'submission_document_url': fields.String,
        'submission_document_file_name': fields.String,
        'submission_document_type': fields.String,
        'submission_document_message_id': fields.Integer,
        'error': fields.String
    })

IMPORT_NOW_SUBMISSION_DOCUMENTS_JOB = api.model(
    'ImportNowSubmissionDocumentsJob', {
        'import_now_submission_documents_job_id': fields.Integer,
        'start_timestamp': fields.DateTime,
        'end_timestamp': fields.DateTime,
        'create_timestamp': fields.DateTime,
        'start_timestamp': fields.DateTime,
        'complete_timestamp': fields.DateTime,
        'attempt': fields.Integer,
        'create_user': fields.String,
        'celery_task_id': fields.String,
        'now_application_id': fields.String,
        'now_application_guid': fields.String,
        'import_now_submission_documents_job_status_code': fields.String,
        'import_now_submission_documents': fields.List(
            fields.Nested(IMPORT_NOW_SUBMISSION_DOCUMENT)),
        'next_attempt_timestamp': fields.DateTime
    })
