from flask_restplus import Resource
from werkzeug.exceptions import NotFound

from app.extensions import api
from app.api.now_submissions.now_submission.models.application import NOWApplication
from app.api.now_submissions.response_models import NOW_APPLICATION
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin, ErrorMixin


class NOWApplicationResource(Resource, UserMixin, ErrorMixin):
    @api.doc(description='Fetch an application by guid', params={})
    @requires_role_view_all
    @api.marshal_with(NOW_APPLICATION, code=200)
    def get(self, now_application_guid):
        application = NOWApplication.find_by_now_application_guid(now_application_guid)
        if not application:
            raise NotFound('Application not found')

        return application
