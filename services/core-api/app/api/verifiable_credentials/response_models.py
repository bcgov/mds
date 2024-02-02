from flask_restx import fields
from app.extensions import api

PARTY_VERIFIABLE_CREDENTIAL_CONNECTION = api.model(
    'PartyVerifiableCredentialConnection', {
        'invitation_id': fields.String,
        'party_guid': fields.String,
        'connection_id': fields.String,
        'connection_state': fields.String,
    })
