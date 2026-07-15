from flask import request
from flask_restx import Resource

from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all
from app.api.services.orgbook_service import OrgBookService, BCRegistriesService
from app.api.orgbook.response_models import ORGBOOK_SEARCH_RESULT, ORGBOOK_CREDENTIAL, ORGBOOK_VERIFICATION_RESPONSE


class SearchResource(Resource):

    @api.doc(
        description='Search OrgBook.',
        params={'search': 'The search term to use when searching OrgBook.'})
    def get(self):
        search = request.args.get('search')
        results = OrgBookService().search(search)
        reg_results = None
        try:
            reg_results = BCRegistriesService().search(search)
        except Exception as e:
            print(f"BCREG_API ERROR: {str(e)}")

        return {"reg_results": reg_results, "results": results}, 200


class CredentialResource(Resource):

    @api.doc(description='Get information on an OrgBook credential.')
    @api.marshal_with(ORGBOOK_CREDENTIAL, code=200)
    def get(self, credential_id):
        credential = OrgBookService().get_credential(credential_id)
        return credential


class VerifyResource(Resource):

    @api.doc(description='Verify an OrgBook credential.')
    @api.marshal_with(ORGBOOK_VERIFICATION_RESPONSE, code=200)
    def get(self, credential_id):
        verification = OrgBookService().verify_credential(credential_id)
        return verification
