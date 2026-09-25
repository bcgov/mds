import base64
import json

import requests
from app.config import Config
from typing import List, Union, Tuple, Optional, Any
from pydantic import BaseModel, Field, ConfigDict
from flask import current_app

token_url = f"{Config.UNTP_PUBLISHER_BASE_URL}/auth/token"
cred_publish_url = f"{Config.UNTP_PUBLISHER_BASE_URL}/credentials/publish"
cred_revoke_url = f"{Config.UNTP_PUBLISHER_BASE_URL}/credentials/status"


class CredentialPublishRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    template: str
    version: str
    credentialId: Optional[str] = None
    validFrom: Optional[str] = None
    validUntil: Optional[str] = None
    data: dict[str, Any]


class CredentialRevokeRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: Optional[str] = None
    type: Optional[str] = None
    statusPurpose: str
    statusListIndex: str
    statusListCredential: str


class UNTPPublisherService():
    ### class to manage API calls to the UNTP  Publisher, it's a service that will sign and serve UNTP credentials. The data is currently UNTP Digital Conformity Credentials that prove business have mines act permits.
    token: str

    def __init__(self):
        self.token = self.get_new_token()

    def get_headers(self):
        return {"Authorization": f"Bearer {self.token}"}

    def get_new_token(self):
        payload = {
            "client_id": Config.CHIEF_PERMITTING_OFFICER_DID_WEB,
            "client_secret": Config.UNTP_PUBLISHER_CLIENT_SECRET
        }
        token_resp = requests.post(token_url, json=payload)
        token_resp.raise_for_status()
        self.token = token_resp.json()["access_token"]
        return token_resp.json()["access_token"]

    def publish_cred(self, payload: CredentialPublishRequest) -> requests.Response:
        resp = requests.post(
            cred_publish_url, json=payload.model_dump(), headers=self.get_headers())
        if resp.status_code == 403:
            # if 403, get new token and try a second time.
            self.get_new_token()
            resp = requests.post(
                cred_publish_url, json=payload.model_dump(), headers=self.get_headers())
        return resp

    def get_cred_contents(self, credential_url: str) -> dict[str, Any]:
        resp = requests.get(credential_url + "?download=false")
        resp.raise_for_status()

        credential = resp.json()
        credential_id = credential.get("id") if isinstance(credential, dict) else None
        if not isinstance(credential_id, str):
            raise ValueError("Credential response does not contain an ID")

        _, separator, compact_jwt = credential_id.partition(",")
        if not separator:
            raise ValueError("Credential ID does not contain a data URL payload")

        jwt_parts = compact_jwt.split(".")
        if len(jwt_parts) != 3:
            raise ValueError("Credential ID payload is not a compact JWT")

        encoded_payload = jwt_parts[1]
        padded_payload = encoded_payload + "=" * (-len(encoded_payload) % 4)
        return json.loads(base64.urlsafe_b64decode(padded_payload))

    def revoke_cred(self, payload: CredentialRevokeRequest) -> requests.Response:
        resp = requests.post(cred_revoke_url, json=payload.model_dump(), headers=self.get_headers())
        if resp.status_code == 403:
            # if 403, get new token and try a second time.
            self.get_new_token()
            resp = requests.post(
                cred_revoke_url, json=payload.model_dump(), headers=self.get_headers())
        return resp
