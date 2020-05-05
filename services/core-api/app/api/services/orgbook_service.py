import requests

from app.config import Config


class OrgBookService():
    def search_autocomplete_list(search):
        url = f'{Config.ORGBOOK_API_URL}search/autocomplete'
        params = {'q': search, 'inactive': 'false', 'latest': 'true', 'revoked': 'false'}
        return requests.get(url=url, params=params)

    def credential_retrieve_formatted(credential_id):
        url = f'{Config.ORGBOOK_API_URL}credential/{credential_id}/formatted'
        return requests.get(url=url)
