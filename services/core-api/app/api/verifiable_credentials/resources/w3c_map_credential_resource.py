from json import dumps, loads
from hashlib import md5
from datetime import datetime
from flask import current_app, request
from werkzeug.exceptions import BadRequest, ServiceUnavailable
from flask_restx import Resource, reqparse
from app.api.utils.include.user_info import User
from app.api.utils.access_decorators import requires_any_of, MINESPACE_PROPONENT, EDIT_PARTY, VIEW_ALL

from app.config import Config
from app.extensions import api

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
        assert payload is not None, f"payload is None for permit_amendment_guid={permit_amendment_guid}"
        payload_hash = md5(dumps(payload).encode('utf-8')).hexdigest()

        existing: bool = PermitAmendmentOrgBookPublish.find_by_unsigned_payload_hash(
            payload_hash) is not None

        if existing:
            raise BadRequest(
                f"Permit amendment {permit_amendment_guid} has already been published to the UNTP publisher."
            )

        publisher_service = UNTPPublisherService()

        return publisher_service.publish_cred(payload).json()

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
