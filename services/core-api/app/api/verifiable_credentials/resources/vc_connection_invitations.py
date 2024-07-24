from flask_restx import Resource
from werkzeug.exceptions import NotFound, ServiceUnavailable
from app.extensions import api
from app.api.utils.access_decorators import requires_any_of, EDIT_PARTY, MINESPACE_PROPONENT

from app.api.parties.party.models.party import Party
from app.api.verifiable_credentials.models.connection import PartyVerifiableCredentialConnection
from app.api.services.traction_service import TractionService
from app.api.verifiable_credentials.response_models import PARTY_VERIFIABLE_CREDENTIAL_CONNECTION
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.feature_flag import Feature, is_feature_enabled


class VerifiableCredentialConnectionInvitationsResource(Resource, UserMixin):

    @api.doc(description='Create a connection invitation for a party by guid', params={})
    @requires_any_of([EDIT_PARTY, MINESPACE_PROPONENT])
    def post(self, party_guid: str):
        if not is_feature_enabled(Feature.VC_ANONCREDS_MINESPACE):
            raise ServiceUnavailable()
        party = Party.find_by_party_guid(party_guid)
        if not party:
            raise NotFound(f"party not found with party_guid {party_guid}")

        traction_svc = TractionService()
        invitation = traction_svc.create_oob_connection_invitation(party)

        return invitation

    @api.doc(description='Create a connection invitation for a party by guid', params={})
    @requires_any_of([EDIT_PARTY, MINESPACE_PROPONENT])
    @api.marshal_with(PARTY_VERIFIABLE_CREDENTIAL_CONNECTION, code=200, envelope='records')
    def get(self, party_guid: str):
        if not is_feature_enabled(Feature.VC_ANONCREDS_MINESPACE):
            raise ServiceUnavailable()

        party_vc_conn = PartyVerifiableCredentialConnection.find_by_party_guid(
            party_guid=party_guid)

        return party_vc_conn

    @api.doc(description="Delete a connection for a party by guid", params={})
    @requires_any_of([EDIT_PARTY, MINESPACE_PROPONENT])
    def delete(self, party_guid):
        if not is_feature_enabled(Feature.VC_ANONCREDS_MINESPACE):
            raise ServiceUnavailable()

        party_vc_conn = PartyVerifiableCredentialConnection.find_by_party_guid(party_guid)
        if not party_vc_conn:
            raise NotFound(f"party_vc_conn not found with party_guid {party_guid}")

        party_vc_conn.delete()
        party_vc_conn.save()
