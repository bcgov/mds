import io
from urllib.parse import urlparse

import requests
from app.constants import TIMEOUT_60_MINUTES, VFCBC_COOKIES
from app.extensions import cache
from flask import current_app


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

        cooks = loginfcc_req.cookies.get_dict()

        if not cooks or 'SMSESSION' not in cooks:
            raise Exception('vFCBC login failed! SMSESSION cookie not found')

class VFCBCDownloadService():
    @staticmethod
    def download(file_url, use_cache=True):
        """
        Download a file from VFCBC.
        
        Args:
            file_url (str): URL of the file to download
            use_cache (bool): Whether to use/update the cached cookies or always perform a fresh login
                            Default is True (use cache)
        
        Returns:
            BytesIO: File content as a BytesIO object
        """
        download_session = requests.session()

        if use_cache:
            _vfcbc_cookies = cache.get(VFCBC_COOKIES)
            if _vfcbc_cookies is None:
                vfcbc_login(download_session)
                cache.set(VFCBC_COOKIES, download_session.cookies, timeout=TIMEOUT_60_MINUTES)
            else:
                download_session.cookies = _vfcbc_cookies
        else:
            # Always perform a fresh login when use_cache is False
            vfcbc_login(download_session)
            
        resp = download_session.get(file_url, stream=True)
        if resp.status_code != requests.codes.ok:
            raise Exception(f'vFCBC file download failed! Error {resp.status_code}: {resp.content}')
        return io.BytesIO(resp.content)
