import requests

from app.config import Config


class OrgBookService():
    def search(search):
        url = f'{Config.ORGBOOK_API_URL}search/autocomplete'
        params = {'q': search, 'inactive': 'false', 'latest': 'true', 'revoked': 'false'}
        return requests.get(url=url, params=params)

    def get_credential(credential_id):
        url = f'{Config.ORGBOOK_API_URL}credential/{credential_id}/formatted'
        return requests.get(url=url)

    def verify_credential(credential_id):
        url = f'{Config.ORGBOOK_API_URL}credential/{credential_id}/verify'
        return requests.get(url=url)
