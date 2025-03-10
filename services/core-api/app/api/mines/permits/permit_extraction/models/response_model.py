from app.extensions import api
from flask_restx import fields

PERMIT_CONDITION_EXTRACTION_TASK = api.model(
    'PermitExtractionTask', {
        'create_timestamp': fields.DateTime,
        'permit_extraction_task_id': fields.String,
        'task_id': fields.String,
        'task_status': fields.String,
        'permit_amendment_guid': fields.String,
        'permit_amendment_document_guid': fields.String,
        'core_status_task_id': fields.String
    })
