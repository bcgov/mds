from flask import current_app, request
from flask_restx import Resource, reqparse
from werkzeug.exceptions import BadRequest
from app.extensions import api
from app.config import Config

from app.api.parties.party.models.party import Party
from app.api.mines.permits.permit_amendment.models.permit_amendment import PermitAmendment
from app.api.verifiable_credentials.models.connection import PartyVerifiableCredentialConnection
from app.api.verifiable_credentials.models.credentials import PartyVerifiableCredentialMinesActPermit
from app.api.verifiable_credentials.aries_constants import IssueCredentialIssuerState
from app.api.verifiable_credentials.response_models import PARTY_VERIFIABLE_CREDENTIAL_MINES_ACT_PERMIT
from app.api.verifiable_credentials.manager import VerifiableCredentialManager
from app.api.services.traction_service import TractionService
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import requires_any_of, MINESPACE_PROPONENT, EDIT_PARTY
from app.api.utils.feature_flag import Feature, is_feature_enabled


class VerifiableCredentialMinesActPermitResource(Resource, UserMixin):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument(
        'permit_amendment_guid', location='json', type=str, store_missing=False)
    
    @requires_any_of([EDIT_PARTY, MINESPACE_PROPONENT])
    @api.marshal_with(PARTY_VERIFIABLE_CREDENTIAL_MINES_ACT_PERMIT, code=200, envelope='records', as_list=True)
    def get(self, party_guid):
        if not party_guid:
            raise BadRequest("party_guid required")
        party_credential_exchanges = PartyVerifiableCredentialMinesActPermit.find_by_party_guid(party_guid)

        return party_credential_exchanges

    @api.doc(description="Create a connection invitation for a party by guid", params={"party_guid":"guid for party with wallet connection","permit_amendment_guid":"parmit_amendment that will be offered as a credential to the indicated party"})
    @requires_any_of([EDIT_PARTY, MINESPACE_PROPONENT])
    def post(self, party_guid):
        if not is_feature_enabled(Feature.TRACTION_VERIFIABLE_CREDENTIALS):
            raise NotImplemented()
        data = self.parser.parse_args()
        current_app.logger.warning(data)
        permit_amendment_guid = data["permit_amendment_guid"]

        # validate action
        party = Party.find_by_party_guid(party_guid)
        if not party:
            raise BadRequest(f"party not found with party_guid {party_guid}")


        permit_amendment = PermitAmendment.find_by_permit_amendment_guid(permit_amendment_guid)
        if not (permit_amendment):
            raise BadRequest(f"permit_amendment not found")
        
        existing_cred_exch = PartyVerifiableCredentialMinesActPermit.find_by_permit_amendment_guid(permit_amendment_guid=permit_amendment_guid) or []
        
        # If a user has deleted the credential from their wallet, they will need another copy so only limit on pending for UX reasons
        pending_creds = [e for e in existing_cred_exch if e.cred_exch_state in IssueCredentialIssuerState.pending_credential_states]

        #https://github.com/hyperledger/aries-rfcs/tree/main/features/0036-issue-credential#states-for-issuer
        if pending_creds:
            raise BadRequest(f"There is a pending credential offer, accept or delete that offer first, cred_exch_id={existing_cred_exch.cred_exch_id}, cred_exch_state={existing_cred_exch.cred_exch_state}")

        if permit_amendment.permit.mines_act_permit_vc_locked:
            raise BadRequest(f"This permit cannot be offered as a credential")
         
        attributes = VerifiableCredentialManager.collect_attributes_for_mines_act_permit_111(permit_amendment)

        vc_conn = PartyVerifiableCredentialConnection.find_by_party_guid(party_guid)
        active_connections = [con for con in vc_conn if con.connection_state in ["active","completed"]] 

        if not active_connections:
            current_app.logger.error("NO ACTIVE CONNECTION")
            current_app.logger.warning(vc_conn)
            current_app.logger.warning(attributes)
            raise BadRequest("Party does not have an active Digital Wallet connection")
        else:   
            traction_svc = TractionService()
            response = traction_svc.offer_mines_act_permit(active_connections[0].connection_id, attributes)
            map_vc = PartyVerifiableCredentialMinesActPermit(cred_exch_id = response["credential_exchange_id"],party_guid = party_guid, permit_amendment_guid=permit_amendment_guid)
            map_vc.save()

        return response
 