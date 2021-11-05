from app.extensions import api
from flask_restplus import fields

MINE_INCIDENT_CATEGORY_MODEL = api.model(
    'Mine Incident Category', {
        'mine_incident_category_code': fields.String,
        'description': fields.String,
        'display_order': fields.Integer,
        'active_ind': fields.Boolean
    })