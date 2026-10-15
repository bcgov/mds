from flask import request, current_app
from flask_restx import Resource

from app.config import Config
from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.feature_flag import Feature, is_feature_enabled
from app.api.services.orgbook_service import OrgBookService
from app.api.services.bcregistries_api_service import BCRegistriesService
from app.api.bc_registration.response_models import ORGBOOK_SEARCH_RESULT_ITEM, ORGBOOK_CREDENTIAL


class SearchResource(Resource):

    @api.doc(
        description='Search OrgBook.',
        params={
            'search_name': 'The search term to use when searching',
            'registration_id': 'The registration number to lookup.'
        })
    @api.marshal_with(ORGBOOK_SEARCH_RESULT_ITEM, code=200, as_list=True)
    @requires_role_view_all
    def get(self):

        search_name = request.args.get('search_name')
        registration_id = request.args.get('registration_id')

        if not (bool(search_name) ^ bool(registration_id)):
            raise ValueError(
                'Either search_name or registration_id must be provided, and not both.')
        ## SEARCH BY BC REGISTRIES - harmonized
        if is_feature_enabled(Feature.BC_REGISTRIES_SEARCH):
            results = BCRegistriesService().search(
                search_name if bool(search_name) else str(registration_id))

        ## SEARCH by ORGBOOK, separate endpoints
        else:
            if search_name:
                results = OrgBookService().search(search_name)
            else:
                response = OrgBookService().get_business_details(registration_id)
                results = [{
                    'credential_id': response.get('credential_id'),
                    'text': response['names'][0].get('text') if response.get('names') else None,
                    'registration_id': registration_id,
                }]

        return results


class CredentialResource(Resource):

    @api.doc(description='Get information on an OrgBook credential using v2 api.')
    @requires_role_view_all
    def get(self, credential_id):
        credential = OrgBookService().get_credential(credential_id)
        return credential
