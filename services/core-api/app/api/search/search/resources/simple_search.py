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
        search_types = request.args.get('search_types', None, type=str)
        mine_guid = request.args.get('mine_guid', None, type=str)

        # Split incoming search query by space to search by individual words
        search_terms = []
        if search_term and search_term != "*":
            reg_exp = regex.compile(r'\'.*?\' | ".*?" | \S+ ', regex.VERBOSE)
            search_terms = reg_exp.findall(search_term)
            search_terms = [term.replace('"', '') for term in search_terms]

        type_to_index = {
            'mine': 'mines',
            'party': 'parties',
            'permit': 'permits',
            'notice_of_departure': 'notices_of_departure',
            'explosives_permit': 'explosives_permits',
            'now_application': 'now_applications'
        }
        
        index_to_type = {v: k for k, v in type_to_index.items()}
        
        # Parse search_types filter (e.g., "mine,person,organization,permit,nod,explosives_permit")
        allowed_types = None
        if search_types:
            allowed_types = [t.strip() for t in search_types.split(',')]
        
        # Map result types to index types
        result_type_to_index = {
            'mine': 'mine',
            'person': 'party',
            'organization': 'party',
            'permit': 'permit',
            'nod': 'notice_of_departure',
            'explosives_permit': 'explosives_permit',
            'now_application': 'now_application'
        }
        
        indices = []
        for type in simple_search_targets.keys():
            if type in type_to_index:
                # Only include if no filter, or any result type maps to this index
                if allowed_types is None:
                    indices.append(type_to_index[type])
                else:
                    for result_type in allowed_types:
                        if result_type_to_index.get(result_type) == type:
                            indices.append(type_to_index[type])
                            break
        
        if indices:
            indices_string = ",".join(list(set(indices)))

            # Build base filter clauses
            # Use bool with should to handle missing deleted_ind field
            base_filters = [{
                "bool": {
                    "should": [
                        {"term": {"deleted_ind": False}},
                        {"bool": {"must_not": {"exists": {"field": "deleted_ind"}}}}
                    ],
                    "minimum_should_match": 1
                }
            }]
            
            # Add mine_guid filter if provided (scoped search)
            if mine_guid:
                current_app.logger.info(f"Scoped search for mine_guid: {mine_guid}, indices: {indices_string}")
                # Search for mine_guid in multiple locations across different indices:
                # - mines index: mine_guid direct field
                # - permits: mine.mine_guid nested field
                # - nod/explosives/documents: mine_guid direct field
                # - parties: mine_appointments.mine_guid or mine_appointments.mine.mine_guid
                # Use both raw and .keyword variants for compatibility
                base_filters.append({
                    "bool": {
                        "should": [
                            {"term": {"mine_guid": mine_guid}},
                            {"term": {"mine_guid.keyword": mine_guid}},
                            {"term": {"mine.mine_guid": mine_guid}},
                            {"term": {"mine.mine_guid.keyword": mine_guid}},
                            {"term": {"mine_appointments.mine_guid": mine_guid}},
                            {"term": {"mine_appointments.mine_guid.keyword": mine_guid}},
                            {"term": {"mine_appointments.mine.mine_guid": mine_guid}},
                            {"term": {"mine_appointments.mine.mine_guid.keyword": mine_guid}},
                        ],
                        "minimum_should_match": 1
                    }
                })

            # Define searchable fields with boosting
            search_fields = [
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
                # Catch-all
                "*"
            ]
            
            # Highlight configuration
            highlight_config = {
                "fields": {
                    "mine_name": {},
                    "mine_no": {},
                    "mms_alias": {},
                    "mine.mine_name": {},
                    "mine.mine_no": {},
                    "party_name": {},
                    "first_name": {},
                    "email": {},
                    "permit_no": {},
                    "permit_number": {},
                    "nod_no": {},
                    "nod_title": {},
                    "nod_description": {},
                    "now_number": {},
                    "application.property_name": {},
                    "document_name": {},
                    "description": {},
                    "application_number": {},
                },
                "pre_tags": ["<mark>"],
                "post_tags": ["</mark>"],
                "fragment_size": 150,
                "number_of_fragments": 1
            }
            
            # Construct query - use match_all for wildcard, prefix for short terms, fuzzy for longer
            is_wildcard = search_term == "*" or (mine_guid and not search_term)
            
            if is_wildcard:
                # Match all documents (filtered by mine_guid if provided)
                query = {
                    "query": {
                        "bool": {
                            "must": [{"match_all": {}}],
                            "filter": base_filters
                        }
                    },
                    "sort": [{"_score": "desc"}]
                }
            elif len(search_term) < 3:
                query = {
                    "query": {
                        "bool": {
                            "should": [
                                {
                                    "multi_match": {
                                        "query": search_term,
                                        "fields": search_fields,
                                        "type": "phrase_prefix"
                                    }
                                },
                                {
                                    "multi_match": {
                                        "query": search_term,
                                        "fields": search_fields
                                    }
                                }
                            ],
                            "minimum_should_match": 1,
                            "filter": base_filters
                        }
                    },
                    "highlight": highlight_config
                }
            else:
                query = {
                    "query": {
                        "bool": {
                            "should": [
                                {
                                    "multi_match": {
                                        "query": search_term,
                                        "fields": search_fields,
                                        "type": "phrase_prefix"
                                    }
                                },
                                {
                                    "multi_match": {
                                        "query": search_term,
                                        "fields": search_fields,
                                        "fuzziness": "AUTO"
                                    }
                                }
                            ],
                            "minimum_should_match": 1,
                            "filter": base_filters
                        }
                    },
                    "highlight": highlight_config
                }

            try:
                current_app.logger.info(f"ES Query: {query}")
                es_results = ElasticSearchService.search(indices_string, query, size=30)
                hits = es_results['hits']['hits']
                current_app.logger.info(f"ES returned {len(hits)} hits")
                
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
                    
                    # Construct value and description based on type
                    value = ""
                    description = ""
                    result_type = type
                    if type == 'mine':
                        value = source.get('mine_name', '')
                        mine_no = source.get('mine_no', '')
                        mms_alias = source.get('mms_alias', '')
                        
                        # Extract commodity codes from mine_types -> mine_type_details
                        commodities = set()
                        mine_types = source.get('mine_types', [])
                        if mine_types:
                            for mt in mine_types:
                                details = mt.get('mine_type_details', [])
                                if details:
                                    for detail in details:
                                        commodity = detail.get('mine_commodity_code')
                                        if commodity:
                                            commodities.add(commodity)
                        
                        desc_parts = []
                        if mine_no:
                            desc_parts.append(f"Mine #: {mine_no}")
                        if commodities:
                            desc_parts.append(", ".join(sorted(commodities)))
                        if mms_alias:
                            desc_parts.append(f"Alias: {mms_alias}")
                        description = " | ".join(desc_parts)
                    elif type == 'party':
                        first_name = source.get('first_name', '')
                        party_name = source.get('party_name', '')
                        party_type_code = source.get('party_type_code', 'PER')
                        email = source.get('email', '')
                        phone_no = source.get('phone_no', '')
                        value = f"{first_name} {party_name}".strip() if party_type_code == 'PER' else party_name
                        result_type = 'person' if party_type_code == 'PER' else 'organization'
                        desc_parts = []
                        if email:
                            desc_parts.append(email)
                        if phone_no:
                            desc_parts.append(phone_no)
                        description = " | ".join(desc_parts)
                    elif type == 'permit':
                        value = source.get('permit_no', '')
                        permit_status = source.get('permit_status_code', '')
                        if permit_status:
                            description = f"Status: {permit_status}"
                    elif type == 'notice_of_departure':
                        result_type = 'nod'
                        value = source.get('nod_title', '') or source.get('nod_no', '')
                        nod_no = source.get('nod_no', '')
                        nod_status = source.get('nod_status', '')
                        mine_info = source.get('mine', {})
                        mine_name = mine_info.get('mine_name', '') if mine_info else ''
                        desc_parts = []
                        if nod_no:
                            desc_parts.append(nod_no)
                        if mine_name:
                            desc_parts.append(mine_name)
                        if nod_status:
                            desc_parts.append(nod_status.replace('_', ' ').title())
                        description = " | ".join(desc_parts)
                    elif type == 'explosives_permit':
                        result_type = 'explosives_permit'
                        value = source.get('permit_number', '') or source.get('application_number', '')
                        app_status = source.get('application_status', '')
                        is_closed = source.get('is_closed', False)
                        mine_info = source.get('mine', {})
                        mine_name = mine_info.get('mine_name', '') if mine_info else ''
                        desc_parts = []
                        if mine_name:
                            desc_parts.append(mine_name)
                        if is_closed:
                            desc_parts.append('Closed')
                        elif app_status:
                            status_map = {'REC': 'Received', 'APP': 'Approved', 'REJ': 'Rejected'}
                            desc_parts.append(status_map.get(app_status, app_status))
                        description = " | ".join(desc_parts)
                    elif type == 'now_application':
                        result_type = 'now_application'
                        value = source.get('now_number', '')
                        application = source.get('application', {})
                        property_name = application.get('property_name', '') if application else ''
                        status_code = application.get('now_application_status_code', '') if application else ''
                        mine_info = source.get('mine', {})
                        mine_name = mine_info.get('mine_name', '') if mine_info else ''
                        desc_parts = []
                        if property_name:
                            desc_parts.append(property_name)
                        if mine_name:
                            desc_parts.append(mine_name)
                        if status_code:
                            status_map = {'REC': 'Received', 'REF': 'Referred', 'CDI': 'Client Delay', 'GVD': 'Govt Delay', 
                                         'CON': 'Consultation', 'AIA': 'Approved', 'REJ': 'Rejected', 'WDN': 'Withdrawn', 'NPR': 'No Permit Required'}
                            desc_parts.append(status_map.get(status_code, status_code))
                        description = " | ".join(desc_parts)
                        
                    # Filter by result type if search_types specified
                    if allowed_types and result_type not in allowed_types:
                        continue
                        
                    # Boost if starts with or exact match (skip for wildcard searches)
                    if value and search_term and search_term != "*":
                        if value.lower().startswith(search_term.lower()):
                            score_multiplier *= 3
                        if value.lower() == search_term.lower():
                            score_multiplier *= 10
                    
                    # Extract highlights from ES response
                    highlights = hit.get('highlight', {})
                    highlight_text = None
                    if highlights:
                        # Get the first highlighted field
                        for field, fragments in highlights.items():
                            if fragments:
                                highlight_text = fragments[0]
                                break
                        
                    search_results.append(SearchResult(
                        score * score_multiplier,
                        result_type,
                        {
                            'id': source.get(type_config['id_field']),
                            'value': value,
                            'description': description,
                            'highlight': highlight_text
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

        # Get facet counts (unfiltered) using aggregations
        facets = {'mine': 0, 'person': 0, 'organization': 0, 'permit': 0, 'nod': 0, 'explosives_permit': 0, 'now_application': 0}
        all_indices = ",".join([type_to_index[t] for t in simple_search_targets.keys() if t in type_to_index])
        
        if all_indices and search_term:
            # Build facet query with aggregations
            if len(search_term) < 3:
                facet_query = {
                    "query": {
                        "bool": {
                            "should": [
                                {"multi_match": {"query": search_term, "fields": ["*"], "type": "phrase_prefix"}},
                                {"multi_match": {"query": search_term, "fields": ["*"]}}
                            ],
                            "minimum_should_match": 1,
                            "filter": [{"term": {"deleted_ind": False}}]
                        }
                    },
                    "aggs": {
                        "by_index": {
                            "terms": {"field": "_index"},
                            "aggs": {
                                "by_party_type": {
                                    "terms": {"field": "party_type_code.keyword", "missing": "N/A"}
                                }
                            }
                        }
                    }
                }
            else:
                facet_query = {
                    "query": {
                        "bool": {
                            "must": [{"multi_match": {"query": search_term, "fields": ["*"], "fuzziness": "AUTO"}}],
                            "filter": [{"term": {"deleted_ind": False}}]
                        }
                    },
                    "aggs": {
                        "by_index": {
                            "terms": {"field": "_index"},
                            "aggs": {
                                "by_party_type": {
                                    "terms": {"field": "party_type_code.keyword", "missing": "N/A"}
                                }
                            }
                        }
                    }
                }

            try:
                facet_results = ElasticSearchService.search(all_indices, facet_query, size=0)
                buckets = facet_results.get('aggregations', {}).get('by_index', {}).get('buckets', [])
                
                for bucket in buckets:
                    index_name = bucket['key']
                    doc_count = bucket['doc_count']
                    
                    if index_name == 'mines':
                        facets['mine'] = doc_count
                    elif index_name == 'permits':
                        facets['permit'] = doc_count
                    elif index_name == 'notices_of_departure':
                        facets['nod'] = doc_count
                    elif index_name == 'explosives_permits':
                        facets['explosives_permit'] = doc_count
                    elif index_name == 'now_applications':
                        facets['now_application'] = doc_count
                    elif index_name == 'parties':
                        # Split by party_type_code
                        party_buckets = bucket.get('by_party_type', {}).get('buckets', [])
                        if party_buckets:
                            for party_bucket in party_buckets:
                                party_type = party_bucket['key']
                                party_count = party_bucket['doc_count']
                                if party_type == 'PER':
                                    facets['person'] = party_count
                                elif party_type == 'ORG':
                                    facets['organization'] = party_count
                        
                        # Fallback: if no party_type breakdown worked, count from grouped results
                        if facets['person'] == 0 and facets['organization'] == 0 and doc_count > 0:
                            for result in grouped_results.values():
                                if result.type == 'person':
                                    facets['person'] += 1
                                elif result.type == 'organization':
                                    facets['organization'] += 1
                                
            except Exception as e:
                current_app.logger.error(f"Elasticsearch facet error: {e}")
                # Fallback: count from all grouped results (before truncation)
                for result in grouped_results.values():
                    if result.type == 'mine':
                        facets['mine'] += 1
                    elif result.type == 'person':
                        facets['person'] += 1
                    elif result.type == 'organization':
                        facets['organization'] += 1
                    elif result.type == 'permit':
                        facets['permit'] += 1
                    elif result.type == 'nod':
                        facets['nod'] += 1
                    elif result.type == 'explosives_permit':
                        facets['explosives_permit'] += 1
                    elif result.type == 'now_application':
                        facets['now_application'] += 1

        return {'search_terms': search_terms, 'search_results': search_results, 'facets': facets}