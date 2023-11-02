import enum
from flask import current_app, request
from flask_restplus import Resource
from app.api.utils.include.user_info import User

from app.extensions import api

from app.api.utils.resources_mixins import UserMixin
from app.api.services.traction_service import TractionService

from app.api.verifiable_credentials.models.connection import PartyVerifiableCredentialConnection
from app.api.verifiable_credentials.models.credentials import PartyVerifiableCredentialMinesActPermit

PRESENT_PROOF = "present_proof"
CONNECTIONS = "connections"
CREDENTIAL_OFFER = "issue_credential"
OUT_OF_BAND = "out_of_band"
PING = "ping"

class VerifiableCredentialWebhookResource(Resource, UserMixin):
    @api.doc(description='Endpoint to recieve webhooks from Traction.', params={})
    def post(self, topic):
        User._test_mode = True  #webhook handling has no row level auth
        webhook_body = request.get_json()
        current_app.logger.debug(f"TRACTION WEBHOOK <topic={topic}>: {webhook_body}")
        if topic == CONNECTIONS:
            invitation_id = webhook_body['invitation_msg_id']
            vc_conn = PartyVerifiableCredentialConnection.query.unbound_unsafe().filter_by(invitation_id=invitation_id).first()
            assert vc_conn, f"connection.invitation_msg_id={invitation_id} not found. webhook_body={webhook_body}"
            vc_conn.connection_id = webhook_body["connection_id"]
            new_state = webhook_body["state"]
            if new_state != vc_conn.connection_state:
                vc_conn.connection_state=new_state
                vc_conn.save()
                current_app.logger.info(f"Updated party_vc_conn connection_id={vc_conn.connection_id} with state={new_state}")
                # 'completed' or 'active' should both be considered successful
                 

        elif topic == OUT_OF_BAND:
                current_app.logger.info(f"out-of-band message invi_msg_id={webhook_body['invi_msg_id']}, state={webhook_body['state']}")
        elif topic == CREDENTIAL_OFFER:
            cred_exch_id = webhook_body["credential_exchange_id"]
            cred_exch_record = PartyVerifiableCredentialMinesActPermit.query.unbound_unsafe().filter_by(cred_exch_id=cred_exch_id).first()
            assert cred_exch_record, f"issue_credential.credential_exchange_id={cred_exch_id} not found. webhook_body={webhook_body}"
            new_state = webhook_body["state"]
            if new_state != cred_exch_record.cred_exch_state:
                cred_exch_record.cred_exch_state=new_state
                cred_exch_record.save()
                current_app.logger.info(f"Updated cred_exch_record cred_exch_id={cred_exch_id} with state={new_state}")
                # 'deleted' or 'credential_acked' should both be considered successful
        elif topic == PING:
                current_app.logger.info(f"TrustPing received={request.get_json()}")
        else:
            current_app.logger.info(f"unknown topic '{topic}'")
