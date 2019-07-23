from app.extensions import api
from flask_restplus import fields

MINE_INCIDENT_DETERMINATION_TYPE_MODEL = api.model(
    'Mine Incident Determination Type', {
        'mine_incident_determination_type_code': fields.String,
        'description': fields.String,
        'display_order': fields.Integer,
        'active_ind': fields.Boolean
    })

MINE_INCIDENT_FOLLOWUP_INVESTIGATION_TYPE_MODEL = api.model(
    'Mine Incident Followup Investigation Type', {
        'mine_incident_followup_investigation_type_code': fields.String,
        'description': fields.String,
        'display_order': fields.Integer
    })

MINE_INCIDENT_STATUS_CDOE_MODEL = api.model(
    'Mine Incident Status Codes', {
        'mine_incident_status_code': fields.String,
        'description': fields.String,
        'display_order': fields.Integer
    })
