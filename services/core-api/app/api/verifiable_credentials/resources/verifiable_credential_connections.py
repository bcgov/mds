from flask import current_app
from flask_restplus import Resource
from werkzeug.exceptions import NotFound
from app.extensions import api

from app.api.parties.party.models.party import Party
from app.api.services.traction_service import TractionService

from app.api.utils.resources_mixins import UserMixin

class VerifiableCredentialConnectionResource(Resource, UserMixin):
    @api.doc(description='Create a connection invitation for a party by guid', params={})
    def post(self, party_guid: str):
        #mine_guid will be param. just easy this way for development
        party = Party.find_by_party_guid(party_guid)
        if not party:
            raise NotFound(f"party not found with party_guid {party_guid}")
        
        #TODO Validate the party is an organization? 
        #TODO Validate the party is related to orgbook entity?

        traction_svc=TractionService()
        invitation = traction_svc.create_oob_connection_invitation(party)
        
        current_app.logger.warn(invitation)
        return invitation
 