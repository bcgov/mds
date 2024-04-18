# for midware/business level actions between requests and data access
from time import sleep
from typing import List
from celery.utils.log import get_task_logger

from app.tasks.celery import celery

from app.extensions import db
from app.api.utils.feature_flag import Feature, is_feature_enabled

from app.api.mines.mine.models.mine import Mine
from app.api.mines.permits.permit.models.permit import Permit
from app.api.mines.permits.permit_amendment.models.permit_amendment import PermitAmendment
from app.api.verifiable_credentials.models.credentials import PartyVerifiableCredentialMinesActPermit
from app.api.services.traction_service import TractionService

logger = get_task_logger(__name__)

@celery.task()
def revoke_credential_and_offer_newest_amendment(credential_exchange_id: str, permit_guid: str):
    """Revoke the existing credential and offer a new one with the newest amendment."""
    cred_exch = PartyVerifiableCredentialMinesActPermit.find_by_cred_exch_id(credential_exchange_id)
    assert cred_exch, "Credential exchange not found"
    permit = Permit.query.unbound_unsafe().filter_by(permit_guid=permit_guid).first()
    assert permit, "Permit not found"
    permit._context_mine = cred_exch.permit_amendment.mine

    connection = cred_exch.party.active_digital_wallet_connection

    traction_svc = TractionService()
    traction_svc.revoke_credential(connection.connection_id, cred_exch.rev_reg_id, cred_exch.cred_rev_id, "amended")

    attempts = 0
    while not cred_exch.cred_rev_id:
        sleep(1)
        db.session.refresh(cred_exch)
        attempts += 1
        if attempts > 60:
            raise Exception("Never received webhook confirming revokation credential")

    newest_amendment = sorted(permit.permit_amendments, key=lambda pa: pa.issue_date,reverse=True)[0]

    attributes = VerifiableCredentialManager.collect_attributes_for_mines_act_permit_111(newest_amendment)
    response = traction_svc.offer_mines_act_permit_111(connection.connection_id, attributes)
    map_vc = PartyVerifiableCredentialMinesActPermit(cred_exch_id = response["credential_exchange_id"],party_guid = cred_exch.party_guid, permit_amendment_guid=newest_amendment.permit_amendment_guid)
    map_vc.save()

    info_str = f"Revoked credential_exchange_id={credential_exchange_id} and offer new_cred_exchange{response['credential_exchange_id']} for permit_guid={newest_amendment.permit_amendment_guid}"
    logger.warning(info_str) # not sure where to find this. 
    
    return info_str

class VerifiableCredentialManager(): 
    def __init__(self):
        pass

   
    @classmethod
    def collect_attributes_for_mines_act_permit_111(cls, permit_amendment: PermitAmendment) -> List[dict]:
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