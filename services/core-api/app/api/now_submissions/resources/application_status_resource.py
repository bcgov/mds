from flask_restplus import Resource, fields
from werkzeug.exceptions import NotFound

from app.extensions import api
from app.api.now_submissions.models.application import Application
from app.api.now_submissions.response_models import APPLICATION_STATUS
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin


class ApplicationStatusResource(Resource, UserMixin):
    @api.doc(description='Get an application\'s status by messageid')
    @requires_role_view_all
    @api.marshal_with(APPLICATION_STATUS, code=200)
    def get(self, messageid):
        application = Application.find_by_messageid(messageid)
        if not application:
            raise NotFound('Application not found')

        return {'status': application.status}
