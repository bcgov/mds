from app.extensions import api
from flask_restx import fields

MINESPACE_USER_MODEL = api.model(
    'MineDocument', {
        'user_id': fields.String,
        'keycloak_guid': fields.String,
        'email_or_username': fields.String,
        'mines': fields.List(fields.String),
    })
