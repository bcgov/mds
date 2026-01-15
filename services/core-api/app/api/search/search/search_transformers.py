"""Transformers for converting ES hits to API response format."""

from .search_constants import INDEX_TO_TYPE


def transform_mine_hit(hit):
    """Transform ES hit to mine result format."""
    source = hit['_source']

    status_labels = []
    mine_status = source.get('mine_status', [])
    if mine_status:
        for status in mine_status if isinstance(mine_status, list) else [mine_status]:
            xref = status.get('status_xref', {})
            if xref and xref.get('mine_operation_status_code'):
                status_labels.append(xref['mine_operation_status_code'])

    return {
        'mine_guid': source.get('mine_guid'),
        'mine_name': source.get('mine_name'),
        'mine_no': source.get('mine_no'),
        'mine_region': source.get('mine_region'),
        'mms_alias': source.get('mms_alias'),
        'major_mine_ind': source.get('major_mine_ind'),
        'mine_status': {'status_labels': status_labels} if status_labels else None,
        'permits': source.get('permits', []),
        'mine_type': source.get('mine_types', []),
        'mine_tailings_storage_facilities': source.get('tailings_storage_facilities', []),
        'mine_work_information': source.get('work_information'),
        'verified_status': source.get('verified_status'),
    }


def enrich_party_appointments(party_results):
    """
    Enrich party results with mine names and permit numbers for their appointments.
    This is a post-processing step since pgsync can't index nested relationships properly.
    """
    from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointment
    from sqlalchemy.orm import joinedload
    
    # Collect all party GUIDs that have appointments
    party_guids_with_appts = [
        p['party_guid'] for p in party_results 
        if p.get('mine_party_appt') and len(p['mine_party_appt']) > 0
    ]
    
    if not party_guids_with_appts:
        return party_results
    
    # Fetch all appointments with mine and permit data in one query
    appointments = MinePartyAppointment.query.filter(
        MinePartyAppointment.party_guid.in_(party_guids_with_appts),
        MinePartyAppointment.deleted_ind == False
    ).options(
        joinedload(MinePartyAppointment.mine),
        joinedload(MinePartyAppointment.permit)
    ).all()
    
    # Build a map of party_guid -> appointments with full data
    appt_map = {}
    for appt in appointments:
        if appt.party_guid not in appt_map:
            appt_map[appt.party_guid] = []
        
        appt_map[appt.party_guid].append({
            'mine_party_appt_guid': str(appt.mine_party_appt_guid),
            'mine_party_appt_type_code': appt.mine_party_appt_type_code,
            'start_date': str(appt.start_date) if appt.start_date else None,
            'end_date': str(appt.end_date) if appt.end_date else None,
            'mine': {
                'mine_guid': str(appt.mine.mine_guid),
                'mine_name': appt.mine.mine_name
            } if appt.mine else None,
            'permit_no': appt.permit.permit_no if appt.permit else None,
        })
    
    # Enrich the party results with full appointment data
    for party in party_results:
        party_guid = party['party_guid']
        if party_guid in appt_map:
            party['mine_party_appt'] = appt_map[party_guid]
    
    return party_results


def transform_party_hit(hit):
    """Transform ES hit to party result format."""
    source = hit['_source']
    first_name = source.get('first_name', '')
    party_name = source.get('party_name', '')
    
    # Transform mine_party_appt relationships
    # Note: Only basic appointment data is indexed (type, dates)
    # Mine names and permit numbers will be enriched via enrich_party_appointments()
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
                'mine': None,  # Will be enriched by enrich_party_appointments()
                'permit_no': None,  # Will be enriched by enrich_party_appointments()
            })
    
    return {
        'party_guid': source.get('party_guid'),
        'name': f"{first_name} {party_name}".strip() if first_name else party_name,
        'first_name': first_name,
        'party_name': party_name,
        'party_type_code': source.get('party_type_code'),
        'email': source.get('email'),
        'phone_no': source.get('phone_no'),
        'party_orgbook_entity': None,
        'business_role_appts': [],
        'mine_party_appt': transformed_appts,
        'address': [],
    }


def transform_permit_hit(hit):
    """Transform ES hit to permit result format."""
    source = hit['_source']

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

    return {
        'permit_guid': source.get('permit_guid'),
        'permit_no': source.get('permit_no'),
        'current_permittee': current_permittee,
        'mine': mines,
    }


def transform_document_hit(hit):
    """Transform ES hit to document result format."""
    source = hit['_source']
    mine_info = source.get('mine', {})

    return {
        'mine_guid': source.get('mine_guid'),
        'mine_document_guid': source.get('mine_document_guid'),
        'document_name': source.get('document_name'),
        'mine_name': mine_info.get('mine_name') if mine_info else None,
        'document_manager_guid': source.get('document_manager_guid'),
        'upload_date': source.get('upload_date'),
        'create_user': source.get('create_user'),
    }


def transform_explosives_permit_hit(hit):
    """Transform ES hit to explosives permit result format."""
    source = hit['_source']
    mine_info = source.get('mine', {})

    return {
        'explosives_permit_guid': source.get('explosives_permit_guid'),
        'explosives_permit_id': source.get('explosives_permit_id'),
        'application_number': source.get('application_number'),
        'application_status': source.get('application_status'),
        'mine_guid': source.get('mine_guid'),
        'mine_name': mine_info.get('mine_name') if mine_info else source.get('mine_name'),
        'is_closed': source.get('is_closed'),
    }


def transform_now_application_hit(hit):
    """Transform ES hit to NoW application result format."""
    source = hit['_source']
    mine_info = source.get('mine', {})
    application = source.get('application', {})

    return {
        'now_application_guid': source.get('now_application_guid'),
        'now_number': source.get('now_number'),
        'mine_guid': source.get('mine_guid'),
        'mine_name': mine_info.get('mine_name') if mine_info else source.get('mine_name'),
        'now_application_status_code': application.get('now_application_status_code') if application else source.get('now_application_status_code'),
        'notice_of_work_type_code': application.get('notice_of_work_type_code') if application else source.get('notice_of_work_type_code'),
    }


def transform_nod_hit(hit):
    """Transform ES hit to NOD result format."""
    source = hit['_source']
    mine_info = source.get('mine', {})

    return {
        'nod_guid': source.get('nod_guid'),
        'nod_no': source.get('nod_no'),
        'nod_title': source.get('nod_title'),
        'mine_guid': source.get('mine_guid'),
        'mine_name': mine_info.get('mine_name') if mine_info else source.get('mine_name'),
        'nod_type': source.get('nod_type'),
        'nod_status': source.get('nod_status'),
    }


TRANSFORMERS = {
    'mine': transform_mine_hit,
    'party': transform_party_hit,
    'permit': transform_permit_hit,
    'mine_documents': transform_document_hit,
    'explosives_permit': transform_explosives_permit_hit,
    'now_application': transform_now_application_hit,
    'notice_of_departure': transform_nod_hit,
}


def transform_es_results(hits):
    """Transform ES hits into grouped results by type."""
    results = {}

    for hit in hits:
        doc_type = INDEX_TO_TYPE.get(hit['_index'])
        if not doc_type:
            continue

        if doc_type not in results:
            results[doc_type] = []

        transformer = TRANSFORMERS.get(doc_type)
        result = transformer(hit) if transformer else hit['_source']

        results[doc_type].append({
            'score': hit['_score'],
            'type': doc_type,
            'result': result
        })

    return results
