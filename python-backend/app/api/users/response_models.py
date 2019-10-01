from app.extensions import api
from flask_restplus import fields

MINESPACE_USER_MODEL = api.model(
    'MineDocument', {
        'user_id': fields.String,
        'keycloak_guid': fields.String,
        'email': fields.String,
        'mines': fields.List(fields.String),
    })
