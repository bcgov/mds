# For verificable credential actions to product and sign W3C Credentials without any other service. Midware/business level actions between requests and data access
import json
import requests
import pprint

from datetime import datetime, date
from dateutil.relativedelta import relativedelta
from uuid import uuid4, UUID
from sqlalchemy.exc import IntegrityError
from typing import List, Union, Tuple, Optional, Any
from pydantic import BaseModel, Field, ConfigDict
from openlocationcode.openlocationcode import encode as plus_code_encode
from hashlib import md5
from zoneinfo import ZoneInfo
from time import sleep
from typing import List
from flask import current_app

from app.tasks.celery import celery

from app.extensions import db
from app.config import Config
from app.api.utils.feature_flag import Feature, is_feature_enabled

from app.api.mines.mine.models.mine import Mine
from app.api.mines.permits.permit.models.permit import Permit
from app.api.mines.permits.permit_amendment.models.permit_amendment import PermitAmendment
from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointment
from app.api.parties.party.models.party import Party
from app.api.verifiable_credentials.models.credentials import PartyVerifiableCredentialMinesActPermit
from app.api.verifiable_credentials.models.connection import PartyVerifiableCredentialConnection
from app.api.verifiable_credentials.models.orgbook_publish_status import PermitAmendmentOrgBookPublish
from app.api.services.traction_service import TractionService
from app.api.services.orgbook_publisher import OrgbookPublisherService

from untp_models import codes, base, conformity_credential as cc


class UNTPCCMinesActPermit(cc.ConformityAttestation):
    type: List[str] = ["ConformityAttestation", "MinesActPermit"]
    permitNumber: str


W3C_CRED_ID_PREFIX = f"{Config.ORGBOOK_PUBLISHER_BASE_URL}/credentials/"

permit_amendments_for_orgbook_query = """
    select pa.permit_amendment_guid, p.party_guid, pmt.permit_no
 
    from party_orgbook_entity poe
    inner join party p on poe.party_guid = p.party_guid
    inner join mine_party_appt mpa on p.party_guid = mpa.party_guid
    inner join permit pmt on pmt.permit_id = mpa.permit_id
    inner join permit_amendment pa on pa.permit_id = pmt.permit_id
    inner join mine m on pa.mine_guid = m.mine_guid
    
    where mpa.permit_id is not null
    and mpa.mine_party_appt_type_code = 'PMT'
    and mpa.deleted_ind = false
    and mpa.start_date <= pa.issue_date
    and (mpa.end_date > pa.issue_date OR mpa.end_date is null or mpa.end_date = '9999-12-31')
    and pa.deleted_ind = false
    and pmt.permit_status_code = 'O'
    and substring(pmt.permit_no,2,1) != 'X'

    group by pa.permit_amendment_guid, p.party_guid, pa.description, pa.issue_date, pa.permit_amendment_status_code, pmt.permit_no, mpa.permit_id, poe.party_guid, p.party_name, poe.name_text, poe.registration_id, m.mine_name, mine_party_appt_type_code
    order by pmt.permit_no, pa.issue_date;
"""


#this should probably be imported from somewhere.
class W3CCred(BaseModel):
    #based on VCDM 2.0. https://www.w3.org/TR/vc-data-model-2.0/
    model_config = ConfigDict(
        populate_by_name=True, json_encoders={datetime: lambda v: v.isoformat()})

    context: List[Union[str, dict]] = Field(
        alias="@context",
        default=[
            "https://www.w3.org/ns/credentials/v2",
            Config.UNTP_DIGITAL_CONFORMITY_CREDENTIAL_CONTEXT,
            Config.UNTP_BC_MINES_ACT_PERMIT_CONTEXT,
        ])
    id: str | None
    type: List[str]
    issuer: Union[str, dict[str, str]]
    validFrom: str
    credentialSubject: UNTPCCMinesActPermit
    credentialSchema: List[dict]


def convert_date_to_iso_datetime(dt: datetime | date) -> str:
    return datetime(dt.year, dt.month, dt.day, 0, 0, 0, tzinfo=ZoneInfo("UTC")).isoformat()


def ensure_start_date_type(d) -> date:
    if not d:
        current_app.logger.info(f"mine_party_appointment.start_date is None, setting to 1900-01-01")
        return date(1900, 1, 1)
    elif isinstance(d, date):
        return d
    elif isinstance(d, datetime):
        return d.date()
    else:
        raise TypeError(
            f"mine_party_appointment.start_date is neither `date` or `datetime` object, it's {type(d)}"
        )


class W3CCredentialManager():

    def __init__(self):
        pass

    @classmethod
    def produce_untp_cc_map_payload_without_id(cls, did: str,
                                               permit_amendment: PermitAmendment) -> W3CCred | None:
        """DEPRECATED: Produce payload for Mines Act Permit UNTP (v0.5.0) Conformity Credential from permit amendment and did."""

        pmt_appts: List[MinePartyAppointment] = permit_amendment.permittee_appointments
        current_app.logger.debug(
            f"starting... produce_untp_cc_map_payload_without_id permit_amendment_guid={permit_amendment.permit_amendment_guid}"
        )
        permit_amendment_issue_date = permit_amendment.issue_date if isinstance(
            permit_amendment.issue_date, date) else permit_amendment.issue_date.date()

        if pmt_appts is None or len(pmt_appts) == 0:
            current_app.logger.warning(
                f"No permittee appointments found for permit_amendment_guid={permit_amendment.permit_amendment_guid}, cannot produce Mines Act Permit UNTP CC"
            )
            return None

        #remove all appointments after the issue_date then take the top one, there are overlapping entries that may not be handled here.

        try:
            curr_appt = [
                pa for pa in pmt_appts
                if ensure_start_date_type(pa.start_date) <= permit_amendment_issue_date
            ][0]
        except IndexError:
            current_app.logger.warning(
                f"No valid permittee appointments found for permit_amendment_guid={permit_amendment.permit_amendment_guid}, cannot produce Mines Act Permit UNTP CC"
            )
            return None

        orgbook_entity = curr_appt.party.party_bc_registration
        if not orgbook_entity:
            if curr_appt.party:
                current_app.logger.warning(
                    f"No Orgbook Entity for party_guid={curr_appt.party.party_guid}, could not produce Mines Act Permit UNTP CC"
                )
            else:
                current_app.logger.error(
                    f"No party for mine_party_appointment_id={curr_appt.mine_party_appt_id}, that shouldn't be possible"
                )
            return None

        untp_party_cpo = base.Identifier(
            id="did:web:untp.traceability.site:parties:regulators:CHIEF-PERMITTING-OFFICER",
            name="Chief Permitting Officer of Mines",
            registeredId=
            "did:web:untp.traceability.site:parties:regulators:CHIEF-PERMITTING-OFFICER",
            idScheme=base.IdentifierScheme(
                id="https://w3c-ccg.github.io/did-method-web/", name="DID Web"))

        business_registration_url = f"https://orgbook.gov.bc.ca/entity/{orgbook_entity.registration_id}"

        untp_party_business = base.Party(
            id=business_registration_url,
            name=orgbook_entity.name_text,
            registeredId=str(orgbook_entity.registration_id))

        if not permit_amendment.mine.latitude or not permit_amendment.mine.longitude:
            current_app.logger.warning(
                f"Missing location information for permit_amendment_guid={permit_amendment.permit_amendment_guid}, cannot produce Mines Act Permit UNTP CC"
            )
            return None

        facility = cc.Facility(
            id=None,
            name=permit_amendment.mine.mine_name,
            registeredId=permit_amendment.mine.mine_no,
            locationInformation=
            f'https://plus.codes/{plus_code_encode(permit_amendment.mine.latitude, permit_amendment.mine.longitude)}',
            address=None,
            IDverifiedByCAB=True)

        #TODO, can CORE identify commodities by their UNCEFACT code?
        #remove duplicates
        product_names = list(set([c for c in permit_amendment.mine.commodities]))
        #sort list of strings for consistency
        product_names.sort()

        products = [cc.Product(id=None, name=c, IDverifiedByCAB=False) for c in product_names]

        issue_date = permit_amendment.issue_date

        untp_assessment = cc.ConformityAssessment(
            id=None,
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

        cred = UNTPCCMinesActPermit(
            id=None,
            name="Credential for permitNumber=" + permit_amendment.permit_no,
            permitNumber=permit_amendment.permit_no,
            assessmentLevel=codes.AssessmentLevelCode.GovtApproval,
            attestationType=codes.AttestationType.Certification,
            scope=cc.ConformityAssessmentScheme(
                id=
                "https://bcgov.github.io/digital-trust-toolkit/docs/governance/mining/bc-mines-act-permit/1.1.1/governance",
                name="BC Mines Act Permit Credential (1.1.1) Governance Documentation"),
            authorisation=[
                base.Endorsement(
                    id=
                    "https://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/permitting/mines-contact-info",
                    name="BC Chief Permitting Officer of Mines",
                    issuingAuthority=untp_party_cpo)
            ],
            issuedToParty=untp_party_business,
            assessment=[untp_assessment])

        w3c_cred = W3CCred(
            id=None,                                                                                # to be populated after hashing.
            type=[
                "VerifiableCredential", "DigitalConformityCredential", "BCMinesActPermitCredential"
            ],
            issuer={"id": did},
            validFrom=convert_date_to_iso_datetime(
                permit_amendment.issue_date),                                                       #vcdm1.1, will change to 'validFrom' in vcdm2.0
            credentialSubject=cred,
            credentialSchema=[{
                "id": Config.UNTP_DIGITAL_CONFORMITY_CREDENTIAL_CONTEXT,
                "type": "JsonSchema"
            }])

        return w3c_cred
