from json import dumps, loads
from datetime import datetime
from flask import current_app, request
from werkzeug.exceptions import BadRequest, ServiceUnavailable
from flask_restx import Resource, reqparse
from app.api.utils.include.user_info import User
from app.api.utils.access_decorators import requires_any_of, MINESPACE_PROPONENT, EDIT_PARTY, VIEW_ALL

from app.config import Config
from app.extensions import api

from app.api.utils.resources_mixins import UserMixin
from app.api.services.traction_service import TractionService
from app.api.verifiable_credentials.manager import VerifiableCredentialManager, process_all_untp_map_for_orgbook
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

    

class W3CCredentialListResource(Resource, UserMixin):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument(
        'permit_amendment_guid',
        type=str,
        help='GUID of the permit amendment.',
        location='json',
        store_missing=False)

    @api.expect(parser)
    @api.doc(
        description=
        "returns a signed w3c credential for a specific permit_amendment, using new aca-py endpoints, but cannot use public did."
    )
    @requires_any_of([EDIT_PARTY, MINESPACE_PROPONENT])
    def post(self):
        if not is_feature_enabled(Feature.VC_W3C):
            raise ServiceUnavailable("This feature is not enabled.")

        data = self.parser.parse_args()
        permit_amendment = PermitAmendment.find_by_permit_amendment_guid(
            data["permit_amendment_guid"])
        traction_service = TractionService()
        did_dict = traction_service.fetch_a_random_did_key()
        private_did_key = did_dict["did"]
        #private did:key: isn't that helpful, not available to third parties
        credential_dict = VerifiableCredentialManager.produce_map_01_credential_payload(
            private_did_key, permit_amendment)

        signed_credential = traction_service.sign_jsonld_credential(credential_dict)
        current_app.logger.warning("credential signed by did:key, not publicly verifiable" +
                                   dumps(signed_credential))
        return signed_credential["verifiableCredential"]


class W3CCredentialDeprecatedResource(Resource, UserMixin):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument(
        'permit_amendment_guid',
        type=str,
        help='GUID of the permit amendment.',
        location='json',
        store_missing=False)

    @api.expect(parser)
    @api.doc(
        description=
        "returns a signed w3c credential for a specific permit_amendment using deprecated aca-py endpoint, but with did:indy:bcovrin:test:"
    )
    @requires_any_of([EDIT_PARTY, MINESPACE_PROPONENT])
    def post(self):
        if not is_feature_enabled(Feature.VC_W3C):
            raise ServiceUnavailable("This feature is not enabled.")

        data = self.parser.parse_args()
        permit_amendment = PermitAmendment.find_by_permit_amendment_guid(
            data["permit_amendment_guid"])
        traction_service = TractionService()
        public_did_dict = traction_service.fetch_current_public_did()
        public_did = "did:indy:bcovrin:test:" + public_did_dict["did"]
        public_verkey = public_did_dict["verkey"]

        credential_dict = VerifiableCredentialManager.produce_map_01_credential_payload(
            public_did, permit_amendment)

        signed_credential = traction_service.sign_jsonld_credential_deprecated(
            public_did, public_verkey, credential_dict)
        current_app.logger.warning(
            "credential signed by did:indy, not by did:web and using deprecated acapy endpoints" +
            dumps(signed_credential))
        return signed_credential["signed_doc"]


class W3CCredentialUNTPResource(Resource, UserMixin):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument(
        'permit_amendment_guid',
        type=str,
        help='GUID of the permit amendment.',
        location='json',
        store_missing=False)

    @api.expect(parser)
    @api.doc(
        description=
        "returns a UNTP Conformity Credential for specific permit_amendment using deprecated aca-py endpoint, but with DEV ONLY did:web"
    )
    @requires_any_of([EDIT_PARTY, MINESPACE_PROPONENT])
    def post(self):
        if not is_feature_enabled(Feature.VC_W3C):
            raise ServiceUnavailable("This feature is not enabled.")

        data = self.parser.parse_args()
        permit_amendment = PermitAmendment.find_by_permit_amendment_guid(
            data["permit_amendment_guid"])
        if not permit_amendment:
            raise BadRequest("Permit amendment not found")
        traction_service = TractionService()
        public_did_dict = traction_service.fetch_current_public_did()
        public_did = Config.CHIEF_PERMITTING_OFFICER_DID_WEB
        public_verkey = public_did_dict["verkey"]

        credential = VerifiableCredentialManager.produce_untp_cc_map_payload(
            public_did, permit_amendment)
        signed_credential = traction_service.sign_jsonld_credential_deprecated(
            public_did, public_verkey, credential)
        return signed_credential["signed_doc"]
