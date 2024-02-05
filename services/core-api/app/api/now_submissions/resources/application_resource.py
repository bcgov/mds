from flask_restx import Resource
from werkzeug.exceptions import NotFound

from app.extensions import api
from app.api.now_submissions.models.application import Application
from app.api.now_submissions.response_models import APPLICATION
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin 


class ApplicationResource(Resource, UserMixin ):
    @api.doc(description='Fetch an application by guid', params={})
    @requires_role_view_all
    @api.marshal_with(APPLICATION, code=200)
    def get(self, application_guid):
        application = Application.find_by_now_application_guid(application_guid)
        if not application:
            raise NotFound('Application not found')

        return application
