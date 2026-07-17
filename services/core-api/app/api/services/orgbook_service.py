import json
import requests
from typing import List
from werkzeug.exceptions import BadGateway
from app.config import Config
from app.api.services.orgbook_types import (
    BulkBusinessSearchResponse,
    BusinessSearchResult,
    OrgBookCredential,
    OrgBookSearchResult,
    OrgBookVerificationResponse,
)


class BCRegistriesService():

    def search(self, search: str) -> List[BusinessSearchResult]:
        BC_REGISTRIES_API_URL = "https://sandbox.api.connect.gov.bc.ca/registry-search"
        BC_REGISTRIES_SECRET_TOKEN = "YOUR_SECRET_TOKEN"

        data = {
            "query": {
                "value": search,
                "name": "",
                "identifier": "",
                "bn": ""
            },
            "categories": {
                "legalType": ["BC", "BEN", "CP"],
                "status": ["ACTIVE"]
            },
            "rows": 1,
            "start": 1
        }

        url = f'{BC_REGISTRIES_API_URL}/api/v2/search/businesses'
        resp = requests.post(url=url, json=data, headers={"X-Apikey": BC_REGISTRIES_SECRET_TOKEN})
        print(resp.content)
        response: BulkBusinessSearchResponse = json.loads(resp.text)
        return response['results']


class OrgBookService():

    def search(self, search: str) -> List[OrgBookSearchResult]:
        url = f'{Config.ORGBOOK_API_URL}search/autocomplete'
        params = {'q': search, 'inactive': 'false', 'latest': 'true', 'revoked': 'false'}

        resp = requests.get(url=url, params=params)

        if resp.status_code != requests.codes.ok:
            raise BadGateway(f'OrgBook API responded with {resp.status_code}: {resp.reason}')

        try:
            results: List[OrgBookSearchResult] = json.loads(resp.text)['results']
        except:
            raise BadGateway('OrgBook API responded with unexpected data.')

        return results

    def get_credential(self, credential_id) -> OrgBookCredential:
        url = f'{Config.ORGBOOK_API_URL}credential/{credential_id}/formatted'
        resp = requests.get(url=url)

        if resp.status_code != requests.codes.ok:
            raise BadGateway(f'OrgBook API responded with {resp.status_code}: {resp.reason}')

        try:
            credential: OrgBookCredential = json.loads(resp.text)
        except:
            raise BadGateway('OrgBook API responded with unexpected data.')

        return credential

    def verify_credential(self, credential_id) -> OrgBookVerificationResponse:
        url = f'{Config.ORGBOOK_API_URL}credential/{credential_id}/verify'
        resp = requests.get(url=url)

        if resp.status_code != requests.codes.ok:
            raise BadGateway(f'OrgBook API responded with {resp.status_code}: {resp.reason}')

        try:
            verification: OrgBookVerificationResponse = json.loads(resp.text)
        except:
            raise BadGateway('OrgBook API responded with unexpected data.')

        return verification
