import requests
from app.config import Config

token_url = f"{Config.UNTP_PUBLISHER_BASE_URL}/auth/token"
cred_publish_url = f"{Config.UNTP_PUBLISHER_BASE_URL}/credentials/publish"


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
        return token_resp.json()["access_token"]

    def publish_cred(self, payload: dict) -> requests.Response:
        resp = requests.post(cred_publish_url, json=payload, headers=self.get_headers())
        if resp.status_code == 403:
            # if 403, get new token and try a second time.
            self.get_new_token()
            resp = requests.post(cred_publish_url, json=payload, headers=self.get_headers())
        return resp
