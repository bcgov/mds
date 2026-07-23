from flask import request, current_app
from flask_restx import Resource

from app.config import Config
from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.feature_flag import Feature, is_feature_enabled
from app.api.services.orgbook_service import OrgBookService, BCRegistriesService
from app.api.orgbook.response_models import ORGBOOK_SEARCH_RESULT_ITEM, ORGBOOK_CREDENTIAL, ORGBOOK_VERIFICATION_RESPONSE


class SearchResource(Resource):

    @api.doc(
        description='Search OrgBook.',
        params={'search': 'The search term to use when searching OrgBook.'})
    @api.marshal_with(ORGBOOK_SEARCH_RESULT_ITEM, code=200, as_list=True)
    def get(self):
        search = request.args.get('search')
        results = OrgBookService().search(search)

        if is_feature_enabled(Feature.BC_REGISTRIES_SEARCH):
            reg_results = None
            try:
                reg_results = BCRegistriesService().search(search)
                current_app.logger.debug(f"New BC Registries API results: {reg_results}")
            except Exception as e:
                current_app.logger.warning(f"BCREG_API ERROR: {str(e)}")

        return results


class RegistrationResource(Resource):

    @api.doc(description='Resolve regstration number')
    def get(self, registration_id: str):
        results = OrgBookService().get_business_details(registration_id)
        return results


class CredentialResource(Resource):

    @api.doc(description='Get information on an OrgBook credential.')
    @api.marshal_with(ORGBOOK_CREDENTIAL, code=200)
    @requires_role_view_all
    def get(self, credential_id):
        credential = OrgBookService().get_credential(credential_id)
        return credential


class VerifyResource(Resource):

    @api.doc(description='Verify an OrgBook credential.')
    @api.marshal_with(ORGBOOK_VERIFICATION_RESPONSE, code=200)
    @requires_role_view_all
    def get(self, credential_id):
        verification = OrgBookService().verify_credential(credential_id)
        return verification
