from app.api.mines.explosives_permit.response_models import EXPLOSIVES_PERMIT_MODEL
from app.extensions import api
from flask_restplus import fields

EXPLOSIVES_PERMIT_AMENDMENT_MODEL = api.model(
    'ExplosivesPermitAmendment', {
        'explosives_permit_amendment_id': fields.Integer,
        'explosives_permit_amendment_guid': fields.String,
        'mine_guid': fields.String,
        'permit_guid': fields.String,
        'now_application_guid': fields.String,
        'explosives_permit_id': fields.Integer,
        'now_application_guid': fields.String,
        'issuing_inspector_party_guid': fields.String,
        'issuing_inspector_name': fields.String,
        'mine_manager_mine_party_appt_id': fields.Integer,
        'permittee_mine_party_appt_id': fields.Integer,
        'mine_manager_name': fields.String,
        'permittee_name': fields.String,
        'application_status': fields.String,
        'permit_number': fields.String,
        'issue_date': fields.Date,
        'expiry_date': fields.Date,
        'application_number': fields.String,
        'application_date': fields.Date,
        'originating_system': fields.String,
        'received_timestamp': fields.DateTime,
        'decision_timestamp': fields.DateTime,
        'decision_reason': fields.String,
        'latitude': fields.Fixed(decimals=7),
        'longitude': fields.Fixed(decimals=7),
        'is_closed': fields.Boolean,
        'closed_timestamp': fields.DateTime,
        'closed_reason': fields.String,
        'total_detonator_quantity': fields.Integer,
        'total_explosive_quantity': fields.Integer,
        'description': fields.String,
        'explosives_permit': fields.Nested(EXPLOSIVES_PERMIT_MODEL)
    })