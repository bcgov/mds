"""Typed dict models describing the shapes of OrgBook / BC Registries API payloads.

These are pure typing aids (TypedDict instances are plain dicts at runtime), kept in
their own module so the request/response shapes used by `OrgBookService` and
`BCRegistriesService` are easy to find independent of the service logic.
"""
from typing import Any, Dict, List, Optional, TypedDict

# ---------------------------------------------------------------------------
# OrgBook search
# GET {ORGBOOK_API_URL}search/autocomplete
# ---------------------------------------------------------------------------


class OrgBookSearchResultItem(TypedDict):
    registration_id: str
    text: str
    credential_id: int


# ---------------------------------------------------------------------------
# BC Registries bulk business search
# POST /v2/search/businesses/bulk
# https://developer.connect.gov.bc.ca/oas/rs/tag/search/POST/v2/search/businesses/bulk
# ---------------------------------------------------------------------------


class _BusinessSearchResultRequired(TypedDict):
    identifier: str
    legalType: str
    status: str
    name: str


class BusinessSearchResult(_BusinessSearchResultRequired, total=False):
    bn: str
    score: float
    goodStanding: bool
    modernized: bool


class BulkBusinessSearchResponse(TypedDict):
    results: List[BusinessSearchResult]
    totalResults: int


# ---------------------------------------------------------------------------
# OrgBook credential
# GET {ORGBOOK_API_URL}credential/<credential_id>/formatted
# ---------------------------------------------------------------------------


class OrgBookIssuer(TypedDict):
    id: int
    has_logo: bool
    create_timestamp: str
    update_timestamp: str
    did: str
    name: str
    abbreviation: str
    email: str
    url: str
    endpoint: str


class OrgBookSchema(TypedDict):
    id: int
    create_timestamp: str
    update_timestamp: str
    name: str
    version: str
    origin_did: str


class OrgBookSchemaLabelText(TypedDict):
    label: str
    description: str


class OrgBookSchemaLabel(TypedDict, total=False):
    en: OrgBookSchemaLabelText


class OrgBookCredentialType(TypedDict):
    id: int
    issuer: OrgBookIssuer
    has_logo: bool
    create_timestamp: str
    update_timestamp: str
    description: str
    credential_def_id: str
    last_issue_date: str
    url: str
    credential_title: Optional[str]
    highlighted_attributes: List[str]
    schema_label: OrgBookSchemaLabel
    format: Optional[str]
    raw_data: Optional[str]
    schema: OrgBookSchema


class OrgBookAttribute(TypedDict):
    id: int
    type: str
    format: str
    value: str
    credential_id: int


# ---------------------------------------------------------------------------
# OrgBook credential verification
# GET {ORGBOOK_API_URL}credential/<credential_id>/verify
# ---------------------------------------------------------------------------


class OrgBookPresentationRequestedAttributeGroup(TypedDict):
    names: List[str]
    # Each restriction is a set of `cred_def_id` / `attr::<name>::value` key-value
    # pairs. The attribute keys are dynamic, so they can't be modeled precisely
    # with TypedDict.
    restrictions: List[Dict[str, str]]


class OrgBookPresentationRequest(TypedDict):
    nonce: str
    name: str
    version: str
    requested_attributes: Dict[str, OrgBookPresentationRequestedAttributeGroup]
    requested_predicates: Dict[str, Any]


class OrgBookRevealedAttrValue(TypedDict):
    raw: str
    encoded: str


class OrgBookRevealedAttrGroup(TypedDict):
    sub_proof_index: int
    values: Dict[str, OrgBookRevealedAttrValue]


class OrgBookRequestedProof(TypedDict):
    revealed_attrs: Dict[str, Any]
    revealed_attr_groups: Dict[str, OrgBookRevealedAttrGroup]
    self_attested_attrs: Dict[str, Any]
    unrevealed_attrs: Dict[str, Any]
    predicates: Dict[str, Any]


class OrgBookProofIdentifier(TypedDict):
    schema_id: str
    cred_def_id: str


class OrgBookPresentation(TypedDict):
    # The raw indy proof (`proofs`, `aggregated_proof`, etc.) is opaque
    # cryptographic data that isn't inspected by application code.
    proof: Dict[str, Any]
    requested_proof: OrgBookRequestedProof
    identifiers: List[OrgBookProofIdentifier]


class OrgBookVerificationResult(TypedDict):
    presentation_request: OrgBookPresentationRequest
    presentation: OrgBookPresentation


class OrgBookVerificationResponse(TypedDict):
    success: bool
    result: OrgBookVerificationResult
