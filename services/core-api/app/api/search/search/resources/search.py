import regex
from uuid import UUID
from app.api.search.elasticsearch.elastic_search_service import ElasticSearchService
from app.api.search.response_models import SEARCH_RESULT_RETURN_MODEL
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.search import search_targets
from app.extensions import api, db
from flask import current_app, request
from flask_restx import Resource


class SearchOptionsResource(Resource, UserMixin):
    @requires_role_view_all
    def get(self):
        options = []
        for type, type_config in search_targets.items():
            options.append({'model_id': type, 'description': type_config['description']})

        return options


class SearchResource(Resource, UserMixin):
    @requires_role_view_all
    @api.marshal_with(SEARCH_RESULT_RETURN_MODEL, 200)
    def get(self):
        search_term = request.args.get('search_term', None, type=str)
        search_types = request.args.get('search_types', None, type=str)
        search_types = search_types.split(',') if search_types else list(search_targets.keys())

        # Split incoming search query by space to search by individual words
        reg_exp = regex.compile(r'\'.*?\' | ".*?" | \S+ ', regex.VERBOSE)
        search_terms = reg_exp.findall(search_term)
        search_terms = [term.replace('"', '') for term in search_terms]

        all_search_results = {}
        
        type_to_index = {
            'mine': 'mines',
            'party': 'parties',
            'permit': 'permits',
            'mine_documents': 'documents',
            'notice_of_departure': 'notices_of_departure',
            'explosives_permit': 'explosives_permits'
            # 'permit_documents': 'documents' # TODO: Add permit documents to ES index
        }
        
        index_to_type = {v: k for k, v in type_to_index.items()}

        # Initialize facets
        facets = {
            'mine_region': [],
            'mine_classification': [],
            'mine_operation_status': [],
            'mine_tenure': [],
            'mine_commodity': [],
            'has_tsf': [],
            'verified_status': [],
            'permit_status': [],
            'type': []
        }
        
        indices = []
        for type in search_types:
            if type in type_to_index:
                indices.append(type_to_index[type])
        
        if indices:
            indices_string = ",".join(list(set(indices)))
            
            # Construct query with aggregations for facets
            query = {
                "query": {
                    "bool": {
                        "must": [
                            {
                                "multi_match": {
                                    "query": search_term,
                                    "fields": ["*"],
                                    "fuzziness": "AUTO"
                                }
                            }
                        ],
                        "filter": [
                            {"term": {"deleted_ind": False}}
                        ]
                    }
                },
                "aggs": {
                    "by_index": {
                        "terms": {"field": "_index", "size": 10}
                    },
                    "mine_region": {
                        "terms": {"field": "mine_region.keyword", "size": 20, "missing": "Unknown"}
                    },
                    "major_mine_ind": {
                        "terms": {"field": "major_mine_ind", "size": 10}
                    },
                    "mine_operation_status": {
                        "nested": {"path": "mine_status"},
                        "aggs": {
                            "status_codes": {
                                "nested": {"path": "mine_status.status_xref"},
                                "aggs": {
                                    "codes": {
                                        "terms": {"field": "mine_status.status_xref.mine_operation_status_code.keyword", "size": 20}
                                    }
                                }
                            }
                        }
                    },
                    "mine_tenure": {
                        "nested": {"path": "mine_types"},
                        "aggs": {
                            "tenure_codes": {
                                "terms": {"field": "mine_types.mine_tenure_type_code.keyword", "size": 20}
                            }
                        }
                    },
                    "mine_commodity": {
                        "nested": {"path": "mine_types"},
                        "aggs": {
                            "details": {
                                "nested": {"path": "mine_types.mine_type_details"},
                                "aggs": {
                                    "commodity_codes": {
                                        "terms": {"field": "mine_types.mine_type_details.mine_commodity_code.keyword", "size": 30}
                                    }
                                }
                            }
                        }
                    },
                    "has_tsf": {
                        "nested": {"path": "tailings_storage_facilities"},
                        "aggs": {
                            "count": {
                                "value_count": {"field": "tailings_storage_facilities.mine_tailings_storage_facility_guid"}
                            }
                        }
                    },
                    "verified_status": {
                        "nested": {"path": "verified_status"},
                        "aggs": {
                            "healthy": {
                                "terms": {"field": "verified_status.healthy_ind", "size": 10}
                            }
                        }
                    },
                    "permit_status": {
                        "terms": {"field": "permit_status_code.keyword", "size": 20}
                    }
                }
            }
            
            try:
                current_app.logger.info(f"Searching ES indices: {indices_string} for term: {search_term}")
                es_results = ElasticSearchService.search(indices_string, query, size=200)
                hits = es_results['hits']['hits']
                current_app.logger.info(f"ES returned {len(hits)} hits")
                
                # Process aggregations for facets
                aggs = es_results.get('aggregations', {})
                
                # Type facets (by index)
                for bucket in aggs.get('by_index', {}).get('buckets', []):
                    index_name = bucket['key']
                    type_name = index_to_type.get(index_name, index_name)
                    facets['type'].append({'key': type_name, 'count': bucket['doc_count']})
                
                # Mine region facets
                for bucket in aggs.get('mine_region', {}).get('buckets', []):
                    if bucket['key'] != 'Unknown':
                        facets['mine_region'].append({'key': bucket['key'], 'count': bucket['doc_count']})
                
                # Mine classification facets (major vs regional)
                for bucket in aggs.get('major_mine_ind', {}).get('buckets', []):
                    label = 'Major Mine' if bucket.get('key_as_string') == 'true' or bucket['key'] == True else 'Regional Mine'
                    facets['mine_classification'].append({'key': label, 'count': bucket['doc_count']})
                
                # Mine operation status facets (nested)
                status_agg = aggs.get('mine_operation_status', {}).get('status_codes', {}).get('codes', {})
                for bucket in status_agg.get('buckets', []):
                    facets['mine_operation_status'].append({'key': bucket['key'], 'count': bucket['doc_count']})
                
                # Mine tenure facets (nested)
                tenure_agg = aggs.get('mine_tenure', {}).get('tenure_codes', {})
                for bucket in tenure_agg.get('buckets', []):
                    facets['mine_tenure'].append({'key': bucket['key'], 'count': bucket['doc_count']})
                
                # Mine commodity facets (nested)
                commodity_agg = aggs.get('mine_commodity', {}).get('details', {}).get('commodity_codes', {})
                for bucket in commodity_agg.get('buckets', []):
                    if bucket['key']:  # Skip empty commodity codes
                        facets['mine_commodity'].append({'key': bucket['key'], 'count': bucket['doc_count']})
                
                # TSF facets - count mines with TSF
                tsf_count = aggs.get('has_tsf', {}).get('count', {}).get('value', 0)
                total_mines = sum(b['doc_count'] for b in aggs.get('by_index', {}).get('buckets', []) if b['key'] == 'mines')
                if tsf_count > 0:
                    facets['has_tsf'].append({'key': 'Has TSF', 'count': tsf_count})
                if total_mines > tsf_count:
                    facets['has_tsf'].append({'key': 'No TSF', 'count': total_mines - tsf_count})
                
                # Verified status facets (nested)
                verified_agg = aggs.get('verified_status', {}).get('healthy', {})
                for bucket in verified_agg.get('buckets', []):
                    label = 'Verified' if bucket.get('key_as_string') == 'true' or bucket['key'] == True else 'Unverified'
                    facets['verified_status'].append({'key': label, 'count': bucket['doc_count']})
                
                # Permit status facets
                for bucket in aggs.get('permit_status', {}).get('buckets', []):
                    facets['permit_status'].append({'key': bucket['key'], 'count': bucket['doc_count']})
                
                grouped_hits = {}
                for hit in hits:
                    index = hit['_index']
                    type = index_to_type.get(index)
                    if not type:
                        continue
                    
                    if type not in grouped_hits:
                        grouped_hits[type] = []
                    grouped_hits[type].append(hit)
                
                for type, hits in grouped_hits.items():
                    results = []
                    for hit in hits:
                        source = hit['_source']
                        score = hit['_score']
                        
                        id_field = search_targets[type]['id_field']
                        id = source.get(id_field)
                        
                        if id:
                            results.append({
                                'score': score,
                                'type': type,
                                'id': id
                            })
                    
                    if not results:
                        all_search_results[type] = []
                        continue

                    ids = [r['id'] for r in results]
                    
                    if type in search_targets and search_targets[type].get('primary_column'):
                        model = search_targets[type]['model']
                        primary_column = search_targets[type]['primary_column']
                        
                        # Convert string IDs to UUIDs for database query
                        try:
                            uuid_ids = [UUID(id) for id in ids if id]
                        except (ValueError, TypeError) as e:
                            current_app.logger.error(f"UUID conversion error for {type}: {e}")
                            uuid_ids = ids  # Fall back to string IDs
                        
                        db_results = db.session.query(model).filter(primary_column.in_(uuid_ids)).all()
                        current_app.logger.info(f"DB query for {type} returned {len(db_results)} results from {len(uuid_ids)} IDs")
                        db_results_map = {str(getattr(r, search_targets[type]['id_field'])): r for r in db_results}
                        
                        final_results = []
                        for r in results:
                            if r['id'] in db_results_map:
                                final_results.append({
                                    'score': r['score'],
                                    'type': r['type'],
                                    'result': db_results_map[r['id']]
                                })
                        
                        all_search_results[type] = final_results
                    else:
                        all_search_results[type] = []

            except Exception as e:
                current_app.logger.error(f"Elasticsearch error: {e}")
                # If the single query fails, we might want to return empty results for all requested types
                for type in search_types:
                    if type not in all_search_results:
                        all_search_results[type] = []

        # Ensure all requested types are in the result, even if empty
        for type in search_types:
            if type not in all_search_results:
                all_search_results[type] = []

        return {'search_terms': search_terms, 'search_results': all_search_results, 'facets': facets}
