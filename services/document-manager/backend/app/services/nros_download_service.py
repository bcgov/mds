import requests, json, io
from flask import current_app
from requests.auth import HTTPBasicAuth
from app.extensions import cache
from app.constants import NROS_TOKEN, TIMEOUT_60_MINUTES


class NROSDownloadService():
    def download(file_url):
        _nros_token = None   #cache.get(NROS_TOKEN)
        if _nros_token is None:
            _nros_client_id = current_app.config['NROS_CLIENT_ID']
            _nros_client_secret = current_app.config['NROS_CLIENT_SECRET']
            _nros_token_url = current_app.config['NROS_TOKEN_URL']
            current_app.logger.info(f'{_nros_client_id}')
            current_app.logger.info(f'{_nros_client_secret}')
            current_app.logger.info(f'{_nros_token_url}')
            _nros_auth = HTTPBasicAuth(_nros_client_id, _nros_client_secret)
            _nros_resp = requests.get(_nros_token_url, auth=_nros_auth)
            _nros_resp_body = json.loads(_nros_resp.text)
            _nros_token = _nros_resp_body['access_token']
            cache.set(NROS_TOKEN, _nros_token, timeout=TIMEOUT_60_MINUTES)

        # TODO: Check the response code and for errors to ensure the actual file was retrieved!
        file_download_req = requests.get(
            f'{file_url}/content', stream=True, headers={"Authorization": f"Bearer {_nros_token}"})
        current_app.logger.info(f'file_download_req: {file_download_req.__dict__}')

        return io.BytesIO(file_download_req.content)
