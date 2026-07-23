from flask_restx import fields

from app.extensions import api

ORGBOOK_SEARCH_RESULT_ITEM = api.model('OrgBookSearchResultItem', {
    'registration_id': fields.String,
    'text': fields.String,
})

# ---------------------------------------------------------------------------
# OrgBook credential
# GET {ORGBOOK_API_URL}credential/<credential_id>/formatted
# ---------------------------------------------------------------------------

ORGBOOK_ISSUER = api.model(
    'OrgBookIssuer', {
        'id': fields.Integer,
        'has_logo': fields.Boolean,
        'create_timestamp': fields.String,
        'update_timestamp': fields.String,
        'did': fields.String,
        'name': fields.String,
        'abbreviation': fields.String,
        'email': fields.String,
        'url': fields.String,
        'endpoint': fields.String,
    })

ORGBOOK_SCHEMA = api.model(
    'OrgBookSchema', {
        'id': fields.Integer,
        'create_timestamp': fields.String,
        'update_timestamp': fields.String,
        'name': fields.String,
        'version': fields.String,
        'origin_did': fields.String,
    })

ORGBOOK_CREDENTIAL_TYPE = api.model(
    'OrgBookCredentialType',
    {
        'id': fields.Integer,
        'issuer': fields.Nested(ORGBOOK_ISSUER),
        'has_logo': fields.Boolean,
        'create_timestamp': fields.String,
        'update_timestamp': fields.String,
        'description': fields.String,
        'credential_def_id': fields.String,
        'last_issue_date': fields.String,
        'url': fields.String,
        'credential_title': fields.String,
        'highlighted_attributes': fields.List(fields.String),
                                                              # Keyed by language code (e.g. "en"), so left untyped.
        'schema_label': fields.Raw,
        'format': fields.String,
        'raw_data': fields.Raw,
        'schema': fields.Nested(ORGBOOK_SCHEMA),
    })

ORGBOOK_ATTRIBUTE = api.model(
    'OrgBookAttribute', {
        'id': fields.Integer,
        'type': fields.String,
        'format': fields.String,
        'value': fields.String,
        'credential_id': fields.Integer,
    })

# ORGBOOK_CREDENTIAL_SET_ENTRY = api.model(
#     'OrgBookCredentialSetEntry', {
#         'id': fields.Integer,
#         'create_timestamp': fields.String,
#         'effective_date': fields.String,
#         'inactive': fields.Boolean,
#         'latest': fields.Boolean,
#         'revoked': fields.Boolean,
#         'revoked_date': fields.String,
#         'credential_id': fields.String,
#         'credential_type': fields.Nested(ORGBOOK_CREDENTIAL_TYPE),
#         'addresses': fields.List(fields.Raw),
#         'attributes': fields.List(fields.Nested(ORGBOOK_ATTRIBUTE)),
#         'names': fields.List(fields.Nested(ORGBOOK_ENTITY_NAME)),
#         'local_name': fields.Nested(ORGBOOK_ENTITY_NAME, allow_null=True, skip_none=True),
#         'remote_name': fields.Nested(ORGBOOK_ENTITY_NAME, allow_null=True, skip_none=True),
#         'topic': fields.Nested(ORGBOOK_TOPIC),
#         'related_topics': fields.List(fields.Raw),
#         'raw_data': fields.Raw,
#     })

# ORGBOOK_CREDENTIAL_SET = api.model(
#     'OrgBookCredentialSet', {
#         'id': fields.Integer,
#         'create_timestamp': fields.String,
#         'update_timestamp': fields.String,
#         'latest_credential_id': fields.Integer,
#         'topic_id': fields.Integer,
#         'first_effective_date': fields.String,
#         'last_effective_date': fields.String,
#         'credentials': fields.List(fields.Nested(ORGBOOK_CREDENTIAL_SET_ENTRY)),
#     })

ORGBOOK_CREDENTIAL = api.model(
    'OrgBookCredential',
    {
        'id': fields.Integer,
                                                                         #'create_timestamp': fields.String,
                                                                         #'effective_date': fields.String,
                                                                         #'inactive': fields.Boolean,
                                                                         #'latest': fields.Boolean,
                                                                         #'revoked': fields.Boolean,
                                                                         #'revoked_date': fields.String,
                                                                         #'credential_id': fields.String,
                                                                         #'credential_type': fields.Nested(ORGBOOK_CREDENTIAL_TYPE),
                                                                         #'addresses': fields.List(fields.Raw),
                                                                         #'attributes': fields.List(fields.Nested(ORGBOOK_ATTRIBUTE)),
        'names': fields.List(fields.Nested(ORGBOOK_SEARCH_RESULT_ITEM)),
                                                                         #'local_name': fields.Nested(ORGBOOK_ENTITY_NAME, allow_null=True, skip_none=True),
                                                                         #'remote_name': fields.Nested(ORGBOOK_ENTITY_NAME, allow_null=True, skip_none=True),
                                                                         #'topic': fields.Nested(ORGBOOK_TOPIC),
                                                                         #'related_topics': fields.List(fields.Raw),
                                                                         #'raw_data': fields.Raw,
                                                                         #'credential_set': fields.Nested(ORGBOOK_CREDENTIAL_SET),
    })

# ---------------------------------------------------------------------------
# OrgBook credential verification
# GET {ORGBOOK_API_URL}credential/<credential_id>/verify
# ---------------------------------------------------------------------------

ORGBOOK_PRESENTATION_REQUEST = api.model(
    'OrgBookPresentationRequest',
    {
        'nonce': fields.String,
        'name': fields.String,
        'version': fields.String,
                                                 # Keyed by dynamic referent names (e.g. "self-verify-proof").
        'requested_attributes': fields.Raw,
        'requested_predicates': fields.Raw,
    })

ORGBOOK_PROOF_IDENTIFIER = api.model('OrgBookProofIdentifier', {
    'schema_id': fields.String,
    'cred_def_id': fields.String,
})

ORGBOOK_REQUESTED_PROOF = api.model(
    'OrgBookRequestedProof', {
        'revealed_attrs': fields.Raw,
        'revealed_attr_groups': fields.Raw,
        'self_attested_attrs': fields.Raw,
        'unrevealed_attrs': fields.Raw,
        'predicates': fields.Raw,
    })

ORGBOOK_PRESENTATION = api.model(
    'OrgBookPresentation',
    {
                                                                             # Opaque indy cryptographic proof data.
        'proof': fields.Raw,
        'requested_proof': fields.Nested(ORGBOOK_REQUESTED_PROOF),
        'identifiers': fields.List(fields.Nested(ORGBOOK_PROOF_IDENTIFIER)),
    })

ORGBOOK_VERIFICATION_RESULT = api.model(
    'OrgBookVerificationResult', {
        'presentation_request': fields.Nested(ORGBOOK_PRESENTATION_REQUEST),
        'presentation': fields.Nested(ORGBOOK_PRESENTATION),
    })

ORGBOOK_VERIFICATION_RESPONSE = api.model('OrgBookVerificationResponse', {
    'success': fields.Boolean,
    'result': fields.Nested(ORGBOOK_VERIFICATION_RESULT),
})
