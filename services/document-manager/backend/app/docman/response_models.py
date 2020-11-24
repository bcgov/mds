from app.extensions import api
from flask_restplus import fields

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
