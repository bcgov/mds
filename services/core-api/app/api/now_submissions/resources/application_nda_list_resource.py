from flask_restplus import Resource
from werkzeug.exceptions import NotFound

from app.extensions import api
from app.api.now_submissions.models.application_nda import ApplicationNDA
from app.api.now_submissions.response_models import APPLICATIONNDA
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin 


class ApplicationNDAListResource(Resource, UserMixin ):
    @api.doc(description='Save an application nda')
    @requires_role_view_all
    @api.expect(APPLICATIONNDA)
    def post(self):
        raise NotImplemented('Not Implemented')
        return 