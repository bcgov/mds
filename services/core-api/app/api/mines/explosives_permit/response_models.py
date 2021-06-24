from app.extensions import api
from flask_restplus import fields

EXPLOSIVES_PERMIT_STATUS_MODEL = api.model(
    'ExplosivesPermitStatus', {
        'explosives_permit_status_code': fields.String,
        'description': fields.String,
        'active_ind': fields.Boolean,
        'display_order': fields.Integer
    })

EXPLOSIVES_PERMIT_DOCUMENT_TYPE_MODEL = api.model(
    'ExplosivesPermitDocumentType', {
        'explosives_permit_document_type_code': fields.String,
        'description': fields.String,
        'active_ind': fields.Boolean,
        'display_order': fields.Integer
    })

EXPLOSIVES_PERMIT_MAGAZINE_TYPE_MODEL = api.model('ExplosivesPermitMagazineType', {
    'explosives_permit_magazine_type_code': fields.String,
    'description': fields.String
})
