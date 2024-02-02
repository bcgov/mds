from flask_restx import Resource
from werkzeug.exceptions import NotFound

from app.extensions import api
from app.api.now_submissions.models.application_nda import ApplicationNDA
from app.api.now_submissions.response_models import APPLICATIONNDA
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin 


class ApplicationNDAResource(Resource, UserMixin ):
    @api.doc(description='Fetch an application nda by id', params={})
    @requires_role_view_all
    @api.marshal_with(APPLICATIONNDA, code=200)
    def get(self, application_nda_guid):
        raise NotImplemented('Not Implemented')