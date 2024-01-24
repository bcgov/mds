import json
import requests
from flask import request
from flask_restx import Resource

from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all
from app.api.services.orgbook_service import OrgBookService
from werkzeug.exceptions import BadRequest, InternalServerError, NotFound, BadGateway


class SearchResource(Resource):
    @api.doc(
        description='Search OrgBook.',
        params={'search': 'The search term to use when searching OrgBook.'})
    @requires_role_view_all
    def get(self):
        search = request.args.get('search')
        resp = OrgBookService.search(search)

        if resp.status_code != requests.codes.ok:
            raise BadGateway(f'OrgBook API responded with {resp.status_code}: {resp.reason}')

        try:
            results = json.loads(resp.text)['results']
        except:
            raise BadGateway('OrgBook API responded with unexpected data.')

        return results


class CredentialResource(Resource):
    @api.doc(description='Get information on an OrgBook credential.')
    @requires_role_view_all
    def get(self, credential_id):
        resp = OrgBookService.get_credential(credential_id)

        if resp.status_code != requests.codes.ok:
            raise BadGateway(f'OrgBook API responded with {resp.status_code}: {resp.reason}')

        credential = json.loads(resp.text)
        return credential
