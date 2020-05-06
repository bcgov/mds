import json
from flask import request
from flask_restplus import Resource

from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all
from app.api.services.orgbook_service import OrgBookService


class SearchAutocompleteList(Resource):
    @api.doc(
        description='Search OrgBook.',
        params={'search': 'The search term to use when searching OrgBook.'})
    @requires_role_view_all
    def get(self):
        search = request.args.get('search')
        resp = OrgBookService.search(search)
        results = json.loads(resp.text)['results']
        return results


class CredentialRetrieveFormatted(Resource):
    @api.doc(description='Get information on an OrgBook credential.')
    @requires_role_view_all
    def get(self, credential_id):
        resp = OrgBookService.get_credential(credential_id)
        credential = json.loads(resp.text)
        return credential
