from flask import current_app
from flask_restplus import Resource

from app.extensions import api

from app.api.utils.resources_mixins import UserMixin
from app.api.services.traction_service import TractionService

class VerifiableCredentialWebhookResource(Resource, UserMixin):
    @api.doc(description='Get a list of all active variance application status codes.', params={})
    def post(self,request):
        current_app.logger.warning(f"WEBHOOK: {request}")
