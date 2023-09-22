from flask import current_app
from flask_restplus import Resource
from werkzeug.exceptions import BadRequest
from app.extensions import api

from app.api.parties.party.models.party import Party
from app.api.mines.permits.permit_amendment.models.permit_amendment import PermitAmendment
from app.api.verifiable_credentials.models.connection import PartyVerifiableCredentialConnection

from app.api.utils.resources_mixins import UserMixin



class VerifiableCredentialMinesActPermitResource(Resource, UserMixin):
    @api.doc(description='Create a connection invitation for a party by guid', params={})
    def post(self):
        party_guid = "party_guid"
        permit_amendment_guid = "pa_guid"
        # validate action
        party = Party.find_by_party_guid(party_guid)
        if not party:
            raise BadRequest(f"party not found with party_guid {party_guid}")
        
        vc_conn = PartyVerifiableCredentialConnection.find_by_party_guid(party_guid)
        if not (vc_conn and vc_conn.connnection_state == "active"):
            raise BadRequest(f"not a active connection")

        permit_amendment = PermitAmendment.find_by_permit_amendment_guid(permit_amendment_guid)
        if not (permit_amendment):
            raise BadRequest(f"permit_amendment not found")

        # collect information


        # offer credential

 