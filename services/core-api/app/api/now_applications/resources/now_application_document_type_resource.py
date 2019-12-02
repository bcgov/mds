from flask_restplus import Resource

from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all

from app.api.utils.resources_mixins import UserMixin
from app.api.now_applications.models.now_application_document_type import NOWApplicationDocumentType
from app.api.now_applications.response_models import NOW_APPLICATION_DOCUMENT_TYPES


class NOWApplicationDocumentTypeResource(Resource, UserMixin):
    @api.doc(description='Get a list of all Notice of Work document types', params={})
    @requires_role_view_all
    @api.marshal_with(NOW_APPLICATION_DOCUMENT_TYPES, code=200, envelope='records')
    def get(self):
        return NOWApplicationDocumentType.active()