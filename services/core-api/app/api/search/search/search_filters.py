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


def build_filter_clauses(filters):
    """Build ES filter clauses from filter parameters."""
    clauses = [build_deleted_filter()]

    if filters.get('mine_region'):
        clauses.append(build_terms_filter("mine_region.keyword", filters['mine_region']))

    if filters.get('mine_classification'):
        clause = build_boolean_filter(
            "major_mine_ind",
            {'Major Mine': True, 'Regional Mine': False},
            filters['mine_classification']
        )
        if clause:
            clauses.append(clause)

    if filters.get('mine_tenure'):
        clauses.append(build_nested_filter(
            "mine_types",
            {"terms": {"mine_types.mine_tenure_type_code.keyword": filters['mine_tenure']}}
        ))

    if filters.get('mine_commodity'):
        clauses.append(build_nested_filter(
            "mine_types",
            build_nested_filter(
                "mine_types.mine_type_details",
                {"terms": {"mine_types.mine_type_details.mine_commodity_code.keyword": filters['mine_commodity']}}
            )
        ))

    if filters.get('permit_status'):
        clauses.append(build_terms_filter("permit_status_code.keyword", filters['permit_status']))

    if filters.get('mine_operation_status'):
        clauses.append(build_nested_filter(
            "mine_status",
            build_nested_filter(
                "mine_status.status_xref",
                {"terms": {"mine_status.status_xref.mine_operation_status_code.keyword": filters['mine_operation_status']}}
            )
        ))

    if filters.get('has_tsf'):
        for tsf_filter in filters['has_tsf']:
            if tsf_filter == 'Has TSF':
                clauses.append(build_nested_filter(
                    "tailings_storage_facilities",
                    {"exists": {"field": "tailings_storage_facilities.mine_tailings_storage_facility_guid"}}
                ))
            elif tsf_filter == 'No TSF':
                clauses.append({
                    "bool": {
                        "must_not": build_nested_filter(
                            "tailings_storage_facilities",
                            {"exists": {"field": "tailings_storage_facilities.mine_tailings_storage_facility_guid"}}
                        )
                    }
                })

    if filters.get('verified_status'):
        for status in filters['verified_status']:
            clauses.append(build_nested_filter(
                "verified_status",
                {"term": {"verified_status.healthy_ind": status == 'Verified'}}
            ))

    if filters.get('is_exploration'):
        clause = build_boolean_filter(
            "is_exploration",
            {'Exploration': True, 'Non-Exploration': False},
            filters['is_exploration']
        )
        if clause:
            clauses.append(clause)

    if filters.get('party_type'):
        type_codes = []
        for pt in filters['party_type']:
            type_codes.append({'Organization': 'ORG', 'Person': 'PER'}.get(pt, pt))
        clauses.append(build_terms_filter("party_type_code.keyword", type_codes))

    if filters.get('explosives_permit_status'):
        clauses.append(build_terms_filter("application_status.keyword", filters['explosives_permit_status']))

    if filters.get('explosives_permit_closed'):
        clause = build_boolean_filter(
            "is_closed",
            {'Closed': True, 'Open': False},
            filters['explosives_permit_closed']
        )
        if clause:
            clauses.append(clause)

    if filters.get('nod_type'):
        clauses.append(build_terms_filter("nod_type.keyword", filters['nod_type']))

    if filters.get('nod_status'):
        clauses.append(build_terms_filter("nod_status.keyword", filters['nod_status']))

    if filters.get('now_application_status'):
        clauses.append(build_nested_filter(
            "application",
            {"terms": {"application.now_application_status_code.keyword": filters['now_application_status']}}
        ))

    if filters.get('now_type'):
        clauses.append(build_nested_filter(
            "application",
            {"terms": {"application.notice_of_work_type_code.keyword": filters['now_type']}}
        ))

    return clauses
