from flask_restplus import Resource, reqparse, fields
from flask import request
from datetime import datetime

from app.extensions import api
from ..models.application_status_code import ApplicationStatusCode
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import requires_role_view_all


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
        application_status_codes = ApplicationStatusCode.find_all_active_application_status_code()
        if application_status_codes:
            result = application_status_codes
        else:
            result = []
        return result
