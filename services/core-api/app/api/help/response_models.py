from app.extensions import api
from flask_restx import fields

HELP_MODEL = api.model(
    'Help', {
        'help_guid': fields.String,
        'help_key': fields.String,
        'help_key_params': fields.Raw,
        'content': fields.String,
        'is_draft': fields.Boolean,
        'create_timestamp': fields.DateTime,
        'update_timestamp': fields.DateTime,
        'create_user': fields.String,
        'update_user': fields.String,
    }
)