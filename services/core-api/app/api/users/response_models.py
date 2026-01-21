from app.extensions import api
from flask_restx import fields

MINESPACE_USER_ROLE = api.model(
    'MinespaceUserRole', {
        'mine_guid': fields.String,
        'minespace_user_role_code': fields.String,
        'is_pending': fields.Boolean,
        'minespace_user_role_xref_guid': fields.String,
    })

MINESPACE_USER_DOCUMENT = api.model(
    'MinespaceUserDocument', {
        'minespace_user_document_xref_guid': fields.String,
        'minespace_user_id': fields.Integer,
        'document_manager_guid': fields.String,
        'document_name': fields.String,
        'upload_date': fields.Date,
    })

MINESPACE_USER_PERMITTEE = api.model(
    'MinespaceUserPermittee', {
        'name': fields.String,
        'business': fields.String,
        'title': fields.String,
        'email': fields.String,
        'phone': fields.String,
    })

MINESPACE_USER_ACCESS_REQUEST = api.model(
    'MinespaceUserAccessRequest', {
        'minespace_user_request_id': fields.Integer,
        'role_requested': fields.String,
        'business_name': fields.String,
        'permittee': fields.Nested(MINESPACE_USER_PERMITTEE),
        'submitted_timestamp': fields.DateTime(dt_format='iso8601'),
        'request_status': fields.Integer,
        'access_request_text': fields.String,
        'ministry_contact': fields.String,
    })

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
        'user_roles': fields.List(fields.Nested(MINESPACE_USER_ROLE)),
        'documents': fields.List(fields.Nested(MINESPACE_USER_DOCUMENT)),
        'access_request': fields.Nested(MINESPACE_USER_ACCESS_REQUEST, allow_null=True),
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