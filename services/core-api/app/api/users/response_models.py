from app.extensions import api
from flask_restx import fields

MINESPACE_USER_MODEL = api.model(
    'MinespaceUser', {
        'user_id': fields.Integer,
        'sub': fields.String,
        'email': fields.String,
        'given_name': fields.String,
        'family_name': fields.String,
        'display_name': fields.String,
        'bceid_username': fields.String,
        'identity_provider': fields.String,
        'last_logged_in': fields.DateTime,
        'mines': fields.List(fields.String),
    })

USER_MODEL = api.model(
    'User', {
        'sub': fields.String,
        'email': fields.String,
        'given_name': fields.String,
        'family_name': fields.String,
        'display_name': fields.String,
        'last_logged_in': fields.DateTime,
    }
)