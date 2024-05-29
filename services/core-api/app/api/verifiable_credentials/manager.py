# for midware/business level actions between requests and data access
import pytz
from typing import List, Union
from pydantic import BaseModel, Field, ConfigDict

from datetime import datetime
from time import sleep
from typing import List
from flask import current_app
from celery.utils.log import get_task_logger

from app.tasks.celery import celery

from app.extensions import db
from app.config import Config
from app.api.utils.feature_flag import Feature, is_feature_enabled

from app.api.mines.mine.models.mine import Mine
from app.api.parties.party.models.party import Party
from app.api.mines.permits.permit.models.permit import Permit
from app.api.mines.permits.permit_amendment.models.permit_amendment import PermitAmendment
from app.api.verifiable_credentials.models.credentials import PartyVerifiableCredentialMinesActPermit
from app.api.verifiable_credentials.models.connection import PartyVerifiableCredentialConnection
from app.api.services.traction_service import TractionService

from app.api.verifiable_credentials.untp import codes, base, conformity_credential as cc

task_logger = get_task_logger(__name__)


@celery.task()
def revoke_all_credentials_for_permit(permit_guid: str, mine_guid: str, reason: str):
    cred_exch = PartyVerifiableCredentialMinesActPermit.find_by_permit_guid_and_mine_guid(
        permit_guid, mine_guid)
    for ce in cred_exch:
        traction_svc = TractionService()
        connection = PartyVerifiableCredentialConnection.find_active_by_party_guid(ce.party_guid)
        if ce.cred_exch_state in PartyVerifiableCredentialMinesActPermit._active_credential_states:
            traction_svc.revoke_credential(connection.connection_id, ce.rev_reg_id, ce.cred_rev_id,
                                           reason)

            attempts = 0
            while not ce.cred_rev_id:
                sleep(1)
                db.session.refresh(cred_exch)
                attempts += 1
                if attempts > 60:
                    ce.error_description = "Never received webhook confirming revokation credential"
                    ce.save()
                    raise Exception("Never received webhook confirming revokation credential")

        if ce.cred_exch_state in PartyVerifiableCredentialMinesActPermit._pending_credential_states:
            traction_svc.send_issue_credential_problem_report(ce.cred_exch_id, "problem_report")
            #problem reports set the state to abandoned in both agents, cannot continue afterwards

    info_str = f"revoked all credentials for permit_guid={permit_guid} and mine_guid={mine_guid}"
    task_logger.warning(info_str)                # not sure where to find this.

    return info_str


@celery.task()
def offer_newest_amendment_to_current_permittee(permit_amendment_guid: str,
                                                cred_type: str = Config.CRED_DEF_ID_MINES_ACT_PERMIT
                                                ):
    """Revoke the existing credential and offer a new one with the newest amendment."""
    newest_amendment = PermitAmendment.find_by_permit_amendment_guid(permit_amendment_guid)

    permit = Permit.find_by_permit_guid(newest_amendment.permit_guid)
    if permit.current_permittee_digital_wallet_connection_state != "active":
        return "Permittee's wallet connection is not active, do not issue credential."

    connection = PartyVerifiableCredentialConnection.find_active_by_party_guid(
        permit.current_permittee_guid)

    attributes = VerifiableCredentialManager.collect_attributes_for_mines_act_permit_111(
        newest_amendment)

    traction_svc = TractionService()
    response = traction_svc.offer_mines_act_permit_111(connection.connection_id, attributes)
    map_vc = PartyVerifiableCredentialMinesActPermit(
        cred_exch_id=response["credential_exchange_id"],
        cred_type=cred_type,
        party_guid=permit.current_permittee_guid,
        permit_amendment_guid=newest_amendment.permit_amendment_guid)

    map_vc.save()

    info_str = f"offer new_cred_exchange{response['credential_exchange_id']} for permit_amendment_guid={newest_amendment.permit_amendment_guid}"
    task_logger.warning(info_str)                # not sure where to find this.

    return info_str


class VerifiableCredentialManager():

    def __init__(self):
        pass

    @classmethod
    def collect_attributes_for_mines_act_permit_111(
            cls, permit_amendment: PermitAmendment) -> List[dict]:
        # collect information for schema
        # https://github.com/bcgov/bc-vcpedia/blob/main/credentials/bc-mines-act-permit/1.1.1/governance.md#261-schema-definition
        credential_attrs = {}

        mine_disturbance_list = [
            mtd.mine_disturbance_literal
            for mtd in permit_amendment.mine.mine_type[0].mine_type_detail
            if mtd.mine_disturbance_code
        ]
        mine_commodity_list = [
            mtd.mine_commodity_literal
            for mtd in permit_amendment.mine.mine_type[0].mine_type_detail
            if mtd.mine_commodity_code
        ]
        mine_status_xref = permit_amendment.mine.mine_status[0].mine_status_xref

        credential_attrs["permit_no"] = permit_amendment.permit_no
        credential_attrs["permit_status"] = permit_amendment.permit.permit_status_code_description
        credential_attrs["permittee_name"] = permit_amendment.permit.current_permittee
        credential_attrs[
            "mine_operation_status"] = mine_status_xref.mine_operation_status.description
        credential_attrs[
            "mine_operation_status_reason"] = mine_status_xref.mine_operation_status_reason.description if mine_status_xref.mine_operation_status_reason else None
        credential_attrs[
            "mine_operation_status_sub_reason"] = mine_status_xref.mine_operation_status_sub_reason.description if mine_status_xref.mine_operation_status_sub_reason else None
        credential_attrs["mine_disturbance"] = ", ".join(
            mine_disturbance_list) if mine_disturbance_list else None
        credential_attrs["mine_commodity"] = ", ".join(
            mine_commodity_list) if mine_commodity_list else None
        credential_attrs["mine_no"] = permit_amendment.mine.mine_no
        credential_attrs["issue_date"] = int(
            permit_amendment.issue_date.strftime("%Y%m%d")) if is_feature_enabled(
                Feature.VC_MINES_ACT_PERMIT_20) else permit_amendment.issue_date
        # https://github.com/hyperledger/aries-rfcs/tree/main/concepts/0441-present-proof-best-practices#dates-and-predicates
        credential_attrs["latitude"] = permit_amendment.mine.latitude
        credential_attrs["longitude"] = permit_amendment.mine.longitude
        credential_attrs["bond_total"] = permit_amendment.permit.active_bond_total
        credential_attrs["tsf_operating_count"] = len([
            tsf for tsf in permit_amendment.mine.mine_tailings_storage_facilities
            if tsf.tsf_operating_status_code == "OPT"
        ])
        credential_attrs["tsf_care_and_maintenance_count"] = len([
            tsf for tsf in permit_amendment.mine.mine_tailings_storage_facilities
            if tsf.tsf_operating_status_code == "CAM"
        ])

        # offer credential
        # "mime-type":"text/plain",
        # NB Orbit does not expect this removing for now

        attributes = [{
            "name": str(attr),
            "value": str(val),
        } for attr, val in credential_attrs.items()]

        return attributes

    @classmethod
    def revoke_all_credentials_for_permit(cls, permit_guid: str):
        pass

    @classmethod
    def produce_map_01_credential_payload(cls, did: str, permit_amendment: PermitAmendment):
        #use w3c vcdm issue_date, not as an attribute in the credential
        #https://www.w3.org/TR/vc-data-model/
        id = permit_amendment.issue_date
        #convert to datetime with tzinfo
        issuance_date = datetime(id.year, id.month, id.day, 0, 0, 0, tzinfo=pytz.timezone("UTC"))
        credential = {
            "@context":
            ["https://www.w3.org/2018/credentials/v1", {
                "@vocab": "urn:bcgov:attributes#"
            }],
            "type": ["VerifiableCredential"],
            "issuer": {
                "id": did,
            },
            "issuanceDate": issuance_date.isoformat(),
            "credentialSubject": {
                a["name"]: a["value"]
                for a in cls.collect_attributes_for_mines_act_permit_111(permit_amendment)
                if a["name"] != "issue_date"
            }
        }
        return credential

    @classmethod
    def produce_untp_cc_map_payload(cls, did: str, permit_amendment: PermitAmendment):
        untp_party_cpo = base.Party(
            name="Chief Permitting Officer",
            identifiers=[
                base.Identifier(
                    scheme="https://candyscan.idlab.org/tx/CANDY_PROD/domain/321",
                    identifierValue="",
                    identifierURI="https://candyscan.idlab.org/tx/CANDY_PROD/domain/321",
                    verificationEvidence=base.Evidence(
                        format=codes.EvidenceFormat.W3C_VC,
                        credentialReference=
                        "https://candyscan.idlab.org/tx/CANDY_PROD/domain/321"            #this is an anoncred
                    ))
            ])

        untp_party_business = base.Party(
            name="Permittee",
            identifiers=[
                base.Identifier(
                    scheme="https://indyscan.io/tx/SOVRIN_MAINNET/domain/41051",
                    identifierValue="BusinessNumber",
                    identifierURI="https://orgbook.gov.bc.ca/entity/A0103047/credential/3323794",
                    verificationEvidence=base.Evidence(
                        format=codes.EvidenceFormat.W3C_VC,
                        credentialReference=
                        "https://orgbook.gov.bc.ca/entity/A0103047/credential/3323794"))
            ])

        untp_assessments = [
            cc.ConformityAssessment(
                referenceStandard=cc.Standard(
                    id="https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/96293_01",
                    name="BC Mines Act",
                    issuingBody=base.Party(name="BC Government"),
                    issueDate=datetime(2024, 5, 14, tzinfo=pytz.timezone("UTC")).isoformat()))
        ]
        issue_date = permit_amendment.issue_date
        issuance_date_str = datetime(
            issue_date.year, issue_date.month, issue_date.day, 0, 0, 0,
            tzinfo=pytz.timezone("UTC")).isoformat()

        cred = cc.ConformityAttestation(
            id="http://example.com/attestation/123",
            assessmentLevel=codes.AssessmentAssuranceCode.GovtApproval,
            type=codes.AttestationType.Certification,
            description=
            "This is a conformity attestation for the existence and good standing of a mining permit under the Mines Act within British Columbia (a province of Canada).",
            scope=cc.ConformityAssessmentScheme(
                id=
                "https://github.com/bcgov/bc-vcpedia/blob/main/credentials/bc-mines-act-permit/1.1.1/governance.md",
                name="BC Mines Act Permit Credential (1.1.1) Governance Documentation"),
            issuedBy=untp_party_cpo,
            issuedTo=untp_party_business,
            validFrom=issuance_date_str,                                                                                                                                   #shouldn't this just be in the w3c wrapper
            assessments=untp_assessments,
            evidence=[])

        class W3CCred(BaseModel):
            model_config = ConfigDict(
                populate_by_name=True, json_encoders={
                    datetime: lambda v: v.isoformat(),
                })

            context: List[Union[str, dict]] = Field(alias="@context")
            type: List[str]
            issuer: dict[str, str]
            issuanceDate: str
            credentialSubject: cc.ConformityAttestation

        w3c_cred = W3CCred(
            context=["https://www.w3.org/2018/credentials/v1", {
                "@vocab": "urn:bcgov:attributes#"
            }],
            type=["VerifiableCredential"],
            issuer={"id": did},
            issuanceDate=issuance_date_str,
            credentialSubject=cred)

        current_app.logger.warning("w3c_cred")
        current_app.logger.warning(w3c_cred.json(by_alias=True))
        return w3c_cred
