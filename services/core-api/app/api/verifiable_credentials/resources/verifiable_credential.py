from flask_restplus import Resource

from app.extensions import api

from app.api.utils.resources_mixins import UserMixin
from app.api.services.traction_service import TractionService

class VerifiableCredentialResource(Resource, UserMixin):
    @api.doc(description='', params={})
    def get(self):
        traction_svc=TractionService()
        return {"sample_token":traction_svc.token}
