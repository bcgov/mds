# for midware/business level actions between requests and data access
import json

from sqlalchemy.exc import IntegrityError
from typing import List, Union, Tuple, Optional
from pydantic import BaseModel, Field, ConfigDict
from openlocationcode.openlocationcode import encode as plus_code_encode
from hashlib import md5
from datetime import datetime
from zoneinfo import ZoneInfo
from time import sleep
from typing import List
from flask import current_app
from celery.utils.log import get_task_logger

from app.tasks.celery import celery

from app.extensions import db
from app.config import Config
from app.api.utils.feature_flag import Feature, is_feature_enabled

from app.api.mines.permits.permit.models.permit import Permit
from app.api.mines.permits.permit_amendment.models.permit_amendment import PermitAmendment
from app.api.verifiable_credentials.models.credentials import PartyVerifiableCredentialMinesActPermit
from app.api.verifiable_credentials.models.connection import PartyVerifiableCredentialConnection
from app.api.verifiable_credentials.models.orgbook_publish_status import PermitAmendmentOrgBookPublish
from app.api.services.traction_service import TractionService

from untp_models import codes, base, conformity_credential as cc

task_logger = get_task_logger(__name__)


class UNTPCCMinesActPermit(cc.ConformityAttestation):
    pass


#this should probably be imported from somewhere.
class W3CCred(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True, json_encoders={datetime: lambda v: v.isoformat()})

    context: List[Union[str, dict]] = Field(
        alias="@context",
        default=[
            "https://www.w3.org/2018/credentials/v1",
            Config.UNTP_DIGITAL_CONFORMITY_CREDENTIAL_CONTEXT,
            Config.UNTP_BC_MINES_ACT_PERMIT_CONTEXT, {
                "name": "https://schema.org/name"
            }
        ])
    type: List[str]
    issuer: Union[str, dict[str, str]]
    # TODO: update to `validFrom` for vcdm 2.0 once available in aca-py/traction, which is an optional property
    issuanceDate: str
    credentialSubject: UNTPCCMinesActPermit
    credentialSchema: List[dict]


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


@celery.task()
def process_all_untp_map_for_orgbook():
    """Find all permit amendments connected to orgbook verified parties, preprocess and sign any new credentials."""

    # https://metabase-4c2ba9-prod.apps.silver.devops.gov.bc.ca/question/2937-permit-amendments-for-each-party-orgbook-entity

    permit_amendment_query_results = db.session.execute("""
                        select pa.permit_amendment_guid, poe.party_guid

                        from party_orgbook_entity poe
                        inner join party p on poe.party_guid = p.party_guid
                        inner join mine_party_appt mpa on p.party_guid = mpa.party_guid
                        inner join permit pmt on pmt.permit_id = mpa.permit_id
                        inner join permit_amendment pa on pa.permit_id = pmt.permit_id
                        inner join mine m on pa.mine_guid = m.mine_guid
                        
                        where mpa.permit_id is not null
                        and mpa.mine_party_appt_type_code = 'PMT'
                        and mpa.deleted_ind = false
                        and m.major_mine_ind = true
                        
                        group by pa.permit_amendment_guid, pa.description, pa.issue_date, pa.permit_amendment_status_code, mpa.deleted_ind, pmt.permit_no, mpa.permit_id, poe.party_guid, p.party_name, poe.name_text, poe.registration_id
                        order by pmt.permit_no, pa.issue_date;

                       """).fetchall()

    task_logger.info("Num of results from query to process:" +
                     str(len(permit_amendment_query_results)))

    traction_service = TractionService()
    public_did_dict = traction_service.fetch_current_public_did()
    public_did = Config.CHIEF_PERMITTING_OFFICER_DID_WEB
    public_verkey = public_did_dict["verkey"]

    assert public_did.startswith(
        "did:web:"
    ), f"Config.CHIEF_PERMITTING_OFFICER_DID_WEB = {Config.CHIEF_PERMITTING_OFFICER_DID_WEB} is not a did:web"
    task_logger.info("public did: " + public_did)

    records: List[Tuple[W3CCred,
                        PermitAmendmentOrgBookPublish]] = [] # list of tuples [payload, record]

    for row in permit_amendment_query_results:
        pa = PermitAmendment.find_by_permit_amendment_guid(row[0], unsafe=True)
        if not pa:
            task_logger.warning(f"Permit Amendment not found for permit_amendment_guid={row[0]}")
            continue

        pa_cred = VerifiableCredentialManager.produce_untp_cc_map_payload(public_did, pa)
        if not pa_cred:
            task_logger.warning(f"pa_cred could not be created")
            continue

        payload_hash = md5(pa_cred.json(by_alias=True).encode('utf-8')).hexdigest()
        existing_paob = PermitAmendmentOrgBookPublish.find_by_unsigned_payload_hash(
            payload_hash, unsafe=True)

        if existing_paob:
            #this hash has already been seen, do not make new record or publish
            #this assumes acapy is not changing the result if the payload is unchanged
            continue

        paob = PermitAmendmentOrgBookPublish(
            permit_amendment_guid=row[0],
            party_guid=row[1],
            unsigned_payload_hash=payload_hash,
        )
        records.append((pa_cred, paob))

    task_logger.info(f"public_verkey={public_verkey}")
    # send to traction to be signed
    for cred_payload, record in records:
        signed_cred = traction_service.sign_jsonld_credential_deprecated(
            public_did, public_verkey, cred_payload)
        if signed_cred:
            record.signed_credential = json.dumps(signed_cred["signed_doc"])
            record.sign_date = datetime.now()
        try:
            record.save()
        except IntegrityError:
            task_logger.warning(f"ignoring duplicate={str(record.unsigned_payload_hash)}")
            continue
        task_logger.info("bcreg_uri=" + str(cred_payload.credentialSubject.issuedToParty.id) +
                         ", for permit_amendment_guid=" + str(row[0]))
        task_logger.warning("unsigned_hash=" + str(record.unsigned_payload_hash))

    task_logger.info("num of records created: " + str(len(records or [])))

    return [record for payload, record in records]


def publish_all_pending_vc_to_orgbook():
    """STUB for celery job to publis all pending vc to orgbook."""
    ## Orgbook doesn't have this functionality yet.
    records_to_publish = PermitAmendmentOrgBookPublish.find_all_unpublished(unsafe=True)

    for record in records_to_publish:
        current_app.logger.warning("NOT sending cred to orgbook")
        current_app.logger.warning(record.signed_credential)
        # resp = requests.post(ORGBOOK_W3C_CRED_POST, record.signed_credential)
        # assert resp.status_code == 200, f"resp={resp.json()}"


class VerifiableCredentialManager():

    def __init__(self):
        pass

    @classmethod
    def collect_attributes_for_mines_act_permit_111(
            cls, permit_amendment: PermitAmendment) -> List[dict]:
        # collect information for schema
        # https://github.com/bcgov/bc-vcpedia/blob/main/credentials/bc-mines-act-permit/1.1.1/governance.md#261-schema-definition
        credential_attrs = {}

        #mine_types should related to the permits
        #all mine_types for all permits are used in mine.mine_type
        #but we only want the mine_type for this specific permit/permit_amendment.

        #not really a 'mine_type' if it's managed at the permit level.
        mine_type = [
            mt for mt in permit_amendment.permit.site_properties
            if mt.mine_guid == permit_amendment.mine_guid
        ][0] if permit_amendment.permit.site_properties else None

        #provide permit object the permit_amendment mine_guid
        permit_amendment.permit._context_mine = permit_amendment.mine_guid

        mine_disturbance_list = []
        mine_commodity_list = []

        if mine_type:
            mine_disturbance_list = [
                mtd.mine_disturbance_literal for mtd in mine_type.mine_type_detail
                if mtd.mine_disturbance_code
            ]

            mine_commodity_list = [
                mtd.mine_commodity_literal for mtd in mine_type.mine_type_detail
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
                Feature.VC_ANONCREDS_20) else permit_amendment.issue_date
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
    def produce_map_01_credential_payload(cls, did: str, permit_amendment: PermitAmendment):
        #use w3c vcdm issue_date, not as an attribute in the credential
        #https://www.w3.org/TR/vc-data-model/
        id = permit_amendment.issue_date
        #convert to datetime with tzinfo
        issuance_date = datetime(id.year, id.month, id.day, 0, 0, 0, tzinfo=ZoneInfo("UTC"))
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
        """Produce payload for Mines Act Permit UNTP Conformity Credential from permit amendment and did."""

        #attributes in anoncreds but not in untp
        # "latitude": permit_amendment.mine.latitude, but in pluscode
        # "longitude": permit_amendment.mine.longitude, but in pluscode

        # "bond_total"
        # "mine_disturbance"
        # "mine_operation_status"
        # "mine_operation_status_reason"
        # "mine_operation_status_sub_reason"
        # "tsf_operating_count"
        # "tsf_care_and_maintenance_count"

        curr_appt = permit_amendment.permittee_appointments[0]
        for pmt_appt in permit_amendment.permittee_appointments:
            #find the last permittee appointment relevant to the amendment issue date.
            if pmt_appt.start_date <= permit_amendment.issue_date:
                curr_appt = pmt_appt
            else:
                break

        orgbook_entity = curr_appt.party.party_orgbook_entity
        if not orgbook_entity:
            current_app.logger.warning("No Orgbook Entity, do not produce Mines Act Permit UNTP CC")
            return None

        untp_party_cpo = base.Identifier(
            id="did:web:untp.traceability.site:parties:regulators:CHIEF-PERMITTING-OFFICER",
            name="Chief Permitting Officer of Mines",
            registeredId=
            "did:web:untp.traceability.site:parties:regulators:CHIEF-PERMITTING-OFFICER",
            idScheme=base.IdentifierScheme(
                id="https://w3c-ccg.github.io/did-method-web/", name="DID Web"))

        orgbook_cred_url = f"https://orgbook.gov.bc.ca/entity/{orgbook_entity.registration_id}"

        untp_party_business = base.Party(
            id=orgbook_cred_url,
            name=orgbook_entity.name_text,
            registeredId=str(orgbook_entity.registration_id))

        facility = cc.Facility(
            id=None,
            name=permit_amendment.mine.mine_name,
            registeredId="mine_no",
            locationInformation=
            f'https://plus.codes/{plus_code_encode(permit_amendment.mine.latitude, permit_amendment.mine.longitude)}',
            address=None,
            IDverifiedByCAB=True)

        products = [
            cc.Product(
                name=c,
                                                                                  #TODO, can CORE identify commodities by their UNCEFACT code?
                                                                                  # id=c.uncefact_code?
                                                                                  # idScheme=base.IdentifierScheme(
                                                                                  # id="https://unstats.un.org/unsd/classifications/Econ/cpc",
                                                                                  # name="Central Product Classification (UNCEFACT)"),
                IDverifiedByCAB=False) for c in permit_amendment.mine.commodities
        ]

        issue_date = permit_amendment.issue_date
        issuance_date_str = datetime(
            issue_date.year, issue_date.month, issue_date.day, 0, 0, 0,
            tzinfo=ZoneInfo("UTC")).isoformat()

        untp_assessment = cc.ConformityAssessment(
            assessmentDate=issue_date,
            referenceRegulation=cc.Regulation(
                id="https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/96293_01",
                name="BC Mines Act",
                jurisdictionCountry="CA",
                administeredBy=base.Identifier(
                    id="https://www2.gov.bc.ca/gov/content/home",
                    name="Government of British Columbia",
                    registeredId="BC-GOV",
                    idScheme=base.IdentifierScheme(
                        id="https://www2.gov.bc.ca/gov/content/home", name="BC-GOV")),
                effectiveDate=datetime(2024, 5, 14, tzinfo=ZoneInfo("UTC")).isoformat()),
            conformityTopic=codes.ConformityTopicCode.Governance_Compliance,
            assessedFacility=[facility],
            assessedProduct=products)

        issuance_date_str = datetime(
            issue_date.year, issue_date.month, issue_date.day, 0, 0, 0,
            tzinfo=ZoneInfo("UTC")).isoformat()

        cred = UNTPCCMinesActPermit(
            id="https://orgbook.gov.bc.ca/entity/FM0362955/credential/PLACEHOLDER",
            name="This attests the existence and good standing of a BC Mines Act Permit Credential",
            assessmentLevel=codes.AssessmentLevelCode.GovtApproval,
            attestationType=codes.AttestationType.Certification,
            scope=cc.ConformityAssessmentScheme(
                id=
                "https://bcgov.github.io/digital-trust-toolkit/docs/governance/mining/bc-mines-act-permit/1.1.1/governance",
                name="BC Mines Act Permit Credential (1.1.1) Governance Documentation"),
            authorisations=base.Endorsement(
                id=
                "https://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/permitting/mines-contact-info",
                name="BC Chief Permitting Officer of Mines",
                issuingAuthority=untp_party_cpo),
            issuedToParty=untp_party_business,
            assessment=[untp_assessment])

        w3c_cred = W3CCred(
            type=[
                "VerifiableCredential", "DigitalConformityCredential", "BCMinesActPermitCredential"
            ],
            issuer={"id": did},
            issuanceDate=issuance_date_str,                                                         #vcdm1.1, will change to 'validFrom' in vcdm2.0
            credentialSubject=cred,
            credentialSchema=[{
                "id": Config.UNTP_DIGITAL_CONFORMITY_CREDENTIAL_CONTEXT,
                "type": "JsonSchema"
            }])

        return w3c_cred
