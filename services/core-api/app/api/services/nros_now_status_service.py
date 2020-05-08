import requests, json
from flask import Response, current_app
from requests.auth import HTTPBasicAuth

from app.extensions import cache
from app.config import Config
from app.api.constants import NROS_NOW_TOKEN, TIMEOUT_24_HOURS


class NROSNOWStatusService():

    nros_now_url = f'{Config.NROS_NOW_URL}/status'
    nros_now_token_pass = Config.NROS_NOW_CLIENT_SECRET
    nros_now_token_user = Config.NROS_NOW_CLIENT_ID
    nros_now_token_url = Config.NROS_NOW_TOKEN_URL

    @classmethod
    def nros_now_status_update(cls, now_number, status, status_updated_date):

        token = cache.get(NROS_NOW_TOKEN)
        if not token:
            token = cls.get_nros_now_token()
            cache.set(NROS_NOW_TOKEN, token, TIMEOUT_24_HOURS)

        data = {
            "statusList": {
                "applicationId": now_number.replace('-', ''),
                "applicationType": 'Mines Notice of Work',
                "status": status,
                "statusUpdatedDate": status_updated_date,
                "statusChangeReason": "",
                "seqNumber": None
            }
        }

        resp = requests.post(
            url=cls.nros_now_url,
            headers={
                'Authorization': f'Bearer {token}',
                'Content-type': 'application/json',
                'lobName': 'MMS'
            },
            data=json.dumps(data))
        current_app.logger.info(f'Status for NoW Number{now_number} pushed to NROS')
        return

    @classmethod
    def get_nros_now_token(cls):
        auth = HTTPBasicAuth(cls.nros_now_token_user, cls.nros_now_token_pass)
        resp = requests.get(cls.nros_now_token_url, auth=auth)

        resp_body = json.loads(resp.text)

        token = resp_body["access_token"]

        return token
