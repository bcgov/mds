import regex
from app.api.search.elasticsearch.elastic_search_service import ElasticSearchService
from app.api.search.response_models import SIMPLE_SEARCH_RESULT_RETURN_MODEL
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.search import SearchResult, simple_search_targets
from app.extensions import api
from flask import current_app, request
from flask_restx import Resource


class SimpleSearchResource(Resource, UserMixin):
    @requires_role_view_all
    @api.marshal_with(SIMPLE_SEARCH_RESULT_RETURN_MODEL, 200)
    def get(self):
        search_results = []
        search_term = request.args.get('search_term', None, type=str)

        # Split incoming search query by space to search by individual words
        reg_exp = regex.compile(r'\'.*?\' | ".*?" | \S+ ', regex.VERBOSE)
        search_terms = reg_exp.findall(search_term)
        search_terms = [term.replace('"', '') for term in search_terms]

        type_to_index = {
            'mine': 'mines',
            'party': 'parties',
            'permit': 'permits'
        }
        
        index_to_type = {v: k for k, v in type_to_index.items()}
        
        indices = []
        for type in simple_search_targets.keys():
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
                es_results = ElasticSearchService.search(indices_string, query, size=30)
                hits = es_results['hits']['hits']
                
                for hit in hits:
                    index = hit['_index']
                    type = index_to_type.get(index)
                    if not type:
                        continue
                    
                    type_config = simple_search_targets.get(type)
                    if not type_config:
                        continue

                    source = hit['_source']
                    score = hit['_score']
                    
                    # Apply multiplier from config
                    score_multiplier = type_config.get('score_multiplier', 1)
                    
                    # Construct value based on type
                    value = ""
                    if type == 'mine':
                        value = source.get('mine_name', '')
                    elif type == 'party':
                        first_name = source.get('first_name', '')
                        party_name = source.get('party_name', '')
                        value = f"{first_name} {party_name}".strip()
                    elif type == 'permit':
                        value = source.get('permit_no', '')
                        
                    # Boost if starts with or exact match
                    if value.lower().startswith(search_term.lower()):
                        score_multiplier *= 3
                    if value.lower() == search_term.lower():
                        score_multiplier *= 10
                        
                    search_results.append(SearchResult(
                        score * score_multiplier,
                        type,
                        {
                            'id': source.get(type_config['id_field']),
                            'value': value
                        }
                    ))
                    
            except Exception as e:
                current_app.logger.error(f"Elasticsearch error: {e}")

        grouped_results = {}
        for result in search_results:
            if (result.result['id'] in grouped_results):
                grouped_results[result.result['id']].score += result.score
            else:
                grouped_results[result.result['id']] = result

        search_results = list(grouped_results.values())
        search_results.sort(key=lambda x: x.score, reverse=True)
        search_results = search_results[0:4]

        return {'search_terms': search_terms, 'search_results': search_results}