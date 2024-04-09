from flask_restx import fields
from app.extensions import api

PARTY_VERIFIABLE_CREDENTIAL_CONNECTION = api.model(
    'PartyVerifiableCredentialConnection', {
        'invitation_id': fields.String,
        'party_guid': fields.String,
        'connection_id': fields.String,
        'connection_state': fields.String,
    })



PARTY_VERIFIABLE_CREDENTIAL_MINES_ACT_PERMIT = api.model(
    "PartyVerifiableCredentialMinesActPermit", {
        "party_guid": fields.String,
        "permit_amendment_guid": fields.String,
        "cred_exch_id": fields.String,
        "cred_exch_state": fields.String,
        "rev_reg_id": fields.String,
        "cred_rev_id": fields.String,
        "last_webhook_timestamp": fields.DateTime,
    }
)
