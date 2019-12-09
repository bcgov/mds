from flask_restplus import fields
from app.extensions import api

SEARCH_RESULT_MODEL = api.model('SearchResult', {
    'score': fields.Integer,
    'type': fields.String,
})

SIMPLE_SEARCH_MODEL = api.model('SimpleSearchResult', {
    'id': fields.String,
    'value': fields.String,
})

MINE_MODEL = api.model('Mine', {'mine_name': fields.String})

MINE_PARTY_APPT_MODEL = api.model('MinePartyAppointment', {
    'mine_party_appt_type_code': fields.String,
    'mine': fields.Nested(MINE_MODEL)
})

MINE_STATUS_MODEL = api.model('MineStatus', {
    'status_labels': fields.List(fields.String),
})

PERMIT_SEARCH_MODEL = api.model(
    'Permit', {
        'permit_guid': fields.String,
        'mine_guid': fields.String,
        'permit_no': fields.String,
        'mine_name': fields.String,
        'current_permittee': fields.String,
    })

MINE_SEARCH_MODEL = api.model(
    'Mine', {
        'mine_guid': fields.String,
        'mine_name': fields.String,
        'mine_no': fields.String,
        'mine_region': fields.String,
        'mine_permit': fields.List(fields.Nested(PERMIT_SEARCH_MODEL)),
        'mine_status': fields.Nested(MINE_STATUS_MODEL)
    })

PARTY_SEARCH_MODEL = api.model(
    'Party', {
        'party_guid': fields.String,
        'name': fields.String,
        'email': fields.String,
        'phone_no': fields.String,
        'mine_party_appt': fields.List(fields.Nested(MINE_PARTY_APPT_MODEL)),
    })

MINE_DOCUMENT_SEARCH_MODEL = api.model(
    'MineDocument', {
        'mine_guid': fields.String,
        'mine_document_guid': fields.String,
        'document_name': fields.String,
        'mine_name': fields.String,
        'document_manager_guid': fields.String,
    })

PERMIT_DOCUMENT_SEARCH_MODEL = api.model(
    'PermitDocument', {
        'mine_guid': fields.String,
        'permit_amendment_document_guid': fields.String,
        'document_name': fields.String,
        'mine_name': fields.String,
        'document_manager_guid': fields.String,
    })

MINE_SEARCH_RESULT_MODEL = api.inherit('MineSearchResult', SEARCH_RESULT_MODEL, {
    'result': fields.Nested(MINE_SEARCH_MODEL),
})

PARTY_SEARCH_RESULT_MODEL = api.inherit('PartySearchResult', SEARCH_RESULT_MODEL, {
    'result': fields.Nested(PARTY_SEARCH_MODEL),
})

PERMIT_SEARCH_RESULT_MODEL = api.inherit('PermitSearchResult', SEARCH_RESULT_MODEL, {
    'result': fields.Nested(PERMIT_SEARCH_MODEL),
})

MINE_DOCUMENT_SEARCH_RESULT_MODEL = api.inherit('MineDocumentSearchResult', SEARCH_RESULT_MODEL, {
    'result': fields.Nested(MINE_DOCUMENT_SEARCH_MODEL),
})

PERMIT_DOCUMENT_SEARCH_RESULT_MODEL = api.inherit(
    'PermitDocumentSearchResult', SEARCH_RESULT_MODEL, {
        'result': fields.Nested(PERMIT_DOCUMENT_SEARCH_MODEL),
    })

SIMPLE_SEARCH_RESULT_MODEL = api.inherit('MineSearchResult', SEARCH_RESULT_MODEL, {
    'result': fields.Nested(SIMPLE_SEARCH_MODEL),
})

SEARCH_RESULTS_LIST_MODEL = api.model(
    'SearchResultList', {
        'mine': fields.List(fields.Nested(MINE_SEARCH_RESULT_MODEL)),
        'party': fields.List(fields.Nested(PARTY_SEARCH_RESULT_MODEL)),
        'permit': fields.List(fields.Nested(PERMIT_SEARCH_RESULT_MODEL)),
        'mine_documents': fields.List(fields.Nested(MINE_DOCUMENT_SEARCH_RESULT_MODEL)),
        'permit_documents': fields.List(fields.Nested(PERMIT_DOCUMENT_SEARCH_RESULT_MODEL)),
    })

SEARCH_RESULT_RETURN_MODEL = api.model(
    'SearchResultReturn', {
        'search_terms': fields.List(fields.String),
        'search_results': fields.Nested(SEARCH_RESULTS_LIST_MODEL),
    })

SIMPLE_SEARCH_RESULT_RETURN_MODEL = api.model(
    'SimpleSearchResultReturn', {
        'search_terms': fields.List(fields.String),
        'search_results': fields.List(fields.Nested(SIMPLE_SEARCH_RESULT_MODEL)),
    })
