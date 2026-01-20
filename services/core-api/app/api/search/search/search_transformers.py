"""Transformers for converting ES hits to API response format using Flask-RESTX marshalling."""

from flask_restx import marshal
from app.api.search.response_models import (
    MINE_SEARCH_RESULT_MODEL,
    PARTY_SEARCH_RESULT_MODEL,
    PERMIT_SEARCH_RESULT_MODEL,
    MINE_DOCUMENT_SEARCH_RESULT_MODEL,
    EXPLOSIVES_PERMIT_SEARCH_RESULT_MODEL,
    NOW_APPLICATION_SEARCH_RESULT_MODEL,
    NOD_SEARCH_RESULT_MODEL,
)
from .search_constants import INDEX_TO_TYPE


def prepare_mine_source(source):
    """Prepare mine source data for marshalling."""
    # Extract status labels from nested structure
    status_labels = []
    mine_status = source.get('mine_status', [])
    if mine_status:
        for status in mine_status if isinstance(mine_status, list) else [mine_status]:
            xref = status.get('status_xref', {})
            if xref and xref.get('mine_operation_status_code'):
                status_labels.append(xref['mine_operation_status_code'])
    
    # Prepare the source dict with correct field names for the model
    prepared = dict(source)
    if status_labels:
        prepared['mine_status'] = {'status_labels': status_labels}
    prepared['mine_type'] = source.get('mine_types', [])
    prepared['mine_tailings_storage_facilities'] = source.get('tailings_storage_facilities', [])
    prepared['mine_work_information'] = source.get('work_information')
    
    return prepared


def prepare_party_source(source):
    """Prepare party source data for marshalling."""
    first_name = source.get('first_name', '')
    party_name = source.get('party_name', '')
    
    # Transform mine_party_appt relationships from indexed data
    # Note: Mine and permit details are left empty to avoid DB queries during search
    mine_party_appts = source.get('mine_party_appt', [])
    transformed_appts = []
    
    if mine_party_appts:
        if not isinstance(mine_party_appts, list):
            mine_party_appts = [mine_party_appts]
            
        for appt in mine_party_appts:
            if not appt:
                continue
                
            transformed_appts.append({
                'mine_party_appt_guid': appt.get('mine_party_appt_guid'),
                'mine_party_appt_type_code': appt.get('mine_party_appt_type_code'),
                'start_date': appt.get('start_date'),
                'end_date': appt.get('end_date'),
                'mine': None,
                'permit_no': None,
            })
    
    prepared = dict(source)
    prepared['name'] = f"{first_name} {party_name}".strip() if first_name else party_name
    prepared['party_orgbook_entity'] = None
    prepared['business_role_appts'] = []
    prepared['mine_party_appt'] = transformed_appts
    prepared['address'] = []
    
    return prepared


def prepare_permit_source(source):
    """Prepare permit source data for marshalling."""
    permittees = source.get('permittees', [])
    current_permittee = None
    if permittees:
        first_permittee = permittees[0] if isinstance(permittees, list) else permittees
        if first_permittee:
            first_name = first_permittee.get('first_name', '')
            party_name = first_permittee.get('party_name', '')
            current_permittee = f"{first_name} {party_name}".strip() if first_name else party_name

    mine_guids = source.get('mine_guids', [])
    mines = []
    if mine_guids:
        for guid in (mine_guids if isinstance(mine_guids, list) else [mine_guids]):
            mines.append({'mine_guid': guid, 'mine_name': '', 'mine_no': ''})

    prepared = dict(source)
    prepared['current_permittee'] = current_permittee
    prepared['mine'] = mines
    
    return prepared


def prepare_document_source(source):
    """Prepare document source data for marshalling."""
    mine_info = source.get('mine', {})
    
    prepared = dict(source)
    prepared['mine_name'] = mine_info.get('mine_name') if mine_info else None
    
    return prepared


def prepare_explosives_permit_source(source):
    """Prepare explosives permit source data for marshalling."""
    mine_info = source.get('mine', {})
    
    prepared = dict(source)
    prepared['mine_name'] = mine_info.get('mine_name') if mine_info else source.get('mine_name')
    
    return prepared


def prepare_now_application_source(source):
    """Prepare NoW application source data for marshalling."""
    mine_info = source.get('mine', {})
    application = source.get('application', {})
    
    prepared = dict(source)
    prepared['mine_name'] = mine_info.get('mine_name') if mine_info else source.get('mine_name')
    prepared['now_application_status_code'] = application.get('now_application_status_code') if application else source.get('now_application_status_code')
    prepared['notice_of_work_type_code'] = application.get('notice_of_work_type_code') if application else source.get('notice_of_work_type_code')
    
    return prepared


def prepare_nod_source(source):
    """Prepare NOD source data for marshalling."""
    mine_info = source.get('mine', {})
    
    prepared = dict(source)
    prepared['mine_name'] = mine_info.get('mine_name') if mine_info else source.get('mine_name')
    
    return prepared


# Mapping of document types to their prepare functions
PREPARE_FUNCTIONS = {
    'mine': prepare_mine_source,
    'party': prepare_party_source,
    'permit': prepare_permit_source,
    'mine_documents': prepare_document_source,
    'explosives_permit': prepare_explosives_permit_source,
    'now_application': prepare_now_application_source,
    'notice_of_departure': prepare_nod_source,
}

# Mapping of document types to their search result models
SEARCH_RESULT_MODELS = {
    'mine': MINE_SEARCH_RESULT_MODEL,
    'party': PARTY_SEARCH_RESULT_MODEL,
    'permit': PERMIT_SEARCH_RESULT_MODEL,
    'mine_documents': MINE_DOCUMENT_SEARCH_RESULT_MODEL,
    'explosives_permit': EXPLOSIVES_PERMIT_SEARCH_RESULT_MODEL,
    'now_application': NOW_APPLICATION_SEARCH_RESULT_MODEL,
    'notice_of_departure': NOD_SEARCH_RESULT_MODEL,
}


def transform_es_results(hits):
    """Transform ES hits into grouped results by type using Flask-RESTX marshalling."""
    results = {}

    for hit in hits:
        doc_type = INDEX_TO_TYPE.get(hit['_index'])
        if not doc_type or doc_type not in SEARCH_RESULT_MODELS:
            continue

        if doc_type not in results:
            results[doc_type] = []

        # Prepare the source data for the specific type
        prepare_fn = PREPARE_FUNCTIONS.get(doc_type)
        prepared_source = prepare_fn(hit['_source']) if prepare_fn else hit['_source']

        # Create the search result dict with score, type, and result
        search_result = {
            'score': hit['_score'],
            'type': doc_type,
            'result': prepared_source
        }

        # Marshal using the appropriate search result model
        marshalled_result = marshal(search_result, SEARCH_RESULT_MODELS[doc_type])
        results[doc_type].append(marshalled_result)

    return results
