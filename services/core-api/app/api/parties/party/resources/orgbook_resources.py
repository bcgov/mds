from flask import request
from flask_restplus import Resource

from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all
from app.api.services.orgbook_service import OrgBookService


class SearchAutocompleteList(Resource):
    @api.doc(description='', params={})
    @requires_role_view_all
    def get(self):
        search = request.args.get('search')
        resp = OrgBookService.search_autocomplete_list(search)['results']
        return resp


class CredentialRetrieveFormatted(Resource):
    @api.doc(description='', params={})
    @requires_role_view_all
    def get(self, credential_id):
        resp = OrgBookService.credential_retrieve_formatted(credential_id)
        return resp
