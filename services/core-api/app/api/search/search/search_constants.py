"""Constants and configuration for search functionality."""

TYPE_TO_INDEX = {
    'mine': 'mines',
    'party': 'parties',
    'permit': 'mine_permits',
    'mine_documents': 'documents',
    'notice_of_departure': 'notices_of_departure',
    'explosives_permit': 'explosives_permits',
    'now_application': 'now_applications',
}

INDEX_TO_TYPE = {v: k for k, v in TYPE_TO_INDEX.items()}

# Define searchable fields with boosting
SEARCH_FIELDS = [
    # Mine fields
    "mine_name^3",
    "mine_no^3",
    "mms_alias^2",
    "mine.mine_name^2",
    "mine.mine_no^2",
    # Party/contact fields
    "party_name^3",
    "first_name^2",
    "email^2",
    "phone_no",
    # Permit fields
    "permit_no^3",
    "permit_number^3",
    "application_number^2",
    # NOD fields
    "nod_no^3",
    "nod_title^3",
    "nod_description",
    # NOW fields
    "now_number^3",
    "application.property_name^2",
    # Document fields
    "document_name^2",
    # Description fields
    "description",
]

FACET_KEYS = [
    'mine_region', 'mine_classification', 'mine_operation_status',
    'mine_tenure', 'mine_commodity', 'has_tsf', 'verified_status',
    'permit_status', 'is_exploration', 'party_type',
    'explosives_permit_status', 'explosives_permit_closed',
    'nod_type', 'nod_status', 'now_application_status', 'now_type', 'type'
]

FILTER_PARAMS = [
    'mine_region', 'mine_classification', 'mine_operation_status',
    'mine_tenure', 'mine_commodity', 'has_tsf', 'verified_status',
    'permit_status', 'is_exploration', 'party_type',
    'explosives_permit_status', 'explosives_permit_closed',
    'nod_type', 'nod_status', 'now_application_status', 'now_type'
]

ES_AGGREGATIONS = {
    "by_index": {"terms": {"field": "_index", "size": 10}},
    "mine_region": {"terms": {"field": "mine_region.keyword", "size": 20, "missing": "Unknown"}},
    "major_mine_ind": {"terms": {"field": "major_mine_ind", "size": 10}},
    "mine_operation_status": {
        "nested": {"path": "mine_status"},
        "aggs": {
            "status_codes": {
                "nested": {"path": "mine_status.status_xref"},
                "aggs": {
                    "codes": {"terms": {"field": "mine_status.status_xref.mine_operation_status_code.keyword", "size": 20}}
                }
            }
        }
    },
    "mine_tenure": {
        "nested": {"path": "mine_types"},
        "aggs": {"tenure_codes": {"terms": {"field": "mine_types.mine_tenure_type_code.keyword", "size": 20}}}
    },
    "mine_commodity": {
        "nested": {"path": "mine_types"},
        "aggs": {
            "details": {
                "nested": {"path": "mine_types.mine_type_details"},
                "aggs": {"commodity_codes": {"terms": {"field": "mine_types.mine_type_details.mine_commodity_code.keyword", "size": 30}}}
            }
        }
    },
    "has_tsf": {
        "nested": {"path": "tailings_storage_facilities"},
        "aggs": {"count": {"value_count": {"field": "tailings_storage_facilities.mine_tailings_storage_facility_guid.keyword"}}}
    },
    "verified_status": {
        "nested": {"path": "verified_status"},
        "aggs": {"healthy": {"terms": {"field": "verified_status.healthy_ind", "size": 10}}}
    },
    "permit_status": {"terms": {"field": "permit_status_code.keyword", "size": 20}},
    "is_exploration": {"terms": {"field": "is_exploration", "size": 10}},
    "party_type": {"terms": {"field": "party_type_code.keyword", "size": 10}},
    "explosives_permit_status": {"terms": {"field": "application_status.keyword", "size": 20}},
    "explosives_permit_closed": {"terms": {"field": "is_closed", "size": 10}},
    "nod_type": {"terms": {"field": "nod_type.keyword", "size": 20}},
    "nod_status": {"terms": {"field": "nod_status.keyword", "size": 20}},
    "now_application_status": {
        "nested": {"path": "application"},
        "aggs": {"status_codes": {"terms": {"field": "application.now_application_status_code.keyword", "size": 20}}}
    },
    "now_type": {
        "nested": {"path": "application"},
        "aggs": {"type_codes": {"terms": {"field": "application.notice_of_work_type_code.keyword", "size": 20}}}
    },
}
