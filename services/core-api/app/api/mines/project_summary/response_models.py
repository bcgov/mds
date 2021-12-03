from app.extensions import api
from flask_restplus import fields
from app.api.mines.response_models import MINE_DOCUMENT_MODEL

PROJECT_SUMMARY_DOCUMENT_MODEL = api.inherit('ProjectSummaryDocument', MINE_DOCUMENT_MODEL, {
    'project_summary_id': fields.Integer,
    'project_summary_document_type_code': fields.String
})

PROJECT_SUMMARY_MODEL = api.model(
    'ProjectSummary', {
        'project_summary_id': fields.Integer,
        'project_summary_guid': fields.String,
        'project_summary_description': fields.String,
        'project_summary_date': fields.DateTime,
        'mine_guid': fields.String,
        'status_code': fields.String,
        'project_summary_lead_party_guid': fields.String,
        'project_summary_lead_name': fields.String,
        'documents': fields.List(fields.Nested(PROJECT_SUMMARY_DOCUMENT_MODEL)),
        'updated_by': fields.String,
        'updated_timestamp': fields.DateTime
    })

PROJECT_SUMMARY_STATUS_CODE_MODEL = api.model(
    'ProjectSummaryStatusCode', {
        'project_summary_status_code': fields.String,
        'description': fields.String,
        'active_ind': fields.Boolean,
        'display_order': fields.Integer
    })

PROJECT_SUMMARY_DOCUMENT_TYPE_MODEL = api.model(
    'ProjectSummaryDocumentType', {
        'project_summary_document_type_code': fields.String,
        'description': fields.String,
        'active_ind': fields.Boolean,
        'display_order': fields.Integer
    })
