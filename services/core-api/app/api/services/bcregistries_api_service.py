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

        return []
