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
        BC_REGISTRIES_API_URL = Config.BC_REGISTRIES_API_URL
        BC_REGISTRIES_SECRET_TOKEN = Config.BC_REGISTRIES_SECRET_TOKEN

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
        resp = requests.post(
            url=url,
            json=data,
            headers={"X-Apikey": BC_REGISTRIES_SECRET_TOKEN},
            timeout=10,
        )

        if resp.status_code != requests.codes.ok:
            raise BadGateway(f'BC Registries API responded with {resp.status_code}: {resp.reason}')

        try:
            response: BulkBusinessSearchResponse = resp.json()
        except (ValueError, TypeError) as e:
            raise BadGateway('BC Registries API responded with unexpected data.') from e

        return response.get('results', [])


class OrgBookService():

    def search(self, search: str) -> List[OrgBookSearchResult]:
        url = f'{Config.ORGBOOK_API_URL}search/autocomplete'
        params = {'q': search, 'inactive': 'false', 'latest': 'true', 'revoked': 'false'}

        resp = requests.get(url=url, params=params)

        if resp.status_code != requests.codes.ok:
            raise BadGateway(f'OrgBook API responded with {resp.status_code}: {resp.reason}')

        try:
            results: List[OrgBookSearchResult] = json.loads(resp.text)['results']
        except Exception as e:
            raise BadGateway(f'OrgBook API responded with unexpected exception type={type(e)}.')

        return results

    def get_credential(self, credential_id) -> OrgBookCredential:
        url = f'{Config.ORGBOOK_API_URL}credential/{credential_id}/formatted'
        resp = requests.get(url=url)

        if resp.status_code != requests.codes.ok:
            raise BadGateway(f'OrgBook API responded with {resp.status_code}: {resp.reason}')

        try:
            credential: OrgBookCredential = json.loads(resp.text)
        except Exception as e:
            raise BadGateway(f'OrgBook API responded with unexpected exception type={type(e)}.')

        return credential

    def verify_credential(self, credential_id) -> OrgBookVerificationResponse:
        url = f'{Config.ORGBOOK_API_URL}credential/{credential_id}/verify'
        resp = requests.get(url=url)

        if resp.status_code != requests.codes.ok:
            raise BadGateway(f'OrgBook API responded with {resp.status_code}: {resp.reason}')

        try:
            verification: OrgBookVerificationResponse = json.loads(resp.text)
        except Exception as e:
            raise BadGateway(f'OrgBook API responded with unexpected exception type={type(e)}.')

        return verification
