from flask_restplus import Resource

from app.extensions import api
from app.api.utils.access_decorators import requires_any_of, VIEW_ALL, EDIT_VARIANCE, MINESPACE_PROPONENT

from app.api.utils.resources_mixins import UserMixin
from app.api.services.traction_service import TractionService

class VerifiableCredentialResource(Resource, UserMixin):
    @api.doc(description='Get a list of all active variance application status codes.', params={})
    def get(self):
        traction_svc=TractionService()
        traction_svc.create_oob_connection_invitation()
        return {}
