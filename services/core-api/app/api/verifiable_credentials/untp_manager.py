# For verificable credential actions to be sent to the UNTP publisher. Midware/business level actions between requests and data access
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
from app.api.parties.party.models.party_bc_registration import PartyBCRegistration
from app.api.parties.party.models.party import Party
from app.api.verifiable_credentials.models.credentials import PartyVerifiableCredentialMinesActPermit
from app.api.verifiable_credentials.models.connection import PartyVerifiableCredentialConnection
from app.api.verifiable_credentials.models.orgbook_publish_status import PermitAmendmentOrgBookPublish
from app.api.services.traction_service import TractionService
from app.api.services.untp_publisher import UNTPPublisherService

from untp_models import codes, base, conformity_credential as cc


class UNTPCCMinesActPermit(cc.ConformityAttestation):
    type: List[str] = ["ConformityAttestation", "MinesActPermit"]
    permitNumber: str


W3C_CRED_ID_PREFIX = f"{Config.UNTP_PUBLISHER_BASE_URL}/credentials/"

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


@celery.task()
def push_untp_map_data_to_publisher():

    ## This is a different process that passes the data to the publisher.
    ## the publisher structures the data and sends it to the orgbook.
    ## the publisher also manages the BitStringStatusLists.
    query = permit_amendments_for_orgbook_query
    permit_amendment_query_results = db.session.execute(query).fetchall()

    failed_credentials: List[Tuple[str, str | None]] = []
    success_count = 0
    skipped_count = 0
    not_created_count = 0
    current_app.logger.info(f"num_records_to_process={len(permit_amendment_query_results)}")
    #token is valid for an hour currently.
    publisher_service = UNTPPublisherService()

    for index, row in enumerate(permit_amendment_query_results):
        pa = PermitAmendment.find_by_permit_amendment_guid(row[0], unsafe=True)

        next_pa_guid: str | None = None
        valid_until_date: date | None = None
        # only valid until the next permit_amendment was issued
        try:
            if permit_amendment_query_results[index + 1][2] == row[2]: # ensure same permit_no
                next_pa_guid = permit_amendment_query_results[index + 1][0]
        except IndexError:
            pass

        if next_pa_guid:
            next_pa = PermitAmendment.find_by_permit_amendment_guid(next_pa_guid)
            valid_until_date = next_pa.issue_date

        if pa.permit_no[1] in ("X", "x"):
            current_app.logger.info(
                f"exclude exploration permit={pa.permit_no}, they cannot produce goods for sale")
            not_created_count += 1
            continue

        # Shape matches PublicationRequest from the untp-publisher API:
        # https://untp-publisher-api-dev.apps.gold.devops.gov.bc.ca/docs#/Credentials/publish_credential_credentials_publish_post
        publish_payload = UNTPCredentialManager.prepare_permit_amendment_untp_credential_without_id(
            row[0])

        if not publish_payload:
            current_app.logger.warning(
                f"publish_payload could not be created for permit_amendment_guid={row[0]}")
            not_created_count += 1
            continue

        payload_hash = md5(json.dumps(publish_payload, default=str).encode('utf-8')).hexdigest()
        current_app.logger.debug(f"payload hash={payload_hash}")

        #MUST BE AFTER HASHING
        publish_payload["credentialId"] = str(uuid4())
        publish_record = PermitAmendmentOrgBookPublish(
            unsigned_payload_hash=payload_hash,
            permit_amendment_guid=row[0],
            party_guid=row[1],
            signed_credential='Produced by publisher',
            publish_state=None,
            permit_number=publish_payload["data"]["permit"]["identifier"],
            orgbook_entity_id=publish_payload["data"]["permittee"]["identifier"],
            orgbook_credential_id=None,
            error_msg=None)

        try:
            current_app.logger.debug('saving publish record locally...')
            publish_record.save()
            current_app.logger.debug('pushing payload to publisher...')

            post_resp = publisher_service.publish_cred(publish_payload)

            publish_record.publish_state = post_resp.ok
            publish_record.error_msg = post_resp.text if not post_resp.ok else None
            if post_resp.ok:
                publish_record.orgbook_credential_id = post_resp.json()["credentialId"]

            publish_record.save()

        except IntegrityError:
            current_app.logger.info(
                f"credential hash collision, skipping duplicate payload for permit_amendment={row[0]}"
            )

        if publish_record.error_msg:
            current_app.logger.warning(
                f"failed to publish unsigned_payload_id={publish_record.unsigned_payload_hash} error={publish_record.error_msg}"
            )
            current_app.logger.warning(f"..failed payload={publish_payload}")
            failed_credentials.append(
                (publish_record.unsigned_payload_hash, publish_record.error_msg))

        elif publish_record.orgbook_credential_id:
            current_app.logger.info(
                f"successful publish of unsigned_payload_id={publish_record.unsigned_payload_hash} url={publish_record.orgbook_credential_id}"
            )
            success_count += 1

        else:
            skipped_count += 1

    return f"counts, published={success_count}, not_created={not_created_count}, skipped={skipped_count}, failed={len(failed_credentials)}"


class UNTPCredentialManager():

    def __init__(self):
        pass

    @classmethod
    def prepare_permit_amendment_untp_credential_without_id(
            cls, permit_amendment_guid: str) -> dict | None:
        pa = PermitAmendment.find_by_permit_amendment_guid(permit_amendment_guid, unsafe=True)
        mine = Mine.find_by_mine_guid(pa.mine_guid)
        if not pa or not mine:
            current_app.logger.warning(
                f"Permit Amendment or mine not found for permit_amendment_guid={permit_amendment_guid}"
            )
            return
        #get other permit_amendments
        pa.permit._context_mine = mine
        pmt_appt_list = pa.permit.permit_amendments
        pos = pmt_appt_list.index(pa)

        permittee_appt = [
            appt for appt in pa.permittee_appointments
            if ensure_start_date_type(appt.start_date) <= pa.issue_date
        ][0]
        permittee_bc_regisration: PartyBCRegistration = permittee_appt.party.party_bc_registration
        if not permittee_bc_regisration:
            return None      # ensure party is loaded

        next_pmt_appt: MinePartyAppointment | None = None
        valid_until_date: date | None = None
        try:
            next_pmt_appt = pmt_appt_list[pos - 1] if pos > 0 else None
        except IndexError:
            pass

        if next_pmt_appt:
            valid_until_date = next_pmt_appt.issue_date

        if pa.permit_no[1] in ("X", "x"):
            current_app.logger.info(
                f"exclude exploration permit={pa.permit_no}, they cannot produce goods for sale")
            return None

        publish_payload = {
            "template": "BCMinesActPermitCredential",
            "version": "v1.1",
                                                                                                   #"credentialId":
            "validUntil":
            convert_date_to_iso_datetime(valid_until_date) if valid_until_date else None,
            "data": {
                "commodities": [{
                    "IDverifiedByCAB": False,
                    "name": c
                } for c in sorted(set(pa.mine.commodities))],
                "mine": {
                    "IDverifiedByCAB": True,
                    "identifier": pa.mine.mine_no,
                                                                                                   # "infoPageId": None,
                    "locationInformation":
                    f'https://plus.codes/{plus_code_encode(pa.mine.latitude, pa.mine.longitude)}',
                    "name": pa.mine.mine_name
                },
                "permit": {
                    "identifier": pa.permit.permit_no,
                    "issuanceDate": convert_date_to_iso_datetime(pa.issue_date),
                },
                "permittee": {
                    "identifier": permittee_bc_regisration.registration_id,
                    "name": permittee_bc_regisration.name_text,
                },
            },
        }
                                                                                                   #TODO: Combine continous permit_amendments where the contents of the credential and permittee did not change into one credential.
        return publish_payload

    @classmethod
    def delete_any_unsuccessful_untp_push(cls, live: bool = False) -> int:
        if not live:
            records = PermitAmendmentOrgBookPublish.find_all_unpublished()
            delete_count = 0
            for record in records:
                current_app.logger.info(f"would delete {record}")
                delete_count += 1
        else:
            current_app.logger.info(f"LIVE DELETE")
            records = PermitAmendmentOrgBookPublish.delete_all_unpublished()
            delete_count = records
            db.session.commit()

        return delete_count
