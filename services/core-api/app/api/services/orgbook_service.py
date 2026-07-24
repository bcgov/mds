import json
import requests
from typing import List
from werkzeug.exceptions import BadGateway
from app.config import Config
from app.api.services.orgbook_types import (
    BulkBusinessSearchResponse,
    BusinessSearchResult,
    OrgBookSearchResultItem,
)


class BCRegistriesService():

    def search(self, search: str) -> List[OrgBookSearchResultItem]:
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
        resp = requests.get(
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

    def _make_get(self, *args) -> dict:
        resp = requests.get(*args, timeout=10)
        if resp.status_code != requests.codes.ok:
            raise BadGateway(f'OrgBook API responded with {resp.status_code}: {resp.reason}')
        try:
            return resp.json()
        except requests.exceptions.JSONDecodeError as e:
            raise BadGateway(f'OrgBook API responded with unexpected exception type={type(e)}.')

    def search(self, search: str) -> List[OrgBookSearchResultItem]:
        url = f'{Config.ORGBOOK_API_URL}/v4/search/autocomplete'
        params = {'q': search, 'inactive': 'false', 'revoked': 'false'}

        resp_data = self._make_get(url, params)
        results: List[OrgBookSearchResultItem] = [{
            "registration_id": x["topic_source_id"],
            "credential_id": x["credential_id"],
            "text": x["value"]
        } for x in resp_data['results'] if x["sub_type"] == "entity_name"]

        return results

    def get_business_details(self, registration_id) -> dict:
        search_url = f'{Config.ORGBOOK_API_URL}/v4/search/autocomplete'

        params = {'q': registration_id, 'inactive': 'false', 'revoked': 'false'}

        search_results = self._make_get(search_url, params).get("results", [])
        if not search_results:
            raise BadGateway(
                f"OrgBook API returned no results for registration_id={registration_id}")
        search_result = search_results[0]        # best match
        detail_url = f'{Config.ORGBOOK_API_URL}/v4/credential/' + search_result["credential_id"]
        return self._make_get(detail_url, params)

    def get_credential(self, credential_id):
        url = f'{Config.ORGBOOK_API_URL}/v4/credential/{credential_id}'
        credential = self._make_get(url)

        return credential
