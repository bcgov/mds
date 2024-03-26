from datetime import datetime
from flask import current_app, request
from werkzeug.exceptions import Forbidden
from flask_restx import Resource
from app.api.utils.include.user_info import User

from app.config import Config
from app.extensions import api

from app.api.utils.resources_mixins import UserMixin
from app.api.services.traction_service import TractionService

from app.api.verifiable_credentials.models.connection import PartyVerifiableCredentialConnection
from app.api.verifiable_credentials.models.credentials import PartyVerifiableCredentialMinesActPermit
from app.api.verifiable_credentials.aries_constants import DIDExchangeRequesterState, IssueCredentialIssuerState

from app.api.utils.feature_flag import Feature, is_feature_enabled

PRESENT_PROOF = "present_proof"
CONNECTIONS = "connections"
CREDENTIAL_OFFER = "issue_credential"
OUT_OF_BAND = "out_of_band"
PING = "ping"
ISSUER_CREDENTIAL_REVOKED = "issuer_cred_rev"

class VerifiableCredentialWebhookResource(Resource, UserMixin):
    @api.doc(description='Endpoint to recieve webhooks from Traction.', params={})
    def post(self, topic):
        if not is_feature_enabled(Feature.TRACTION_VERIFIABLE_CREDENTIALS):
            raise NotImplemented()
        
        #custom auth for traction
        if request.headers.get("x-api-key") != Config.TRACTION_WEBHOOK_X_API_KEY:
             return Forbidden("bad x-api-key")
        
        webhook_body = request.get_json()
        current_app.logger.debug(f"webhook received <topic={topic}>: {webhook_body}")
        if "updated_at" not in webhook_body:
            current_app.logger.warn(f"webhook missing updated_at, {webhook_body}")
        else:
            webhook_timestamp = datetime.fromisoformat(webhook_body["updated_at"])

        if topic == CONNECTIONS:
            invitation_id = webhook_body['invitation_msg_id']
            vc_conn = PartyVerifiableCredentialConnection.query.unbound_unsafe().filter_by(invitation_id=invitation_id).first()
            assert vc_conn, f"connection.invitation_msg_id={invitation_id} not found. webhook_body={webhook_body}"
            if not vc_conn.connection_id:
                vc_conn.connection_id = webhook_body["connection_id"]

            if vc_conn.last_webhook_timestamp and vc_conn.last_webhook_timestamp >= webhook_timestamp:
                current_app.logger.warn(f"webhooks out of order catch, ignoring {webhook_body}")
                # already processed a more recent webhook
            else:
                vc_conn.last_webhook_timestamp = webhook_timestamp
                
                new_state = webhook_body["state"]
                if new_state != vc_conn.connection_state and vc_conn.connection_state != DIDExchangeRequesterState.COMPLETED:
                    # 'completed' is the final succesful state.
                    vc_conn.connection_state=new_state
                    vc_conn.save()
                    current_app.logger.info(f"Updated party_vc_conn connection_id={vc_conn.connection_id} with state={new_state}")
                if new_state == "deleted":
                    # if deleted in the wallet (either in traction, or by the other agent)
                    vc_conn.connection_state=new_state
                    vc_conn.save()
                    current_app.logger.info(f"party_vc_conn connection_id={vc_conn.connection_id} was deleted")
                 
        elif topic == OUT_OF_BAND:
                current_app.logger.info(f"out-of-band message invi_msg_id={webhook_body['invi_msg_id']}, state={webhook_body['state']}")
  
        elif topic == CREDENTIAL_OFFER:
            cred_exch_id = webhook_body["credential_exchange_id"]
            cred_exch_record = PartyVerifiableCredentialMinesActPermit.query.unbound_unsafe().filter_by(cred_exch_id=cred_exch_id).first()

            assert cred_exch_record, f"issue_credential.credential_exchange_id={cred_exch_id} not found. webhook_body={webhook_body}"
            new_state = webhook_body["state"]
            if cred_exch_record.last_webhook_timestamp and cred_exch_record.last_webhook_timestamp >= webhook_timestamp:
                current_app.logger.warn(f"webhooks out of order catch, ignoring {webhook_body}")
                # already processed a more recent webhook 
            else:
                cred_exch_record.last_webhook_timestamp = webhook_timestamp
                
                cred_exch_record.cred_exch_state=new_state
                if new_state == IssueCredentialIssuerState.CREDENTIAL_ACKED:
                    cred_exch_record.rev_reg_id = webhook_body["revoc_reg_id"]
                    cred_exch_record.cred_rev_id = webhook_body["revocation_id"]

                cred_exch_record.save()
                current_app.logger.info(f"Updated cred_exch_record cred_exch_id={cred_exch_id} with state={new_state}")

        elif topic == ISSUER_CREDENTIAL_REVOKED:
            current_app.logger.info(f"CREDENTIAL SUCCESSFULLY REVOKED received={request.get_json()}")
            cred_exch = PartyVerifiableCredentialMinesActPermit.find_by_cred_exch_id(webhook_body["cred_ex_id"], unsafe=True)
            cred_exch.permit_amendment.permit.mines_act_permit_vc_locked = True
            cred_exch.save()
  
        elif topic == PING:
            current_app.logger.info(f"TrustPing received={request.get_json()}")
  
        else:
            current_app.logger.info(f"unknown topic '{topic}', webhook_body={webhook_body}") 
