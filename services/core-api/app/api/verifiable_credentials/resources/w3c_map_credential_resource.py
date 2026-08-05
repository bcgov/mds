from json import dumps, loads
from hashlib import md5
from datetime import datetime
from uuid import uuid4, UUID
from flask import current_app
from werkzeug.exceptions import BadRequest, ServiceUnavailable
from flask_restx import Resource, reqparse
from sqlalchemy.exc import IntegrityError

from app.extensions import api
from app.api.utils.access_decorators import requires_any_of, MINESPACE_PROPONENT, EDIT_PARTY, VIEW_ALL
from app.api.utils.resources_mixins import UserMixin

from app.api.services.untp_publisher import UNTPPublisherService
from app.api.verifiable_credentials.untp_manager import UNTPCredentialManager
from app.api.verifiable_credentials.anoncred_manager import AnonCredCredentialManager
from app.api.verifiable_credentials.models.orgbook_publish_status import PermitAmendmentOrgBookPublish
from app.api.mines.permits.permit_amendment.models.permit_amendment import PermitAmendment

from app.api.utils.feature_flag import Feature, is_feature_enabled

PRESENT_PROOF = "present_proof"
CONNECTIONS = "connections"
CREDENTIAL_OFFER = "issue_credential"
OUT_OF_BAND = "out_of_band"
PING = "ping"
ISSUER_CREDENTIAL_REVOKED = "issuer_cred_rev"


class W3CCredentialResource(Resource, UserMixin):

    @api.doc(description='Endpoint to get vc by uri.', params={})
    def get(self, vc_unsigned_hash: str):
        return loads(
            PermitAmendmentOrgBookPublish.find_by_unsigned_payload_hash(
                vc_unsigned_hash, unsafe=True).signed_credential)


class W3CCredentialIssueResource(Resource, UserMixin):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument(
        'permit_amendment_guid',
        type=str,
        help='GUID of the permit amendment.',
        location='json',
        store_missing=False)

    query_parser = reqparse.RequestParser(trim=True)
    query_parser.add_argument(
        'permit_amendment_guid',
        type=str,
        help='GUID of the permit amendment.',
        location='args',
        store_missing=False)

    @api.expect(parser)
    @api.doc(description="issues a w3c credential to the untp publisher")
    @requires_any_of([EDIT_PARTY, MINESPACE_PROPONENT])
    def post(self):
        if not is_feature_enabled(Feature.VC_W3C):
            raise ServiceUnavailable("This feature is not enabled.")

        data = self.parser.parse_args()
        permit_amendment_guid = data["permit_amendment_guid"]

        payload = UNTPCredentialManager.prepare_permit_amendment_untp_credential_without_id(
            permit_amendment_guid)
        if payload is None:
            raise BadRequest(
                f"payload could not be produced for permit_amendment_guid={permit_amendment_guid}")

        payload_hash = md5(dumps(payload).encode('utf-8')).hexdigest()
        payload["credentialId"] = str(uuid4())

        existing: bool = PermitAmendmentOrgBookPublish.find_by_unsigned_payload_hash(
            payload_hash) is not None

        publisher_service = UNTPPublisherService()
        post_resp = None
        publish_record = PermitAmendmentOrgBookPublish(
            unsigned_payload_hash=payload_hash,
            permit_amendment_guid=permit_amendment_guid,
            party_guid=payload["data"]["permittee"]["party_guid"],
            signed_credential='Produced by publisher',
            publish_state=None,
            permit_number=payload["data"]["permit"]["identifier"],
            orgbook_entity_id=payload["data"]["permittee"]["identifier"],
            orgbook_credential_id=None,
            error_msg=None)
        try:
            collision = True

            post_resp = publisher_service.publish_cred(payload)
            #save success
            publish_record.publish_state = post_resp.ok
            publish_record.error_msg = post_resp.text if not post_resp.ok else None
            publish_record.orgbook_credential_id = post_resp.json().get("credential_id")

            publish_record.save()

        except IntegrityError as e:
            current_app.logger.info(
                f"credential hash collision, skipping duplicate payload for permit_amendment={permit_amendment_guid}"
            )
            collision = False

        return {
            "hash": payload_hash,
            "existing": existing,
            "collision": collision,
            "response": post_resp.json() if post_resp is not None else None
        }, 200

    @api.expect(query_parser)
    @api.doc(description="returns the prepared payload to be sent to the untp publisher")
    @requires_any_of([EDIT_PARTY, MINESPACE_PROPONENT])
    def get(self):
        if not is_feature_enabled(Feature.VC_W3C):
            raise ServiceUnavailable("This feature is not enabled.")

        data = self.query_parser.parse_args()
        permit_amendment_guid = data["permit_amendment_guid"]

        permit_amendment = PermitAmendment.find_by_permit_amendment_guid(permit_amendment_guid)

        payload = UNTPCredentialManager.prepare_permit_amendment_untp_credential_without_id(
            permit_amendment_guid)
        payload_hash = md5(dumps(payload).encode('utf-8')).hexdigest()

        existing: bool = PermitAmendmentOrgBookPublish.find_by_unsigned_payload_hash(
            payload_hash) is not None

        return {"hash": payload_hash, "existing": existing, "payload": payload}
