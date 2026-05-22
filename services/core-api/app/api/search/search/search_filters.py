"""Filter builders for Elasticsearch queries."""


def build_deleted_filter():
    """Build filter for deleted_ind that handles missing field."""
    return {
        "bool": {
            "should": [
                {"term": {"deleted_ind": False}},
                {"bool": {"must_not": {"exists": {"field": "deleted_ind"}}}}
            ],
            "minimum_should_match": 1
        }
    }


def build_mine_guid_filter(mine_guid):
    """
    Build filter for mine_guid scoping across different indices.
    
    Handles different field locations:
    - mines index: mine_guid direct field
    - permits index: mine_guids array field (from mine_permit_xref)
    - nod/explosives/now indices: mine_guid direct field or mine.mine_guid nested
    
    Uses both raw and .keyword variants for compatibility with different field mappings.
    
    Args:
        mine_guid: The mine GUID to filter by
        
    Returns:
        Elasticsearch bool filter with should clauses for all possible locations
    """
    return {
        "bool": {
            "should": [
                {"term": {"mine_guid": mine_guid}},
                {"term": {"mine_guid.keyword": mine_guid}},
                {"term": {"mine_guids.mine_guid": mine_guid}},
                {"term": {"mine_guids.mine_guid.keyword": mine_guid}},
                {"term": {"mine.mine_guid": mine_guid}},
                {"term": {"mine.mine_guid.keyword": mine_guid}},
            ],
            "minimum_should_match": 1
        }
    }


def build_terms_filter(field, values):
    """Build simple terms filter."""
    return {"terms": {field: values}}


def build_nested_filter(path, query):
    """Build nested filter."""
    return {"nested": {"path": path, "query": query}}


def build_boolean_filter(field, value_map, values):
    """Build filter for boolean fields with string mappings."""
    bool_values = []
    for v in values:
        if v in value_map:
            bool_values.append(value_map[v])
    return {"terms": {field: bool_values}} if bool_values else None


def _append_terms_filter(clauses, filters, filter_key, field):
    if filters.get(filter_key):
        clauses.append(build_terms_filter(field, filters[filter_key]))


def _append_nested_terms_filter(clauses, filters, filter_key, path, field):
    if filters.get(filter_key):
        clauses.append(build_nested_filter(path, {"terms": {field: filters[filter_key]}}))


def _append_boolean_terms_filter(clauses, filters, filter_key, field, value_map):
    if filters.get(filter_key):
        clause = build_boolean_filter(field, value_map, filters[filter_key])
        if clause:
            clauses.append(clause)


def _append_has_tsf_filters(clauses, filters):
    if not filters.get('has_tsf'):
        return
    exists_clause = build_nested_filter(
        "tailings_storage_facilities",
        {"exists": {"field": "tailings_storage_facilities.mine_tailings_storage_facility_guid"}}
    )
    for tsf_filter in filters['has_tsf']:
        if tsf_filter == 'Has TSF':
            clauses.append(exists_clause)
        elif tsf_filter == 'No TSF':
            clauses.append({"bool": {"must_not": exists_clause}})


def _append_verified_status_filters(clauses, filters):
    if not filters.get('verified_status'):
        return
    for status in filters['verified_status']:
        clauses.append(build_nested_filter(
            "verified_status",
            {"term": {"verified_status.healthy_ind": status == 'Verified'}}
        ))


def _append_party_type_filters(clauses, filters):
    if not filters.get('party_type'):
        return
    type_codes = []
    for pt in filters['party_type']:
        type_codes.append({'Organization': 'ORG', 'Person': 'PER'}.get(pt, pt))
    clauses.append(build_terms_filter("party_type_code.keyword", type_codes))


def build_filter_clauses(filters):
    """Build ES filter clauses from filter parameters."""
    clauses = [build_deleted_filter()]

    _append_terms_filter(clauses, filters, 'mine_region', "mine_region.keyword")
    _append_boolean_terms_filter(
        clauses,
        filters,
        'mine_classification',
        "major_mine_ind",
        {'Major Mine': True, 'Regional Mine': False}
    )
    _append_nested_terms_filter(
        clauses,
        filters,
        'mine_tenure',
        "mine_types",
        "mine_types.mine_tenure_type_code.keyword"
    )
    if filters.get('mine_commodity'):
        clauses.append(build_nested_filter(
            "mine_types",
            build_nested_filter(
                "mine_types.mine_type_details",
                {"terms": {"mine_types.mine_type_details.mine_commodity_code.keyword": filters['mine_commodity']}}
            )
        ))
    _append_terms_filter(clauses, filters, 'permit_status', "permit_status_code.keyword")
    if filters.get('mine_operation_status'):
        clauses.append(build_nested_filter(
            "mine_status",
            build_nested_filter(
                "mine_status.status_xref",
                {"terms": {"mine_status.status_xref.mine_operation_status_code.keyword": filters['mine_operation_status']}}
            )
        ))
    _append_has_tsf_filters(clauses, filters)
    _append_verified_status_filters(clauses, filters)
    _append_boolean_terms_filter(
        clauses,
        filters,
        'is_exploration',
        "is_exploration",
        {'Exploration': True, 'Non-Exploration': False}
    )
    _append_party_type_filters(clauses, filters)
    _append_terms_filter(clauses, filters, 'explosives_permit_status', "application_status.keyword")
    _append_boolean_terms_filter(
        clauses,
        filters,
        'explosives_permit_closed',
        "is_closed",
        {'Closed': True, 'Open': False}
    )
    _append_terms_filter(clauses, filters, 'nod_type', "nod_type.keyword")
    _append_terms_filter(clauses, filters, 'nod_status', "nod_status.keyword")
    _append_nested_terms_filter(
        clauses,
        filters,
        'now_application_status',
        "application",
        "application.now_application_status_code.keyword"
    )
    _append_nested_terms_filter(
        clauses,
        filters,
        'now_type',
        "application",
        "application.notice_of_work_type_code.keyword"
    )

    return clauses
