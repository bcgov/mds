from app.api.mines.response_models import (
    MINE_TSF_MODEL,
    MINE_TYPE_MODEL,
    MINE_VERIFIED_MODEL,
    MINE_WORK_INFORMATION_MODEL,
)
from app.api.parties.response_models import (
    PARTY_BUSINESS_ROLE_APPT,
    PARTY_ORGBOOK_ENTITY,
)
from app.extensions import api
from flask_restx import fields

SEARCH_RESULT_MODEL = api.model('SearchResult', {
    'score': fields.Integer,
    'type': fields.String,
})

SIMPLE_SEARCH_MODEL = api.model('SimpleSearchResult', {
    'id': fields.String,
    'value': fields.String,
    'description': fields.String,
    'highlight': fields.String,
})

MINE_MODEL = api.model('Mine_simple ', {
    'mine_name': fields.String,
    'mine_guid': fields.String,
    'mine_no': fields.String,
})
PERMIT_SEARCH_MODEL = api.model(
    'Permit', {
        'permit_guid': fields.String,
        'mine': fields.List(fields.Nested(MINE_MODEL), attribute=lambda x: x._all_mines),
        'permit_no': fields.String,
        'current_permittee': fields.String,
    })

MINE_PARTY_APPT_MODEL = api.model(
    'MinePartyAppointment', {
        'mine_party_appt_type_code': fields.String,
        'start_date': fields.Date,
        'end_date': fields.Date,
        'mine': fields.Nested(MINE_MODEL),
        'permit_no': fields.String(attribute='permit.permit_no'),
    })

MINE_STATUS_MODEL = api.model('MineStatus', {
    'status_labels': fields.List(fields.String),
})

MINE_SEARCH_MODEL = api.model(
    'Mine', {
        'mine_guid': fields.String,
        'mine_name': fields.String,
        'mine_no': fields.String,
        'mine_region': fields.String,
        'mine_permit': fields.List(fields.Nested(PERMIT_SEARCH_MODEL)),
        'mine_status': fields.Nested(MINE_STATUS_MODEL),
        'mms_alias': fields.String,
        'major_mine_ind': fields.Boolean,
        'mine_type': fields.List(fields.Nested(MINE_TYPE_MODEL)),
        'mine_tailings_storage_facilities': fields.List(fields.Nested(MINE_TSF_MODEL)),
        'mine_work_information': fields.Nested(MINE_WORK_INFORMATION_MODEL),
        'verified_status': fields.Nested(MINE_VERIFIED_MODEL),
    })

PARTY_ADDRESS = api.model(
    'Address', {
        'suite_no': fields.String,
        'address_line_1': fields.String,
        'address_line_2': fields.String,
        'city': fields.String,
        'sub_division_code': fields.String,
        'post_code': fields.String,
        'address_type_code': fields.String,
    })

PARTY_SEARCH_MODEL = api.model(
    'Party', {
        'party_guid': fields.String,
        'name': fields.String,
        'first_name': fields.String,
        'party_name': fields.String,
        'party_type_code': fields.String,
        'email': fields.String,
        'phone_no': fields.String,
        'party_orgbook_entity': fields.Nested(PARTY_ORGBOOK_ENTITY, skip_none=True),
        'business_role_appts': fields.List(fields.Nested(PARTY_BUSINESS_ROLE_APPT, skip_none=True)),
        'mine_party_appt': fields.List(fields.Nested(MINE_PARTY_APPT_MODEL)),
        'address': fields.List(fields.Nested(PARTY_ADDRESS)),
    })

MINE_DOCUMENT_SEARCH_MODEL = api.model(
    'MineDocument', {
        'mine_guid': fields.String,
        'mine_document_guid': fields.String,
        'document_name': fields.String,
        'mine_name': fields.String,
        'document_manager_guid': fields.String,
        'upload_date': fields.String,
        'create_user': fields.String
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

SEARCH_FACET_BUCKET_MODEL = api.model(
    'SearchFacetBucket', {
        'key': fields.String,
        'count': fields.Integer,
    })

SEARCH_FACETS_MODEL = api.model(
    'SearchFacets', {
        # Mine facets
        'mine_region': fields.List(fields.Nested(SEARCH_FACET_BUCKET_MODEL)),
        'mine_classification': fields.List(fields.Nested(SEARCH_FACET_BUCKET_MODEL)),
        'mine_operation_status': fields.List(fields.Nested(SEARCH_FACET_BUCKET_MODEL)),
        'mine_tenure': fields.List(fields.Nested(SEARCH_FACET_BUCKET_MODEL)),
        'mine_commodity': fields.List(fields.Nested(SEARCH_FACET_BUCKET_MODEL)),
        'has_tsf': fields.List(fields.Nested(SEARCH_FACET_BUCKET_MODEL)),
        'verified_status': fields.List(fields.Nested(SEARCH_FACET_BUCKET_MODEL)),
        # Permit facets
        'permit_status': fields.List(fields.Nested(SEARCH_FACET_BUCKET_MODEL)),
        'is_exploration': fields.List(fields.Nested(SEARCH_FACET_BUCKET_MODEL)),
        # Party facets
        'party_type': fields.List(fields.Nested(SEARCH_FACET_BUCKET_MODEL)),
        # Explosives permit facets
        'explosives_permit_status': fields.List(fields.Nested(SEARCH_FACET_BUCKET_MODEL)),
        'explosives_permit_closed': fields.List(fields.Nested(SEARCH_FACET_BUCKET_MODEL)),
        # NOD facets
        'nod_type': fields.List(fields.Nested(SEARCH_FACET_BUCKET_MODEL)),
        'nod_status': fields.List(fields.Nested(SEARCH_FACET_BUCKET_MODEL)),
        # NoW facets
        'now_application_status': fields.List(fields.Nested(SEARCH_FACET_BUCKET_MODEL)),
        'now_type': fields.List(fields.Nested(SEARCH_FACET_BUCKET_MODEL)),
        # Type facet
        'type': fields.List(fields.Nested(SEARCH_FACET_BUCKET_MODEL)),
    })

SEARCH_RESULT_RETURN_MODEL = api.model(
    'SearchResultReturn', {
        'search_terms': fields.List(fields.String),
        'search_results': fields.Nested(SEARCH_RESULTS_LIST_MODEL),
        'facets': fields.Nested(SEARCH_FACETS_MODEL),
    })

SIMPLE_SEARCH_FACETS_MODEL = api.model(
    'SimpleSearchFacets', {
        'mine': fields.Integer,
        'person': fields.Integer,
        'organization': fields.Integer,
        'permit': fields.Integer,
        'nod': fields.Integer,
        'explosives_permit': fields.Integer,
    })

SIMPLE_SEARCH_RESULT_RETURN_MODEL = api.model(
    'SimpleSearchResultReturn', {
        'search_terms': fields.List(fields.String),
        'search_results': fields.List(fields.Nested(SIMPLE_SEARCH_RESULT_MODEL)),
        'facets': fields.Nested(SIMPLE_SEARCH_FACETS_MODEL),
    })
