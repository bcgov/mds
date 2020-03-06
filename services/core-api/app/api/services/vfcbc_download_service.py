import requests
from flask import Response, stream_with_context, request, current_app
from urllib.parse import urlparse, quote
from app.extensions import cache
from app.api.constants import VFCBC_COOKIES, TIMEOUT_60_MINUTES


def vfcbc_login(download_session):
    _vfcbc_client_id = current_app.config['VFCBC_CLIENT_ID']
    _vfcbc_client_secret = current_app.config['VFCBC_CLIENT_SECRET']

    auth_test_url = "https://j200.gov.bc.ca/int/vfcbc/Download.aspx"
    auth_test_req = download_session.get(auth_test_url, allow_redirects=False)

    if auth_test_req.status_code == 302:
        login_netloc = urlparse(auth_test_req.headers["Location"]).netloc

        login_page_url = f'https://{login_netloc}/clp-cgi/int/logon.cgi?flags=1000:1,0&TARGET=$SM$https%3a%2f%2fj200%2egov%2ebc%2eca%2fint%2fvfcbc%2fDownload%2easpx'
        download_session.get(login_page_url)

        prelogin_url = f'https://{login_netloc}/clp-cgi/preLogon.cgi'
        prelogin_data = {
            'instance': 'instance_int',
            'user': _vfcbc_client_id,
            'password': _vfcbc_client_secret
        }
        download_session.post(prelogin_url, data=prelogin_data)

        loginfcc_url = f'https://{login_netloc}/clp-cgi/int01/logon.fcc'
        loginfcc_data = {
            'SMENC': 'ISO-8859-1',
            'SMLOCALE': 'US-EN',
            'target': '/clp-cgi/int01/private/postLogon.cgi',
            'smauthreason': '0',
            'smagentname': '',
            'user': _vfcbc_client_id,
            'password': _vfcbc_client_secret
        }
        loginfcc_req = download_session.post(loginfcc_url, data=loginfcc_data)

        postlogin_url = f'https://{login_netloc}/clp-cgi/int01/private/postLogon.cgi'
        postlogin_req = download_session.get(postlogin_url)


class VFCBCDownloadService():
    def download(file_url, file_name):
        download_session = requests.session()

        _vfcbc_cookies = cache.get(VFCBC_COOKIES)
        if _vfcbc_cookies is None:
            vfcbc_login(download_session)
            cache.set(VFCBC_COOKIES, download_session.cookies, timeout=TIMEOUT_60_MINUTES)
        else:
            download_session.cookies = _vfcbc_cookies

        file_download_req = download_session.get(file_url, stream=True)

        file_download_resp = Response(
            stream_with_context(file_download_req.iter_content(chunk_size=2048)))

        file_download_resp.headers['Content-Type'] = file_download_req.headers['Content-Type']
        file_download_resp.headers[
            'Content-Disposition'] = f'attachment; filename="{quote(file_name)}"'

        return file_download_resp