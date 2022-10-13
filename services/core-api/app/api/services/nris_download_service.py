import requests, urllib3, json
from urllib.parse import quote
from flask import Response, stream_with_context, request, current_app
from requests.auth import HTTPBasicAuth
from app.extensions import cache
from app.api.constants import NRIS_REMOTE_TOKEN, TIMEOUT_60_MINUTES
from app.config import Config


def _change_default_cipher():
    requests.packages.urllib3.disable_warnings()
    requests.packages.urllib3.util.ssl_.DEFAULT_CIPHERS += 'HIGH:!DH:!aNULL'
    try:
        requests.packages.urllib3.contrib.pyopenssl.DEFAULT_SSL_CIPHER_LIST += 'HIGH:!DH:!aNULL'
    except AttributeError:
        # no pyopenssl support used / needed / available
        pass


def _get_NRIS_token():
    result = cache.get(NRIS_REMOTE_TOKEN)

    if result is None:

        _change_default_cipher()

        params = {
            'disableDeveloperFilter': 'true',
            'grant_type': 'client_credentials',
            'scope': 'NRISWS.*'
        }
        url = current_app.config['NRIS_REMOTE_TOKEN_URL']
        if url is None:
            raise TypeError('Could not load the NRIS URL.')
        else:
            resp = requests.get(
                url=url,
                params=params,
                auth=(current_app.config['NRIS_REMOTE_CLIENT_ID'],
                      current_app.config['NRIS_REMOTE_CLIENT_SECRET']))
            try:
                resp.raise_for_status()
            except:
                raise

            result = resp.json().get('access_token')
            cache.set(NRIS_REMOTE_TOKEN, result, timeout=TIMEOUT_60_MINUTES)

    return result


class NRISDownloadService():
    def download(file_url, file_name):
        _nris_token = _get_NRIS_token()

        _change_default_cipher()

        file_download_req = requests.get(
            f'{file_url}', stream=True, headers={"Authorization": f"Bearer {_nris_token}"})

        try:
            file_download_req.raise_for_status()
        except:
            current_app.logger.error('Failed to download file from NRIS - HTTP Status: {}, message: {}'.format(
                file_download_req.status_code,
                str(file_download_req.content or '','utf-8')
            ))

            raise

        file_download_resp = Response(
            stream_with_context(
                file_download_req.iter_content(chunk_size=Config.DOCUMENT_UPLOAD_CHUNK_SIZE_BYTES)))


        file_download_resp.headers['Content-Type'] = file_download_req.headers['Content-Type']
        file_download_resp.headers[
            'Content-Disposition'] = f'attachment; filename="{quote(file_name)}"'
        return file_download_resp