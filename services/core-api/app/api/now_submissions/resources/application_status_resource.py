from flask_restplus import Resource
from werkzeug.exceptions import NotFound

from app.extensions import api
from app.api.now_applications.models.now_application import NOWApplication, NOWApplicationIdentity
from app.api.now_applications.models.now_application_status import NOWApplicationStatus
from app.api.now_applications.response_models import NOW_APPLICATION_STATUS_CODES, NOW_APPLICATION_STATUS_UPDATED_RECORD
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin


class ApplicationStatusResource(Resource, UserMixin):
    @api.doc(description='Get an application\'s status by messageid')
    @requires_role_view_all
    @api.marshal_with(NOW_APPLICATION_STATUS_CODES, code=200)
    def get(self, messageid):
        application_identity = NOWApplicationIdentity.find_by_messageid(messageid)
        if not application_identity:
            raise NotFound('Application not found')

        code = application_identity.now_application.now_application_status_code
        return NOWApplicationStatus.find_by_now_application_status_code(code)


class ApplicationStatusUpdatesSinceResource(Resource, UserMixin):
    @api.doc(description='Get the statuses of applications ')
    @requires_role_view_all
    @api.marshal_with(NOW_APPLICATION_STATUS_UPDATED_RECORD, code=200)
    def get(self, status_updated_date):
        now_applications = NOWApplication.query.filter(
            NOWApplication.status_updated_date >= status_updated_date).order_by(
                NOWApplication.status_updated_date.desc()).all()

        updated_status_records = []
        for now_application in now_applications:
            updated_status_record = {
                "messageid":
                now_application.now_application_identity.messageid,
                "status_updated_date":
                now_application.status_updated_date,
                "status":
                NOWApplicationStatus.find_by_now_application_status_code(
                    now_application.now_application_status_code)
            }
            updated_status_records.append(updated_status_record)

        return updated_status_records
