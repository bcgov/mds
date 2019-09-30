from flask_restplus import Resource, reqparse, fields
from flask import request
from datetime import datetime

from app.extensions import api
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import requires_role_view_all

from app.api.mines.applications.models.application_status_code import ApplicationStatusCode


class ApplicationStatusCodeResource(Resource, UserMixin):

    application_status_code_model = api.model('ApplicationStatusCode', {
        'application_status_code': fields.String,
        'description': fields.String,
    })

    @api.marshal_with(application_status_code_model, envelope='records', code=200)
    @api.doc(
        description=
        'This endpoint returns a list of all possible document status codes and thier descriptions.'
    )
    @requires_role_view_all
    def get(self):
        return ApplicationStatusCode.find_all_active()
