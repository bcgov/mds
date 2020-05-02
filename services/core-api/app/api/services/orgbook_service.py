import requests
import json

from app.config import Config


class OrgBookService():
    def search_autocomplete_list(search):
        url = f'{Config.ORGBOOK_API_URL}search/autocomplete'
        params = {'q': search, 'inactive': False, 'latest': True, 'revoked': False}
        req = requests.get(url=url, params=params)
        data = json.loads(req.text)
        return data

    def credential_retrieve_formatted(credential_id):
        url = f'{Config.ORGBOOK_API_URL}credential/{credential_id}/formatted'
        req = requests.get(url=url)
        data = json.loads(req.text)
        return data