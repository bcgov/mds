import requests
from typing import Union
from flask import current_app
from uuid import UUID
from app.config import Config
from app.api.parties.party.models.party import Party
from app.api.verifiable_credentials.aries_constants import DIDExchangeRequesterState
from app.api.verifiable_credentials.models.connection import PartyVerifiableCredentialConnection


traction_token_url = Config.TRACTION_HOST+"/multitenancy/tenant/"+Config.TRACTION_TENANT_ID+"/token"
traction_oob_create_invitation = Config.TRACTION_HOST+"/out-of-band/create-invitation"
traction_offer_credential = Config.TRACTION_HOST+"/issue-credential/send-offer"
revoke_credential_url = Config.TRACTION_HOST+"/revocation/revoke"

class VerificableCredentialWorkflowError(Exception):
    pass

class TractionService():
    token: str

    def __init__(self):
        self.token = self.get_new_token()

    def get_headers(self):
        return {"Authorization":f"Bearer {self.token}"}

    def get_new_token(self):
        payload = {"api_key":Config.TRACTION_WALLET_API_KEY}
        token_resp = requests.post(traction_token_url,json=payload)
        token_resp.raise_for_status()
        return token_resp.json()["token"]
    
    def create_oob_connection_invitation(self,party: Party):
        """Create connnection invitation to send to mine proponent, aries-rfc#0023.

        https://github.com/hyperledger/aries-rfcs/blob/main/features/0023-did-exchange/README.md"""

        vc_invitations = PartyVerifiableCredentialConnection.find_by_party_guid(party.party_guid)
        active_invitation = [inv for inv in vc_invitations if inv.connection_state == DIDExchangeRequesterState.COMPLETED]
        if active_invitation: 
            current_app.logger.error(f"party_guid={party.party_guid} already has wallet connection, do not create another one")
            raise VerificableCredentialWorkflowError("cannot make invitation if mine already has active connection")
        
        #only have suffix if non-prod environment
        my_label_suffix = (" "+Config.ENVIRONMENT_NAME) if (Config.ENVIRONMENT_NAME in ["test","dev"]) else ""
        payload = {
            "accept": [
                "didcomm/aip1",
                "didcomm/aip2;env=rfc19"
            ],
            "alias": f"{party.party_name}:{str(party.party_guid)}",
            "attachments": [],
            "goal": f"To establish a secure connection between BC Government Mines Permitting and the mining company ({party.party_name})",
            "goal_code": "issue-vc",
            "handshake_protocols": [
                "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/didexchange/1.0"
            ],
            "my_label": f"BC Mines - Chief Permitting Officer{my_label_suffix}",
            "use_public_did": False
        }

        oob_create_resp = requests.post(traction_oob_create_invitation, json=payload,headers=self.get_headers())
        assert oob_create_resp.status_code == 200, f"oob_create_resp={oob_create_resp.json()}"

        response = oob_create_resp.json()
        current_app.logger.info(f"oob invitation create reponse from traction = {response}")
        new_traction_connection = PartyVerifiableCredentialConnection(party_guid = party.party_guid, invitation_id = response["invitation"]["@id"])
        new_traction_connection.save()
        
        return response
    
    def offer_mines_act_permit(self, connection_id, attributes):

        payload = {
            "auto_issue": True,
            "comment": "VC to provide proof of a permit and some basic details",
            "connection_id": str(connection_id),
            "cred_def_id": Config.CRED_DEF_ID_MINES_ACT_PERMIT,
            "credential_preview": {
                "@type": "issue-credential/1.0/credential-preview",
                "attributes":attributes,
            },
            "trace": True
        }

        cred_offer_resp = requests.post(traction_offer_credential, json=payload,headers=self.get_headers())
        assert cred_offer_resp.status_code == 200, f"cred_offer_resp={cred_offer_resp.json()}"
        return cred_offer_resp.json()

    def revoke_credential(self,connection_id, rev_reg_id, cred_rev_id, comment):
        payload = {
            "comment":comment,
            "connection_id":connection_id, 
            "rev_reg_id":rev_reg_id,
            "cred_rev_id":cred_rev_id
        }
        revoke_resp = requests.post(revoke_credential_url, json=payload,headers=self.get_headers())
        assert revoke_resp.status_code == 200, f"revoke_resp={revoke_resp.json()}"
        return revoke_resp.json()
