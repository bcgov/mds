# for midware/business level actions between requests and data access
from time import sleep
from typing import List

from app.tasks.celery import celery
from app.extensions import db
from app.api.utils.feature_flag import Feature, is_feature_enabled

from app.api.mines.permits.permit.models.permit import Permit
from app.api.mines.permits.permit_amendment.models.permit_amendment import PermitAmendment
from app.api.verifiable_credentials.models.credentials import PartyVerifiableCredentialMinesActPermit
from app.api.services.traction_service import TractionService
from app.api.verifiable_credentials.manager import VerifiableCredentialManager

class VerifiableCredentialManager(): 
    def __init__(self):
        pass

    @celery.task()
    def revoke_credential_and_offer_newest_amendment(self, credential_exchange: PartyVerifiableCredentialMinesActPermit, permit: Permit):

        connection = credential_exchange.party.active_digital_wallet_connection

        traction_svc = TractionService()
        traction_svc.revoke_credential(connection.connection_id, credential_exchange.rev_reg_id, credential_exchange.cred_rev_id)

        while not credential_exchange.cred_rev_id:
            #wait for webhook callback
            sleep(1)
            db.session.refresh(credential_exchange)

        newest_amendment = permit.permit_amendments.order_by(PermitAmendment.issue_date.desc()).first()

        attributes = VerifiableCredentialManager.collect_attributes_for_mines_act_permit_111(newest_amendment)
        traction_svc.offer_mines_act_permit_111(connection.connection_id, attributes)
 

    def collect_attributes_for_mines_act_permit_111(self, permit_amendment: PermitAmendment) -> List[dict]:
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

        return attributes