from flask import request
from flask_restx import Resource
from werkzeug.exceptions import BadRequest, NotFound

from app.extensions import api
from app.api.now_applications.models.now_application import NOWApplication, NOWApplicationIdentity
from app.api.now_applications.models.now_application_status import NOWApplicationStatus
from app.api.now_applications.response_models import NOW_APPLICATION_STATUS_CODES, NOW_APPLICATION_STATUS_UPDATED_RECORD
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin


class ApplicationStatusResource(Resource, UserMixin):
    @api.doc(description='Get an application\'s status by Notice of Work Number')
    @requires_role_view_all
    @api.marshal_with(NOW_APPLICATION_STATUS_CODES, code=200)
    def get(self, now_number):
        application_identity = NOWApplicationIdentity.find_by_now_number(now_number)
        if not application_identity:
            raise NotFound('Application not found')

        code = application_identity.now_application.now_application_status_code
        return NOWApplicationStatus.find_by_now_application_status_code(code)


class ApplicationStatusListResource(Resource, UserMixin):
    @api.doc(
        description=
        'Get the status of all applications whose statuses have been updated since the provided date',
        params={'status_updated_date_since': 'Status must have been updated since this date'})
    @requires_role_view_all
    @api.marshal_with(NOW_APPLICATION_STATUS_UPDATED_RECORD, code=200)
    def get(self):
        status_updated_date_since = request.args.get('status_updated_date_since')
        if not status_updated_date_since:
            raise BadRequest('status_updated_date_since is a required query parameter')

        now_applications = NOWApplication.query.filter(
            NOWApplication.status_updated_date >= status_updated_date_since).order_by(
                NOWApplication.status_updated_date.desc()).all()

        updated_status_records = []
        for now_application in now_applications:
            updated_status_record = {
                "now_number":
                now_application.now_application_identity.now_number,
                "status_updated_date":
                now_application.status_updated_date,
                "status":
                NOWApplicationStatus.find_by_now_application_status_code(
                    now_application.now_application_status_code)
            }
            updated_status_records.append(updated_status_record)

        return updated_status_records
