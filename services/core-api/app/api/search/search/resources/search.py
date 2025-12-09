import regex
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
            'mine_documents': 'documents'
            # 'permit_documents': 'documents' # TODO: Add permit documents to ES index
        }
        
        index_to_type = {v: k for k, v in type_to_index.items()}

        indices = []
        for type in search_types:
            if type in type_to_index:
                indices.append(type_to_index[type])
        
        if indices:
            indices_string = ",".join(list(set(indices)))
            
            # Construct query
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
                }
            }
            
            try:
                es_results = ElasticSearchService.search(indices_string, query, size=200)
                hits = es_results['hits']['hits']
                
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
                        
                        db_results = db.session.query(model).filter(primary_column.in_(ids)).all()
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

        return {'search_terms': search_terms, 'search_results': all_search_results}
