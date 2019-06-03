from app.extensions import api
from flask_restplus import fields

MINE_DOCUMENT_MODEL = api.model(
    'MineDocument', {
        'mine_document_guid': fields.String,
        'mine_guid': fields.String,
        'document_manager_guid': fields.String,
        'document_name': fields.String,
    })

VARIANCE_DOCUMENT = api.inherit(
    'VarianceDocumentModel', MINE_DOCUMENT_MODEL, {
        'created_at': fields.Date
    })

VARIANCE = api.model(
    'Variance', {
        'variance_guid': fields.String,
        'compliance_article_id': fields.Integer,
        'variance_application_status_code': fields.String,
        'applicant_guid': fields.String,
        'inspector_guid': fields.String,
        'note': fields.String,
        'issue_date': fields.Date,
        'received_date': fields.Date,
        'expiry_date': fields.Date,
        'documents': fields.Nested(VARIANCE_DOCUMENT)
    })

PAGINATED_LIST = api.model(
    'List', {
        'current_page': fields.Integer,
        'total_pages': fields.Integer,
        'items_per_page': fields.Integer,
        'total': fields.Integer,
    })

PAGINATED_VARIANCE_LIST = api.inherit(
    'VarianceList', PAGINATED_LIST, {
        'records': fields.List(fields.Nested(VARIANCE)),
    })


VARIANCE_APPLICATION_STATUS_CODE = api.model(
    'VarianceApplicationStatusCode', {
        'variance_application_status_code': fields.String,
        'description': fields.String
    })
