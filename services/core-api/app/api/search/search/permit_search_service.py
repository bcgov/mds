import requests
from authlib.integrations.requests_client import OAuth2Session
import os
from app.config import Config

JWT_OIDC_WELL_KNOWN_CONFIG = os.getenv('JWT_OIDC_WELL_KNOWN_CONFIG')

oidc_configuration = requests.get(JWT_OIDC_WELL_KNOWN_CONFIG).json()
SEARCH_ENDPOINT = f'{Config.PERMITS_ENDPOINT}/haystack/query'
import json

class PermitSearchService:

    def __init__(self):
        self.oauth = OAuth2Session(client_id=Config.PERMITS_CLIENT_ID, client_secret=Config.PERMITS_CLIENT_SECRET, token_endpoint=oidc_configuration['token_endpoint'], grant_type='client_credentials')
        

    def search(self, search_term):
        print('searching permits for', search_term)
        results = requests.post(SEARCH_ENDPOINT, json={'query': search_term,'debug': False, 'params': {}}).json()

        print(json.dumps(results, indent=4, sort_keys=True))
        return results['documents']
    
