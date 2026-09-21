import os

from oauthlib.oauth2 import BackendApplicationClient
from requests_oauthlib import OAuth2Session


def build_permits_oauth_session():
    client_id = os.getenv('PERMITS_CLIENT_ID')
    client_secret = os.getenv('PERMITS_CLIENT_SECRET')
    token_url = os.getenv('TOKEN_URL')

    if not client_id or not client_secret or not token_url:
        return None

    oauth_client = BackendApplicationClient(client_id=client_id)
    oauth_session = OAuth2Session(client=oauth_client)
    oauth_session.fetch_token(token_url=token_url, client_secret=client_secret)
    return oauth_session