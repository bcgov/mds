import regex
from uuid import UUID
from flask import current_app, request
from flask_restx import Resource

from app.api.search.elasticsearch.elastic_search_service import ElasticSearchService
from app.api.search.response_models import SEARCH_RESULT_RETURN_MODEL
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.search import search_targets
from app.extensions import api, db


TYPE_TO_INDEX = {
    'mine': 'mines',
    'party': 'parties',
    'permit': 'permits',
    'mine_documents': 'documents',
    'notice_of_departure': 'notices_of_departure',
    'explosives_permit': 'explosives_permits',
    'now_application': 'now_applications',
}

INDEX_TO_TYPE = {v: k for k, v in TYPE_TO_INDEX.items()}

ES_AGGREGATIONS = {
    "by_index": {"terms": {"field": "_index", "size": 10}},
    # Mine facets
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
        "aggs": {"count": {"value_count": {"field": "tailings_storage_facilities.mine_tailings_storage_facility_guid"}}}
    },
    "verified_status": {
        "nested": {"path": "verified_status"},
        "aggs": {"healthy": {"terms": {"field": "verified_status.healthy_ind", "size": 10}}}
    },
    # Permit facets
    "permit_status": {"terms": {"field": "permit_status_code.keyword", "size": 20}},
    "is_exploration": {"terms": {"field": "is_exploration", "size": 10}},
    # Party facets
    "party_type": {"terms": {"field": "party_type_code.keyword", "size": 10}},
    # Explosives permit facets
    "explosives_permit_status": {"terms": {"field": "application_status.keyword", "size": 20}},
    "explosives_permit_closed": {"terms": {"field": "is_closed", "size": 10}},
    # Notice of departure facets
    "nod_type": {"terms": {"field": "nod_type.keyword", "size": 20}},
    "nod_status": {"terms": {"field": "nod_status.keyword", "size": 20}},
    # NoW application facets
    "now_application_status": {
        "nested": {"path": "application"},
        "aggs": {"status_codes": {"terms": {"field": "application.now_application_status_code.keyword", "size": 20}}}
    },
    "now_type": {
        "nested": {"path": "application"},
        "aggs": {"type_codes": {"terms": {"field": "application.notice_of_work_type_code.keyword", "size": 20}}}
    },
}


def parse_csv_param(value):
    """Parse comma-separated parameter into list."""
    return [v.strip() for v in value.split(',')] if value else []


def build_filter_clauses(filters):
    """Build ES filter clauses from filter parameters."""
    clauses = [{"term": {"deleted_ind": False}}]
    
    if filters.get('mine_region'):
        clauses.append({"terms": {"mine_region.keyword": filters['mine_region']}})
    
    if filters.get('mine_classification'):
        major_values = []
        for c in filters['mine_classification']:
            if c == 'Major Mine':
                major_values.append(True)
            elif c == 'Regional Mine':
                major_values.append(False)
        if major_values:
            clauses.append({"terms": {"major_mine_ind": major_values}})
    
    if filters.get('mine_tenure'):
        clauses.append({
            "nested": {
                "path": "mine_types",
                "query": {"terms": {"mine_types.mine_tenure_type_code.keyword": filters['mine_tenure']}}
            }
        })
    
    if filters.get('mine_commodity'):
        clauses.append({
            "nested": {
                "path": "mine_types",
                "query": {
                    "nested": {
                        "path": "mine_types.mine_type_details",
                        "query": {"terms": {"mine_types.mine_type_details.mine_commodity_code.keyword": filters['mine_commodity']}}
                    }
                }
            }
        })
    
    if filters.get('permit_status'):
        clauses.append({"terms": {"permit_status_code.keyword": filters['permit_status']}})
    
    if filters.get('mine_operation_status'):
        clauses.append({
            "nested": {
                "path": "mine_status",
                "query": {
                    "nested": {
                        "path": "mine_status.status_xref",
                        "query": {"terms": {"mine_status.status_xref.mine_operation_status_code.keyword": filters['mine_operation_status']}}
                    }
                }
            }
        })
    
    if filters.get('has_tsf'):
        for tsf_filter in filters['has_tsf']:
            if tsf_filter == 'Has TSF':
                clauses.append({
                    "nested": {
                        "path": "tailings_storage_facilities",
                        "query": {"exists": {"field": "tailings_storage_facilities.mine_tailings_storage_facility_guid"}}
                    }
                })
            elif tsf_filter == 'No TSF':
                clauses.append({
                    "bool": {
                        "must_not": {
                            "nested": {
                                "path": "tailings_storage_facilities",
                                "query": {"exists": {"field": "tailings_storage_facilities.mine_tailings_storage_facility_guid"}}
                            }
                        }
                    }
                })
    
    if filters.get('verified_status'):
        for status in filters['verified_status']:
            is_verified = status == 'Verified'
            clauses.append({
                "nested": {
                    "path": "verified_status",
                    "query": {"term": {"verified_status.healthy_ind": is_verified}}
                }
            })
    
    # Permit filters
    if filters.get('is_exploration'):
        exploration_values = []
        for exp in filters['is_exploration']:
            if exp == 'Exploration':
                exploration_values.append(True)
            elif exp == 'Non-Exploration':
                exploration_values.append(False)
        if exploration_values:
            clauses.append({"terms": {"is_exploration": exploration_values}})
    
    # Party filters
    if filters.get('party_type'):
        type_codes = []
        for pt in filters['party_type']:
            if pt == 'Organization':
                type_codes.append('ORG')
            elif pt == 'Person':
                type_codes.append('PER')
            else:
                type_codes.append(pt)
        if type_codes:
            clauses.append({"terms": {"party_type_code.keyword": type_codes}})
    
    # Explosives permit filters
    if filters.get('explosives_permit_status'):
        clauses.append({"terms": {"application_status.keyword": filters['explosives_permit_status']}})
    
    if filters.get('explosives_permit_closed'):
        closed_values = []
        for closed in filters['explosives_permit_closed']:
            if closed == 'Closed':
                closed_values.append(True)
            elif closed == 'Open':
                closed_values.append(False)
        if closed_values:
            clauses.append({"terms": {"is_closed": closed_values}})
    
    # NOD filters
    if filters.get('nod_type'):
        clauses.append({"terms": {"nod_type.keyword": filters['nod_type']}})
    
    if filters.get('nod_status'):
        clauses.append({"terms": {"nod_status.keyword": filters['nod_status']}})
    
    # NoW filters
    if filters.get('now_application_status'):
        clauses.append({
            "nested": {
                "path": "application",
                "query": {"terms": {"application.now_application_status_code.keyword": filters['now_application_status']}}
            }
        })
    
    if filters.get('now_type'):
        clauses.append({
            "nested": {
                "path": "application",
                "query": {"terms": {"application.notice_of_work_type_code.keyword": filters['now_type']}}
            }
        })
    
    return clauses


def build_search_query(search_term, filter_clauses):
    """Build the complete ES search query."""
    return {
        "query": {
            "bool": {
                "must": [{"multi_match": {"query": search_term, "fields": ["*"], "fuzziness": "AUTO"}}],
                "filter": filter_clauses
            }
        },
        "aggs": ES_AGGREGATIONS
    }


def extract_facets(aggs):
    """Extract facet data from ES aggregations."""
    facets = {
        # Mine facets
        'mine_region': [],
        'mine_classification': [],
        'mine_operation_status': [],
        'mine_tenure': [],
        'mine_commodity': [],
        'has_tsf': [],
        'verified_status': [],
        # Permit facets
        'permit_status': [],
        'is_exploration': [],
        # Party facets
        'party_type': [],
        # Explosives permit facets
        'explosives_permit_status': [],
        'explosives_permit_closed': [],
        # NOD facets
        'nod_type': [],
        'nod_status': [],
        # NoW facets
        'now_application_status': [],
        'now_type': [],
        # Type facets
        'type': []
    }
    
    # Type facets (by index)
    for bucket in aggs.get('by_index', {}).get('buckets', []):
        type_name = INDEX_TO_TYPE.get(bucket['key'], bucket['key'])
        facets['type'].append({'key': type_name, 'count': bucket['doc_count']})
    
    # Mine region
    for bucket in aggs.get('mine_region', {}).get('buckets', []):
        if bucket['key'] != 'Unknown':
            facets['mine_region'].append({'key': bucket['key'], 'count': bucket['doc_count']})
    
    # Classification (major vs regional)
    for bucket in aggs.get('major_mine_ind', {}).get('buckets', []):
        is_major = bucket.get('key_as_string') == 'true' or bucket['key'] is True
        facets['mine_classification'].append({
            'key': 'Major Mine' if is_major else 'Regional Mine',
            'count': bucket['doc_count']
        })
    
    # Operation status (nested)
    for bucket in aggs.get('mine_operation_status', {}).get('status_codes', {}).get('codes', {}).get('buckets', []):
        facets['mine_operation_status'].append({'key': bucket['key'], 'count': bucket['doc_count']})
    
    # Tenure (nested)
    for bucket in aggs.get('mine_tenure', {}).get('tenure_codes', {}).get('buckets', []):
        facets['mine_tenure'].append({'key': bucket['key'], 'count': bucket['doc_count']})
    
    # Commodity (nested)
    for bucket in aggs.get('mine_commodity', {}).get('details', {}).get('commodity_codes', {}).get('buckets', []):
        if bucket['key']:
            facets['mine_commodity'].append({'key': bucket['key'], 'count': bucket['doc_count']})
    
    # TSF
    tsf_count = aggs.get('has_tsf', {}).get('count', {}).get('value', 0)
    total_mines = sum(b['doc_count'] for b in aggs.get('by_index', {}).get('buckets', []) if b['key'] == 'mines')
    if tsf_count > 0:
        facets['has_tsf'].append({'key': 'Has TSF', 'count': tsf_count})
    if total_mines > tsf_count:
        facets['has_tsf'].append({'key': 'No TSF', 'count': total_mines - tsf_count})
    
    # Verified status (nested)
    for bucket in aggs.get('verified_status', {}).get('healthy', {}).get('buckets', []):
        is_verified = bucket.get('key_as_string') == 'true' or bucket['key'] is True
        facets['verified_status'].append({
            'key': 'Verified' if is_verified else 'Unverified',
            'count': bucket['doc_count']
        })
    
    # Permit status
    for bucket in aggs.get('permit_status', {}).get('buckets', []):
        facets['permit_status'].append({'key': bucket['key'], 'count': bucket['doc_count']})
    
    # Is exploration (permit)
    for bucket in aggs.get('is_exploration', {}).get('buckets', []):
        is_exp = bucket.get('key_as_string') == 'true' or bucket['key'] is True
        facets['is_exploration'].append({
            'key': 'Exploration' if is_exp else 'Non-Exploration',
            'count': bucket['doc_count']
        })
    
    # Party type
    for bucket in aggs.get('party_type', {}).get('buckets', []):
        label = 'Organization' if bucket['key'] == 'ORG' else 'Person' if bucket['key'] == 'PER' else bucket['key']
        facets['party_type'].append({'key': label, 'count': bucket['doc_count']})
    
    # Explosives permit status
    for bucket in aggs.get('explosives_permit_status', {}).get('buckets', []):
        facets['explosives_permit_status'].append({'key': bucket['key'], 'count': bucket['doc_count']})
    
    # Explosives permit closed
    for bucket in aggs.get('explosives_permit_closed', {}).get('buckets', []):
        is_closed = bucket.get('key_as_string') == 'true' or bucket['key'] is True
        facets['explosives_permit_closed'].append({
            'key': 'Closed' if is_closed else 'Open',
            'count': bucket['doc_count']
        })
    
    # NOD type
    for bucket in aggs.get('nod_type', {}).get('buckets', []):
        facets['nod_type'].append({'key': bucket['key'], 'count': bucket['doc_count']})
    
    # NOD status
    for bucket in aggs.get('nod_status', {}).get('buckets', []):
        facets['nod_status'].append({'key': bucket['key'], 'count': bucket['doc_count']})
    
    # NoW application status (nested)
    for bucket in aggs.get('now_application_status', {}).get('status_codes', {}).get('buckets', []):
        facets['now_application_status'].append({'key': bucket['key'], 'count': bucket['doc_count']})
    
    # NoW type (nested)
    for bucket in aggs.get('now_type', {}).get('type_codes', {}).get('buckets', []):
        facets['now_type'].append({'key': bucket['key'], 'count': bucket['doc_count']})
    
    return facets


def group_hits_by_type(hits):
    """Group ES hits by document type."""
    grouped = {}
    for hit in hits:
        doc_type = INDEX_TO_TYPE.get(hit['_index'])
        if doc_type:
            grouped.setdefault(doc_type, []).append(hit)
    return grouped


def fetch_db_results(doc_type, es_hits):
    """Fetch full records from DB for ES hits."""
    if doc_type not in search_targets or not search_targets[doc_type].get('primary_column'):
        return []
    
    config = search_targets[doc_type]
    id_field = config['id_field']
    
    # Extract IDs and scores from ES hits
    results = []
    for hit in es_hits:
        doc_id = hit['_source'].get(id_field)
        if doc_id:
            results.append({'id': doc_id, 'score': hit['_score'], 'type': doc_type})
    
    if not results:
        return []
    
    # Query DB for full records
    ids = [r['id'] for r in results]
    try:
        uuid_ids = [UUID(id) for id in ids]
    except (ValueError, TypeError) as e:
        current_app.logger.error(f"UUID conversion error for {doc_type}: {e}")
        uuid_ids = ids
    
    db_records = db.session.query(config['model']).filter(config['primary_column'].in_(uuid_ids)).all()
    db_map = {str(getattr(r, id_field)): r for r in db_records}
    
    # Merge ES scores with DB records
    return [
        {'score': r['score'], 'type': r['type'], 'result': db_map[r['id']]}
        for r in results if r['id'] in db_map
    ]


class SearchOptionsResource(Resource, UserMixin):
    @requires_role_view_all
    def get(self):
        return [
            {'model_id': type_key, 'description': config['description']}
            for type_key, config in search_targets.items()
        ]


class SearchResource(Resource, UserMixin):
    @requires_role_view_all
    @api.marshal_with(SEARCH_RESULT_RETURN_MODEL, 200)
    def get(self):
        search_term = request.args.get('search_term', '', type=str)
        search_types = request.args.get('search_types', None, type=str)
        search_types = search_types.split(',') if search_types else list(search_targets.keys())
        
        # Parse filter parameters
        filters = {
            # Mine filters
            'mine_region': parse_csv_param(request.args.get('mine_region')),
            'mine_classification': parse_csv_param(request.args.get('mine_classification')),
            'mine_operation_status': parse_csv_param(request.args.get('mine_operation_status')),
            'mine_tenure': parse_csv_param(request.args.get('mine_tenure')),
            'mine_commodity': parse_csv_param(request.args.get('mine_commodity')),
            'has_tsf': parse_csv_param(request.args.get('has_tsf')),
            'verified_status': parse_csv_param(request.args.get('verified_status')),
            # Permit filters
            'permit_status': parse_csv_param(request.args.get('permit_status')),
            'is_exploration': parse_csv_param(request.args.get('is_exploration')),
            # Party filters
            'party_type': parse_csv_param(request.args.get('party_type')),
            # Explosives permit filters
            'explosives_permit_status': parse_csv_param(request.args.get('explosives_permit_status')),
            'explosives_permit_closed': parse_csv_param(request.args.get('explosives_permit_closed')),
            # NOD filters
            'nod_type': parse_csv_param(request.args.get('nod_type')),
            'nod_status': parse_csv_param(request.args.get('nod_status')),
            # NoW filters
            'now_application_status': parse_csv_param(request.args.get('now_application_status')),
            'now_type': parse_csv_param(request.args.get('now_type')),
        }
        
        # Parse search terms
        reg_exp = regex.compile(r'\'.*?\' | ".*?" | \S+ ', regex.VERBOSE)
        search_terms = [term.replace('"', '') for term in reg_exp.findall(search_term)]
        
        # Initialize results
        all_results = {t: [] for t in search_types}
        facets = {k: [] for k in [
            'mine_region', 'mine_classification', 'mine_operation_status', 
            'mine_tenure', 'mine_commodity', 'has_tsf', 'verified_status', 
            'permit_status', 'is_exploration', 'party_type',
            'explosives_permit_status', 'explosives_permit_closed',
            'nod_type', 'nod_status', 'now_application_status', 'now_type', 'type'
        ]}
        
        # Build indices to search
        indices = [TYPE_TO_INDEX[t] for t in search_types if t in TYPE_TO_INDEX]
        if not indices:
            return {'search_terms': search_terms, 'search_results': all_results, 'facets': facets}
        
        try:
            # Execute search
            query = build_search_query(search_term, build_filter_clauses(filters))
            current_app.logger.info(f"Searching ES indices: {','.join(indices)} for: {search_term}")
            
            es_results = ElasticSearchService.search(','.join(set(indices)), query, size=200)
            hits = es_results['hits']['hits']
            current_app.logger.info(f"ES returned {len(hits)} hits")
            
            # Extract facets
            facets = extract_facets(es_results.get('aggregations', {}))
            
            # Process hits by type
            for doc_type, type_hits in group_hits_by_type(hits).items():
                all_results[doc_type] = fetch_db_results(doc_type, type_hits)
                
        except Exception as e:
            current_app.logger.error(f"Elasticsearch error: {e}")
        
        return {'search_terms': search_terms, 'search_results': all_results, 'facets': facets}
