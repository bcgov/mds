import requests, json
from urllib.parse import quote
from flask import Response, stream_with_context, request, current_app
from requests.auth import HTTPBasicAuth
from app.extensions import cache
from app.api.constants import NROS_TOKEN, TIMEOUT_60_MINUTES


class NROSDownloadService():
    def download(file_url):
        _nros_token = cache.get(NROS_TOKEN)
        if _nros_token is None:
            _nros_client_id = current_app.config['NROS_CLIENT_ID']
            _nros_client_secret = current_app.config['NROS_CLIENT_SECRET']
            _nros_token_url = current_app.config['NROS_TOKEN_URL']

            _nros_auth = HTTPBasicAuth(_nros_client_id, _nros_client_secret)
            _nros_resp = requests.get(_nros_token_url, auth=_nros_auth)
            _nros_resp_body = json.loads(_nros_resp.text)
            _nros_token = _nros_resp_body["access_token"]
            cache.set(NROS_TOKEN, _nros_token, timeout=TIMEOUT_60_MINUTES)

        file_info_req = requests.get(
            file_url, stream=True, headers={"Authorization": f"Bearer {_nros_token}"})
        file_info_body = json.loads(file_info_req.text)

        file_download_req = requests.get(
            f'{file_url}/content', stream=True, headers={"Authorization": f"Bearer {_nros_token}"})

        file_download_resp = Response(
            stream_with_context(file_download_req.iter_content(chunk_size=2048)))

        file_download_resp.headers['Content-Type'] = file_download_req.headers['Content-Type']
        file_download_resp.headers[
            'Content-Disposition'] = f'attachment; filename="{quote(file_info_body["filename"])}"'
        return file_download_resp