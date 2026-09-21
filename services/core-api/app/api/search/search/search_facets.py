"""Facet extraction from Elasticsearch aggregations."""

from .search_constants import FACET_KEYS, INDEX_TO_TYPE


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


def _append_bucket_facets(facets, facet_key, aggs, agg_key, nested_path=None, transform=None, filter_fn=None):
    """Append buckets from an aggregation to a facet list."""
    for bucket in _extract_buckets(aggs, agg_key, nested_path):
        if filter_fn and not filter_fn(bucket):
            continue
        item = transform(bucket) if transform else {'key': bucket['key'], 'count': bucket['doc_count']}
        facets[facet_key].append(item)


def _append_boolean_facets(facets, facet_key, aggs, agg_key, true_label, false_label, nested_path=None):
    """Append boolean bucket facets with labels."""
    _append_bucket_facets(
        facets,
        facet_key,
        aggs,
        agg_key,
        nested_path=nested_path,
        transform=lambda b: _parse_boolean_bucket(b, true_label, false_label)
    )


def extract_facets(aggs):
    """Extract facet data from ES aggregations."""
    facets = {k: [] for k in FACET_KEYS}

    # Type facets (by index)
    for bucket in _extract_buckets(aggs, 'by_index'):
        type_name = INDEX_TO_TYPE.get(bucket['key'], bucket['key'])
        facets['type'].append({'key': type_name, 'count': bucket['doc_count']})
    facets['type'] = _ensure_predefined_values(facets['type'], 'type')

    # Mine region
    _append_bucket_facets(
        facets,
        'mine_region',
        aggs,
        'mine_region',
        filter_fn=lambda b: b['key'] != 'Unknown'
    )

    # Classification (major vs regional)
    _append_boolean_facets(facets, 'mine_classification', aggs, 'major_mine_ind', 'Major Mine', 'Regional Mine')
    facets['mine_classification'] = _ensure_predefined_values(facets['mine_classification'], 'mine_classification')

    # Operation status (nested)
    _append_bucket_facets(
        facets,
        'mine_operation_status',
        aggs,
        'mine_operation_status',
        nested_path=['status_codes', 'codes']
    )

    # Tenure (nested)
    _append_bucket_facets(facets, 'mine_tenure', aggs, 'mine_tenure', nested_path=['tenure_codes'])

    # Commodity (nested)
    _append_bucket_facets(
        facets,
        'mine_commodity',
        aggs,
        'mine_commodity',
        nested_path=['details', 'commodity_codes'],
        filter_fn=lambda b: b['key']
    )

    # TSF
    tsf_count = aggs.get('has_tsf', {}).get('count', {}).get('value', 0)
    total_mines = sum(b['doc_count'] for b in _extract_buckets(aggs, 'by_index') if b['key'] == 'mines')
    facets['has_tsf'].append({'key': 'Has TSF', 'count': tsf_count})
    facets['has_tsf'].append({'key': 'No TSF', 'count': max(0, total_mines - tsf_count)})

    # Verified status (nested)
    _append_boolean_facets(
        facets,
        'verified_status',
        aggs,
        'verified_status',
        'Verified',
        'Unverified',
        nested_path=['healthy']
    )
    facets['verified_status'] = _ensure_predefined_values(facets['verified_status'], 'verified_status')

    # Permit status
    _append_bucket_facets(facets, 'permit_status', aggs, 'permit_status')

    # Is exploration
    _append_boolean_facets(facets, 'is_exploration', aggs, 'is_exploration', 'Exploration', 'Non-Exploration')
    facets['is_exploration'] = _ensure_predefined_values(facets['is_exploration'], 'is_exploration')

    # Party type
    _append_bucket_facets(
        facets,
        'party_type',
        aggs,
        'party_type',
        transform=lambda b: {'key': {'ORG': 'Organization', 'PER': 'Person'}.get(b['key'], b['key']), 'count': b['doc_count']}
    )
    facets['party_type'] = _ensure_predefined_values(facets['party_type'], 'party_type')

    # Explosives permit status
    _append_bucket_facets(facets, 'explosives_permit_status', aggs, 'explosives_permit_status')

    # Explosives permit closed
    _append_boolean_facets(facets, 'explosives_permit_closed', aggs, 'explosives_permit_closed', 'Closed', 'Open')
    facets['explosives_permit_closed'] = _ensure_predefined_values(facets['explosives_permit_closed'], 'explosives_permit_closed')

    # NOD type
    _append_bucket_facets(facets, 'nod_type', aggs, 'nod_type')

    # NOD status
    _append_bucket_facets(facets, 'nod_status', aggs, 'nod_status')

    # NoW application status (nested)
    _append_bucket_facets(
        facets,
        'now_application_status',
        aggs,
        'now_application_status',
        nested_path=['status_codes']
    )

    # NoW type (nested)
    _append_bucket_facets(facets, 'now_type', aggs, 'now_type', nested_path=['type_codes'])

    return facets
