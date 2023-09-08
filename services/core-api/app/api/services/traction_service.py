import requests
from typing import Union
from flask import current_app
from uuid import UUID
from app.config import Config

traction_token_url = Config.TRACTION_HOST+"/multitenancy/tenant/"+Config.TRACTION_TENANT_ID+"/token"
traction_oob_create_invitation = Config.TRACTION_HOST+"/out-of-band/create-invitation"

class TractionService():
    token: str

    def __init__(self):
        self.token = self.get_new_token()

    def get_headers(self):
        return {"Authorization":f"Bearer {self.token}"}

    def get_new_token(self):
        payload = {"api_key":Config.TRACTION_WALLET_API_KEY}

        token_resp = requests.post(traction_token_url,json=payload)
        return token_resp.json()["token"]
    
    def create_oob_connection_invitation(self,mine_guid: Union[str,UUID], mine_name: str):
        """Create connnection invitation to send to mine proponent, aries-rfc#0023.

        https://github.com/hyperledger/aries-rfcs/blob/main/features/0023-did-exchange/README.md"""

        payload = {
            "accept": [
                "didcomm/aip1",
                "didcomm/aip2;env=rfc19"
            ],
            "alias": mine_guid,
            "attachments": [],
            "goal": f"To establish a secure connection between BC Government Mines Permitting and the mining company ({mine_name})",
            "goal_code": "issue-vc",
            "handshake_protocols": [
                "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/didexchange/1.0"
            ],
            "my_label": f"Invitation to {mine_guid}",
            "use_public_did": False
        }

        oob_create_resp = requests.post(traction_oob_create_invitation, json=payload,headers=self.get_headers())
        return oob_create_resp.json()["invitation"]