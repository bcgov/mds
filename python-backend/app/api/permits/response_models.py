from app.extensions import api
from flask_restplus import fields

PERMIT_AMENDMENT_DOCUMENT_MODEL = api.model(
    'Permit Amendment Document', {
        'permit_amendment_document_guid': fields.String,
        'document_name': fields.String,
        'mine_guid': fields.String,
        'document_manager_guid': fields.String,
        'active_ind': fields.Boolean
    })

PERMIT_AMENDMENT_MODEL = api.model(
    'Permit Amendment',
    {
        'permit_amendment_guid': fields.String,
        'permit_guid': fields.String,
        'permit_amendment_status_code': fields.String,
        'permit_amendment_type_code': fields.String,
        'received_date': fields.Date,
        'issue_date': fields.Date,
        'authorization_end_date': fields.Date,
        #'permit_amendment_status_description': fields.String,
        #'permit_amendment_type_description': fields.String,
        'description': fields.String,
        'related_documents': fields.List(fields.Nested(PERMIT_AMENDMENT_DOCUMENT_MODEL))
    })

PERMIT_MODEL = api.model(
    'Permit', {
        'permit_guid': fields.String,
        'mine_guid': fields.String,
        'permit_no': fields.String,
        'permit_status_code': fields.String,
        'permit_status_code_description': fields.String,
        'permit_amendments': fields.List(fields.Nested(PERMIT_AMENDMENT_MODEL)),
    })