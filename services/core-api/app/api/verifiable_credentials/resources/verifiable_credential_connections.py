from flask import current_app
from flask_restplus import Resource
from werkzeug.exceptions import NotFound
from app.extensions import api
from app.api.utils.access_decorators import requires_any_of, VIEW_ALL, MINESPACE_PROPONENT

from app.api.parties.party.models.party import Party
from app.api.verifiable_credentials.models.connection import PartyVerifiableCredentialConnection
from app.api.services.traction_service import TractionService
from app.api.verifiable_credentials.response_models import PARTY_VERIFIABLE_CREDENTIAL_CONNECTION
from app.api.utils.resources_mixins import UserMixin

class VerifiableCredentialConnectionResource(Resource, UserMixin):
    @api.doc(description='Create a connection invitation for a party by guid', params={})
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    def post(self, party_guid: str):
        #mine_guid will be param. just easy this way for development
        party = Party.find_by_party_guid(party_guid)
        if not party:
            raise NotFound(f"party not found with party_guid {party_guid}")
        
        #TODO Validate the party is an organization? 
        #TODO Validate the party is related to orgbook entity?

        traction_svc=TractionService()
        invitation = traction_svc.create_oob_connection_invitation(party)
        
        return invitation
 

    @api.doc(description='Create a connection invitation for a party by guid', params={})
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(PARTY_VERIFIABLE_CREDENTIAL_CONNECTION, code=200, envelope='records')
    def get(self, party_guid: str):
        party_vc_conn = PartyVerifiableCredentialConnection.find_by_party_guid(party_guid=party_guid)
        return party_vc_conn
 