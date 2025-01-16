from app.extensions import api
from flask_restx import fields

MINISTRY_CONTACT_MODEL = api.model(
    'MinistryContact', {
        'contact_guid': fields.String,
        'contact_id': fields.Integer,
        'emli_contact_type_code': fields.String,
        'mine_region_code': fields.String,
        'is_major_mine': fields.Boolean,
        'is_general_contact': fields.Boolean,
        'email': fields.String,
        'phone_number': fields.String,
        'first_name': fields.String,
        'last_name': fields.String,
        'fax_number': fields.String,
        'mailing_address_line_1': fields.String,
        'mailing_address_line_2': fields.String,
        'deleted_ind': fields.Boolean,
    })

MINISTRY_CONTACT_TYPE = api.model('MinistryContactType', {
    'emli_contact_type_code': fields.String,
    'description': fields.String,
    'active_ind': fields.Boolean
})