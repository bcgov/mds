import requests
import json

from app.config import Config


class OrgBookService():
    def search_autocomplete(search):
        url = f'{Config.ORGBOOK_API_URL}search/autocomplete'
        params = {'q': search, 'inactive': 'any', 'latest': 'any', 'revoked': 'any'}
        req = requests.get(url=url, params=params)
        data = json.loads(req.text)
        return data