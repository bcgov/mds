import enum
from flask import current_app, request
from flask_restplus import Resource

from app.extensions import api

from app.api.utils.resources_mixins import UserMixin
from app.api.services.traction_service import TractionService

from app.api.verifiable_credentials.models.connection import PartyVerifiableCredentialConnection

PRESENT_PROOF = "present_proof"
CONNECTIONS = "connections"

class VerifiableCredentialWebhookResource(Resource, UserMixin):
    @api.doc(description='Endpoint to recieve webhooks from Traction.', params={})
    def post(self, topic):
        current_app.logger.warning(f"TRACTION WEBHOOK: {request.__dict__}")
        if topic == CONNECTIONS:
            invitation_id = request.args.get("invi_msg_id")
            vc_conn = PartyVerifiableCredentialConnection.find_by_invitation_id(invitation_id)
            assert vc_conn, f"{invitation_id} not found"
            new_state = request["state"]
            if new_state != vc_conn.connection_state:
                vc_conn.connection_state=new_state
                vc_conn.save()
                current_app.logger.debug(f"Updated party_vc_conn invitation_id={invitation_id} with state={new_state}")
        else:
            current_app.logger.info(f"unknown topic={topic} received, payload ={request}")
