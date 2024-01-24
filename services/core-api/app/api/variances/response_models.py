from app.extensions import api
from flask_restx import fields

MINE_DOCUMENT_MODEL = api.model(
    'MineDocument', {
        'mine_document_guid': fields.String,
        'mine_guid': fields.String,
        'document_manager_guid': fields.String,
        'document_name': fields.String,
    })

VARIANCE_DOCUMENT = api.inherit('VarianceDocumentModel', MINE_DOCUMENT_MODEL, {
    'created_at': fields.Date,
    'variance_document_category_code': fields.String
})

VARIANCE = api.model(
    'Variance', {
        'variance_guid': fields.String,
        'variance_no': fields.Integer,
        'mine_guid': fields.String,
        'mine_name': fields.String,
        'compliance_article_id': fields.Integer,
        'variance_application_status_code': fields.String,
        'applicant_guid': fields.String,
        'inspector_party_guid': fields.String,
        'note': fields.String,
        'parties_notified_ind': fields.Boolean,
        'issue_date': fields.Date,
        'received_date': fields.Date,
        'expiry_date': fields.Date,
        'created_by': fields.String,
        'created_timestamp': fields.DateTime,
        'updated_by': fields.String,
        'updated_timestamp': fields.DateTime,
        'documents': fields.Nested(VARIANCE_DOCUMENT)
    })

PAGINATED_LIST = api.model(
    'List', {
        'current_page': fields.Integer,
        'total_pages': fields.Integer,
        'items_per_page': fields.Integer,
        'total': fields.Integer,
    })

PAGINATED_VARIANCE_LIST = api.inherit('VarianceList', PAGINATED_LIST, {
    'records': fields.List(fields.Nested(VARIANCE)),
})

VARIANCE_APPLICATION_STATUS_CODE = api.model(
    'VarianceApplicationStatusCode', {
        'variance_application_status_code': fields.String,
        'description': fields.String,
        'active_ind': fields.Boolean
    })

VARIANCE_DOCUMENT_CATEGORY_CODE = api.model(
    'VarianceDocumentCategoryCode', {
        'variance_document_category_code': fields.String,
        'description': fields.String,
        'active_ind': fields.Boolean
    })
