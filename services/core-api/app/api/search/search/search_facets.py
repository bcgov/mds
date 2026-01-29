"""Facet extraction from Elasticsearch aggregations."""

from .search_constants import INDEX_TO_TYPE, FACET_KEYS


def extract_simple_type_facets(aggs):
    """
    Extract simple facet counts by document type from ES aggregations.
    
    Used by simple search to get counts for autocomplete/preview results.
    Returns counts grouped by result type (mine, person, organization, etc.).
    
    Args:
        aggs: Elasticsearch aggregations response with by_index terms aggregation
        
    Returns:
        Dict with counts per type: {
            'mine': 0, 'person': 0, 'organization': 0, 'permit': 0,
            'nod': 0, 'explosives_permit': 0, 'now_application': 0,
            'mine_documents': 0, 'permit_documents': 0
        }
    """
    facets = {
        'mine': 0, 'person': 0, 'organization': 0, 'permit': 0,
        'nod': 0, 'explosives_permit': 0, 'now_application': 0,
        'mine_documents': 0, 'permit_documents': 0
    }
    
    # Map ES index names to facet keys
    index_to_facet = {
        'mines': 'mine',
        'mine_permits': 'permit',
        'notices_of_departure': 'nod',
        'explosives_permits': 'explosives_permit',
        'now_applications': 'now_application',
        'documents': 'mine_documents'
    }
    
    for bucket in _extract_buckets(aggs, 'by_index'):
        index_name = bucket['key']
        doc_count = bucket['doc_count']
        
        if index_name in index_to_facet:
            facets[index_to_facet[index_name]] = doc_count
        elif index_name == 'parties':
            # Split parties by type (person vs organization)
            for party_bucket in _extract_buckets(bucket, 'by_party_type'):
                party_type = party_bucket['key']
                if party_type == 'PER':
                    facets['person'] = party_bucket['doc_count']
                elif party_type == 'ORG':
                    facets['organization'] = party_bucket['doc_count']
    
    return facets


# Predefined values for facets that should always appear
PREDEFINED_FACETS = {
    'mine_classification': ['Major Mine', 'Regional Mine'],
    'has_tsf': ['Has TSF', 'No TSF'],
    'verified_status': ['Verified', 'Unverified'],
    'is_exploration': ['Exploration', 'Non-Exploration'],
    'party_type': ['Person', 'Organization'],
    'explosives_permit_closed': ['Open', 'Closed'],
    'type': ['mine', 'party', 'permit', 'mine_documents', 'notice_of_departure', 'explosives_permit', 'now_application'],
}


def _extract_buckets(aggs, key, nested_path=None):
    """Extract buckets from aggregation, handling nested paths."""
    data = aggs.get(key, {})
    if nested_path:
        for path in nested_path:
            data = data.get(path, {})
    return data.get('buckets', [])


def _parse_boolean_bucket(bucket, true_label, false_label):
    """Parse a boolean aggregation bucket."""
    key = bucket.get('key')
    key_as_string = bucket.get('key_as_string', '')
    is_true = key_as_string == 'true' or key == True or key == 1
    return {'key': true_label if is_true else false_label, 'count': bucket['doc_count']}


def _ensure_predefined_values(facet_list, facet_key):
    """Ensure all predefined values exist in the facet list, adding 0 counts for missing ones."""
    if facet_key not in PREDEFINED_FACETS:
        return facet_list
    
    existing_keys = {item['key'] for item in facet_list}
    for predefined_key in PREDEFINED_FACETS[facet_key]:
        if predefined_key not in existing_keys:
            facet_list.append({'key': predefined_key, 'count': 0})
    
    return facet_list


def extract_facets(aggs):
    """Extract facet data from ES aggregations."""
    facets = {k: [] for k in FACET_KEYS}

    # Type facets (by index)
    for bucket in _extract_buckets(aggs, 'by_index'):
        type_name = INDEX_TO_TYPE.get(bucket['key'], bucket['key'])
        facets['type'].append({'key': type_name, 'count': bucket['doc_count']})
    facets['type'] = _ensure_predefined_values(facets['type'], 'type')

    # Mine region
    for bucket in _extract_buckets(aggs, 'mine_region'):
        if bucket['key'] != 'Unknown':
            facets['mine_region'].append({'key': bucket['key'], 'count': bucket['doc_count']})

    # Classification (major vs regional)
    for bucket in _extract_buckets(aggs, 'major_mine_ind'):
        facets['mine_classification'].append(_parse_boolean_bucket(bucket, 'Major Mine', 'Regional Mine'))
    facets['mine_classification'] = _ensure_predefined_values(facets['mine_classification'], 'mine_classification')

    # Operation status (nested)
    for bucket in _extract_buckets(aggs, 'mine_operation_status', ['status_codes', 'codes']):
        facets['mine_operation_status'].append({'key': bucket['key'], 'count': bucket['doc_count']})

    # Tenure (nested)
    for bucket in _extract_buckets(aggs, 'mine_tenure', ['tenure_codes']):
        facets['mine_tenure'].append({'key': bucket['key'], 'count': bucket['doc_count']})

    # Commodity (nested)
    for bucket in _extract_buckets(aggs, 'mine_commodity', ['details', 'commodity_codes']):
        if bucket['key']:
            facets['mine_commodity'].append({'key': bucket['key'], 'count': bucket['doc_count']})

    # TSF
    tsf_count = aggs.get('has_tsf', {}).get('count', {}).get('value', 0)
    total_mines = sum(b['doc_count'] for b in _extract_buckets(aggs, 'by_index') if b['key'] == 'mines')
    facets['has_tsf'].append({'key': 'Has TSF', 'count': tsf_count})
    facets['has_tsf'].append({'key': 'No TSF', 'count': max(0, total_mines - tsf_count)})

    # Verified status (nested)
    for bucket in _extract_buckets(aggs, 'verified_status', ['healthy']):
        facets['verified_status'].append(_parse_boolean_bucket(bucket, 'Verified', 'Unverified'))
    facets['verified_status'] = _ensure_predefined_values(facets['verified_status'], 'verified_status')

    # Permit status
    for bucket in _extract_buckets(aggs, 'permit_status'):
        facets['permit_status'].append({'key': bucket['key'], 'count': bucket['doc_count']})

    # Is exploration
    for bucket in _extract_buckets(aggs, 'is_exploration'):
        facets['is_exploration'].append(_parse_boolean_bucket(bucket, 'Exploration', 'Non-Exploration'))
    facets['is_exploration'] = _ensure_predefined_values(facets['is_exploration'], 'is_exploration')

    # Party type
    for bucket in _extract_buckets(aggs, 'party_type'):
        label = {'ORG': 'Organization', 'PER': 'Person'}.get(bucket['key'], bucket['key'])
        facets['party_type'].append({'key': label, 'count': bucket['doc_count']})
    facets['party_type'] = _ensure_predefined_values(facets['party_type'], 'party_type')

    # Explosives permit status
    for bucket in _extract_buckets(aggs, 'explosives_permit_status'):
        facets['explosives_permit_status'].append({'key': bucket['key'], 'count': bucket['doc_count']})

    # Explosives permit closed
    for bucket in _extract_buckets(aggs, 'explosives_permit_closed'):
        facets['explosives_permit_closed'].append(_parse_boolean_bucket(bucket, 'Closed', 'Open'))
    facets['explosives_permit_closed'] = _ensure_predefined_values(facets['explosives_permit_closed'], 'explosives_permit_closed')

    # NOD type
    for bucket in _extract_buckets(aggs, 'nod_type'):
        facets['nod_type'].append({'key': bucket['key'], 'count': bucket['doc_count']})

    # NOD status
    for bucket in _extract_buckets(aggs, 'nod_status'):
        facets['nod_status'].append({'key': bucket['key'], 'count': bucket['doc_count']})

    # NoW application status (nested)
    for bucket in _extract_buckets(aggs, 'now_application_status', ['status_codes']):
        facets['now_application_status'].append({'key': bucket['key'], 'count': bucket['doc_count']})

    # NoW type (nested)
    for bucket in _extract_buckets(aggs, 'now_type', ['type_codes']):
        facets['now_type'].append({'key': bucket['key'], 'count': bucket['doc_count']})

    return facets
