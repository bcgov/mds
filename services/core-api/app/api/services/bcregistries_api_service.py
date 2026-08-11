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
            "legalType": ["[\"BC\", \"BEN\", \"CP\"]"],
            "status": ["[\"ACTIVE\"]"],
            "categories": {},
            "rows": 1,
            "start": 1
        }

        url = f'{BC_REGISTRIES_API_URL}/api/v2/search/businesses'
        resp = requests.post(
            url=url,
            json=data,
            headers={
                "x-apikey": BC_REGISTRIES_SECRET_TOKEN,
                "account-id": ""
            },
            timeout=10,
        )

        if resp.status_code != requests.codes.ok:
            print(resp.text)
            raise BadGateway(f'BC Registries API responded with {resp.status_code}: {resp.reason}')

        try:
            response: BulkBusinessSearchResponse = resp.json()["searchResults"]
        except (ValueError, TypeError) as e:
            raise BadGateway('BC Registries API responded with unexpected data.') from e

        return [{
            "registration_id": r["identifier"],
            "text": r["name"],
            "credential_id": None
        } for r in response["results"]]
