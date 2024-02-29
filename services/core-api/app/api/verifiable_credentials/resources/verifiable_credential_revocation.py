from flask import current_app
from flask_restx import Resource, reqparse
from werkzeug.exceptions import BadRequest, NotImplemented
from app.extensions import api
from app.api.utils.access_decorators import requires_any_of, EDIT_PARTY, MINESPACE_PROPONENT

from app.api.parties.party.models.party import Party
from app.api.verifiable_credentials.models.connection import PartyVerifiableCredentialConnection
from app.api.verifiable_credentials.models.credentials import PartyVerifiableCredentialMinesActPermit
from app.api.services.traction_service import TractionService, VerificableCredentialWorkflowError
from app.api.verifiable_credentials.response_models import PARTY_VERIFIABLE_CREDENTIAL_CONNECTION
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.feature_flag import Feature, is_feature_enabled


class VerifiableCredentialRevocationResource(Resource, UserMixin):

    parser = reqparse.RequestParser(trim=True)
    parser.add_argument(
            'credential_exchange_id',
            type=str,
            help='GUID of the party.',
            location='json',
            store_missing=False)
    parser.add_argument(
            'comment',
            type=str,
            help='GUID of the party.',
            location='json',
            store_missing=False)

    @api.expect(parser)
    @api.doc(description='Revokes a verifiable credential by party_guid and credential_exchange_id')
    @requires_any_of([EDIT_PARTY, MINESPACE_PROPONENT])
    def post(self, party_guid: str):
        if not is_feature_enabled(Feature.TRACTION_VERIFIABLE_CREDENTIALS):
            raise NotImplemented()
        party = Party.find_by_party_guid(party_guid)
        if not party:
            raise BadRequest(f"party not found with party_guid {party_guid}")

        data = self.parser.parse_args()
        credential_exchange_id = data["credential_exchange_id"]

        credential_exchange = PartyVerifiableCredentialMinesActPermit.find_by_cred_exch_id(credential_exchange_id)
        if not credential_exchange:
            raise BadRequest(f"credential_exchange_id {credential_exchange_id} not found")

        if credential_exchange.cred_exch_state not in ["credential_acked","done"]:
            raise VerificableCredentialWorkflowError(f"credential_exchange_id {credential_exchange_id} is not in a state where it can be revoked")
        

        traction_svc = TractionService()
        revoke_resp = traction_svc.revoke_credential(party.active_digital_wallet_connection.connection_id,credential_exchange.rev_reg_id, credential_exchange.cred_rev_id, data["comment"])
        
        return revoke_resp