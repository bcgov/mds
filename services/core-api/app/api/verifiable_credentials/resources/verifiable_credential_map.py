from flask import current_app
from flask_restx import Resource, reqparse
from werkzeug.exceptions import BadRequest
from app.extensions import api
from app.config import Config

from app.api.parties.party.models.party import Party
from app.api.mines.permits.permit_amendment.models.permit_amendment import PermitAmendment
from app.api.verifiable_credentials.models.connection import PartyVerifiableCredentialConnection
from app.api.verifiable_credentials.models.credentials import PartyVerifiableCredentialMinesActPermit

from app.api.services.traction_service import TractionService
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import requires_any_of, MINESPACE_PROPONENT, EDIT_PARTY
from app.api.utils.feature_flag import Feature, is_feature_enabled



class VerifiableCredentialMinesActPermitResource(Resource, UserMixin):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument(
            'party_guid',
            type=str,
            help='GUID of the party.',
            location='json',
            store_missing=False)
    parser.add_argument(
        'permit_amendment_guid', location='json', type=str, store_missing=False)
    
    @api.doc(description="Create a connection invitation for a party by guid", params={"party_guid":"guid for party with wallet connection","permit_amendment_guid":"parmit_amendment that will be offered as a credential to the indicated party"})
    @requires_any_of([EDIT_PARTY, MINESPACE_PROPONENT])
    def post(self):
        if not is_feature_enabled(Feature.TRACTION_VERIFIABLE_CREDENTIALS):
            raise NotImplemented()
        data = self.parser.parse_args()
        current_app.logger.warning(data)
        party_guid = data["party_guid"]
        permit_amendment_guid = data["permit_amendment_guid"]

        # validate action
        party = Party.find_by_party_guid(party_guid)
        if not party:
            raise BadRequest(f"party not found with party_guid {party_guid}")


        permit_amendment = PermitAmendment.find_by_permit_amendment_guid(permit_amendment_guid)
        if not (permit_amendment):
            raise BadRequest(f"permit_amendment not found")
        
        existing_cred_exch = PartyVerifiableCredentialMinesActPermit.find_by_permit_amendment_guid(permit_amendment_guid=permit_amendment_guid)
        
        #https://github.com/hyperledger/aries-rfcs/tree/main/features/0036-issue-credential#states-for-issuer
        if existing_cred_exch and existing_cred_exch.cred_exch_state in ["offer_sent", "request_receieved"]:
            raise BadRequest(f"There is a pending credential offer, accept or delete that offer first, cred_exch_id={existing_cred_exch.cred_exch_id}, cred_exch_state={existing_cred_exch.cred_exch_state}")


        # collect information for schema
        # https://github.com/bcgov/bc-vcpedia/blob/main/credentials/bc-mines-act-permit/1.1.1/governance.md#261-schema-definition
        credential_attrs={}

        mine_disturbance_list = [mtd.mine_disturbance_literal for mtd in permit_amendment.mine.mine_type[0].mine_type_detail if mtd.mine_disturbance_code]
        mine_commodity_list = [mtd.mine_commodity_literal for mtd in permit_amendment.mine.mine_type[0].mine_type_detail if mtd.mine_commodity_code]
        mine_status_xref = permit_amendment.mine.mine_status[0].mine_status_xref

        credential_attrs["permit_no"] = permit_amendment.permit_no
        credential_attrs["permit_status"] = permit_amendment.permit.permit_status_code_description
        credential_attrs["permittee_name"] = permit_amendment.permit.current_permittee
        credential_attrs["mine_operation_status"] = mine_status_xref.mine_operation_status.description
        credential_attrs["mine_operation_status_reason"] = mine_status_xref.mine_operation_status_reason.description if mine_status_xref.mine_operation_status_reason else None
        credential_attrs["mine_operation_status_sub_reason"] = mine_status_xref.mine_operation_status_sub_reason.description if mine_status_xref.mine_operation_status_sub_reason else None
        credential_attrs["mine_disturbance"] = ", ".join(mine_disturbance_list) if mine_disturbance_list else None
        credential_attrs["mine_commodity"] =  ", ".join(mine_commodity_list) if mine_commodity_list else None
        credential_attrs["mine_no"] = permit_amendment.mine.mine_no
        credential_attrs["issue_date"] = int(permit_amendment.issue_date.strftime("%Y%m%d")) if is_feature_enabled(Feature.VC_MINES_ACT_PERMIT_20) else permit_amendment.issue_date
        # https://github.com/hyperledger/aries-rfcs/tree/main/concepts/0441-present-proof-best-practices#dates-and-predicates
        credential_attrs["latitude"] = permit_amendment.mine.latitude
        credential_attrs["longitude"] = permit_amendment.mine.longitude
        credential_attrs["bond_total"] = permit_amendment.permit.active_bond_total
        credential_attrs["tsf_operating_count"] = len([tsf for tsf in permit_amendment.mine.mine_tailings_storage_facilities if tsf.tsf_operating_status_code == "OPT"])
        credential_attrs["tsf_care_and_maintenance_count"] = len([tsf for tsf in permit_amendment.mine.mine_tailings_storage_facilities if tsf.tsf_operating_status_code == "CAM"])

        # offer credential
        attributes = [{
            # "mime-type":"text/plain",
            # NB Orbit does not expect this removing for now
            "name":str(attr),
            "value":str(val),
        } for attr,val in credential_attrs.items()]

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
 