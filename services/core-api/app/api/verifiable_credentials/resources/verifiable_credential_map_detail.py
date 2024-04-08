from flask import current_app
from flask_restx import Resource, reqparse
from werkzeug.exceptions import BadRequest
from app.extensions import api

from app.api.verifiable_credentials.models.credentials import PartyVerifiableCredentialMinesActPermit

from app.api.services.traction_service import TractionService
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import requires_any_of, MINESPACE_PROPONENT, EDIT_PARTY


class VerifiableCredentialCredentialExchangeResource(Resource, UserMixin):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument(
        'permit_amendment_guid', location='json', type=str, store_missing=False)
    
    @requires_any_of([EDIT_PARTY, MINESPACE_PROPONENT])
    def get(self, party_guid, cred_exch_id):
        if not party_guid:
            raise BadRequest("party_guid required")
        party_credential_exchanges = PartyVerifiableCredentialMinesActPermit.find_by_party_guid(party_guid)
        current_app.logger.info(party_credential_exchanges)
        assert cred_exch_id in [str(x.cred_exch_id) for x in party_credential_exchanges], f"cred_exch_id={cred_exch_id} not found"
        
        cred_exch_details = TractionService().fetch_credential_exchange(cred_exch_id)

        return cred_exch_details