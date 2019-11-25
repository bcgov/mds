import requests
import json
from flask import Response, stream_with_context, request, current_app
from requests.auth import HTTPBasicAuth
from app.extensions import cache
from app.api.constants import NRIS_REMOTE_TOKEN, TIMEOUT_60_MINUTES

def _get_NRIS_token():
    result = cache.get(NRIS_REMOTE_TOKEN)

    if result is None:
        params = {
            'disableDeveloperFilter': 'true',
            'grant_type': 'client_credentials',
            'scope': 'NRISWS.*'
        }
        url = current_app.config['NRIS_TOKEN_URL']
        if url is None:
            raise TypeError('Could not load the NRIS URL.')
        else:
            resp = requests.get(
                url=url,
                params=params,
                auth=(current_app.config['NRIS_CLIENT_ID'], current_app.config['NRIS_CLIENT_SECRET']))
            try:
                resp.raise_for_status()
            except:
                raise

            result = resp.json().get('access_token')
            cache.set(NRIS_TOKEN, result, timeout=TIMEOUT_12_HOURS)

    return result

class NRISDownloadService():
    def download(documenturl):
        return "OK"
        _nris_token = _get_NRIS_token()

        file_download_req = requests.get(
            f'{file_url}', stream=True, headers={"Authorization": f"Bearer {_nris_token}"})

        file_download_resp = Response(
            stream_with_context(file_download_req.iter_content(chunk_size=2048)))

        file_download_resp.headers['Content-Type'] = file_download_req.headers['Content-Type']
        file_download_resp.headers[
            'Content-Disposition'] = f'attachment; filename="{file_info_body["filename"]}"'
        return file_download_resp