from app.extensions import api
from flask_restplus import fields

PROJECT_CONTACT_MODEL = api.model(
    'ProjectContact', {
        'project_contact_guid': fields.String,
        'project_guid': fields.String,
        'name': fields.String,
        'job_title': fields.String,
        'company_name': fields.String,
        'email': fields.String,
        'phone_number': fields.String,
        'phone_extension': fields.String,
        'is_primary': fields.Boolean
    })

PROJECT_MODEL = api.model(
    'Project', {
        'project_guid': fields.String,
        'project_id': fields.Integer,
        'project_title': fields.String,
        'mine_name': fields.String,
        'mine_guid': fields.String,
        'proponent_project_id': fields.String,
        'contacts': fields.List(fields.Nested(PROJECT_CONTACT_MODEL)),
        'update_user': fields.String,
        'update_timestamp': fields.DateTime,
        'create_user': fields.String,
        'create_timestamp': fields.DateTime
    })
