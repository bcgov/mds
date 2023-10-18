from app.api.mines.response_models import MINE_DOCUMENT_MODEL
from app.extensions import api
from flask_restplus import fields

EXPLOSIVES_PERMIT_AMENDMENT_MAGAZINE_MODEL = api.model(
    'ExplosivesPermitAmendmentMagazine', {
        'explosives_permit_amendment_magazine_id': fields.Integer,
        'explosives_permit_amendment_id': fields.Integer,
        'explosives_permit_amendment_magazine_type_code': fields.String,
        'type_no': fields.String,
        'tag_no': fields.String,
        'construction': fields.String,
        'latitude': fields.Fixed(decimals=7),
        'longitude': fields.Fixed(decimals=7),
        'length': fields.Fixed,
        'width': fields.Fixed,
        'height': fields.Fixed,
        'quantity': fields.Integer,
        'distance_road': fields.Fixed,
        'distance_dwelling': fields.Fixed,
        'detonator_type': fields.String
    })

EXPLOSIVES_PERMIT_AMENDMENT_DOCUMENT_MODEL = api.inherit('ExplosivesPermitAmendmentDocument', MINE_DOCUMENT_MODEL, {
    'explosives_permit_amendment_id': fields.Integer,
    'explosives_permit_amendment_document_type_code': fields.String
})