from flask_restx import Resource

from app.extensions import api
from app.api.utils.access_decorators import requires_any_of, MINESPACE_PROPONENT, VIEW_ALL

from app.api.utils.resources_mixins import UserMixin
from app.api.services.traction_service import TractionService

class VerifiableCredentialResource(Resource, UserMixin):
    @api.doc(description='test authorization with traction', params={})
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    def get(self):
        traction_svc=TractionService()
        return {"sample_token":traction_svc.token}
