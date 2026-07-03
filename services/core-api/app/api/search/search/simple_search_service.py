"""
Simple Search Service

Business logic for simple search functionality.
Separated from the REST resource layer for better testability and maintainability.
"""

import json
import logging
import traceback

from app.api.search.elasticsearch.elastic_search_service import ElasticSearchService
from app.api.utils.search import SearchResult, simple_search_targets
from flask import current_app

from .global_search_service import parse_csv_param

# Import shared constants and utilities
from .search_constants import INDEX_TO_TYPE, SEARCH_FIELDS, TYPE_TO_INDEX
from .search_facets import extract_simple_type_facets
from .search_filters import build_deleted_filter, build_mine_guid_filter

logger = logging.getLogger(__name__)

# Result type to internal type mapping
RESULT_TYPE_TO_INDEX = {
    'mine': 'mine',
    'person': 'party',
    'organization': 'party',
    'permit': 'permit',
    'nod': 'notice_of_departure',
    'explosives_permit': 'explosives_permit',
    'now_application': 'now_application',
    'mine_documents': 'mine_documents'
}

# Derive highlight configuration from search fields
HIGHLIGHT_FIELDS = {
    field.split('^')[0]: {} for field in SEARCH_FIELDS if '^' in field or field not in ['*']
}


class SimpleSearchService:
    """
    Service class for simple search business logic.
    
    Handles:
    - Search execution and coordination
    - Query building
    - Result processing
    - Facet extraction
    """
    
    def execute_search(self, search_term, search_types=None, mine_guid=None):
        """
        Execute a simple search with the given parameters.
        
        Args:
            search_term: The search term to query
            search_types: Optional comma-separated list of types to filter by
            mine_guid: Optional mine GUID to scope the search
            
        Returns:
            dict with search_terms, search_results, and facets
        """
        # Parse allowed types
        # If search_types is None (not provided), set allowed_types to None (implies all types)
        # If search_types is empty string, parse_csv_param returns [], which implies NO types
        allowed_types = parse_csv_param(search_types) if search_types else None
        
        # Determine indices to search
        indices = self._determine_search_indices(allowed_types)
        if not indices:
            return {'search_results': [], 'facets': {}}
        
        indices_string = ",".join(list(set(indices)))
        current_app.logger.info(f"Searching indices: {indices_string}")
        
        # Build filters and query
        base_filters = self._build_base_filters(mine_guid)
        query = self._build_search_query(search_term, base_filters)
        
        # Execute search and process results
        search_results = self._execute_and_process_search(
            indices_string, query, allowed_types
        )
        
        # Group and rank results
        search_results = self._group_and_rank_results(search_results)
        
        # Get facets
        facets = self._get_facet_counts(search_term)
        
        return {
            'search_results': search_results,
            'facets': facets
        }
    
    def _determine_search_indices(self, allowed_types):
        """Determine which Elasticsearch indices to search based on allowed types."""
        available_types = [t for t in simple_search_targets.keys() if t in TYPE_TO_INDEX]

        if allowed_types is None:
            return [TYPE_TO_INDEX[t] for t in available_types]

        allowed_index_types = {RESULT_TYPE_TO_INDEX.get(t) for t in allowed_types}
        allowed_index_types.discard(None)
        return [TYPE_TO_INDEX[t] for t in available_types if t in allowed_index_types]
    
    def _build_base_filters(self, mine_guid=None):
        """Build base Elasticsearch filters using shared filter builders."""
        filters = [build_deleted_filter()]
        
        if mine_guid:
            filters.append(build_mine_guid_filter(mine_guid))
        
        return filters
    
    def _build_search_query(self, search_term, base_filters, include_highlight=True):
        """Build Elasticsearch search query based on search term length."""
        is_wildcard = search_term == "*" or not search_term
        
        if is_wildcard:
            return {
                "query": {"bool": {"must": [{"match_all": {}}], "filter": base_filters}},
                "sort": [{"_score": "desc"}]
            }
        
        highlight_config = {
            "fields": HIGHLIGHT_FIELDS,
            "pre_tags": ["<mark>"],
            "post_tags": ["</mark>"],
            "fragment_size": 150,
            "number_of_fragments": 1
        } if include_highlight else None
        
        if len(search_term) < 3:
            query = {
                "query": {
                    "bool": {
                        "should": [
                            {"multi_match": {"query": search_term, "fields": SEARCH_FIELDS, "type": "phrase_prefix"}},
                            {"multi_match": {"query": search_term, "fields": SEARCH_FIELDS}}
                        ],
                        "minimum_should_match": 1,
                        "filter": base_filters
                    }
                }
            }
        else:
            query = {
                "query": {
                    "bool": {
                        "should": [
                            {"multi_match": {"query": search_term, "fields": SEARCH_FIELDS, "type": "phrase_prefix"}},
                            {"multi_match": {"query": search_term, "fields": SEARCH_FIELDS, "fuzziness": "AUTO"}}
                        ],
                        "minimum_should_match": 1,
                        "filter": base_filters
                    }
                }
            }
        
        if highlight_config:
            query["highlight"] = highlight_config
        
        return query
    
    def _execute_and_process_search(self, indices_string, query, allowed_types):
        """Execute Elasticsearch search and process results."""
        search_results = []
        
        try:
            current_app.logger.info(f"ES Query: {json.dumps(query)}")
            es_results = ElasticSearchService.search(indices_string, query, size=30)
            hits = es_results['hits']['hits']
            current_app.logger.info(f"ES returned {len(hits)} hits")

            # Process each hit
            for hit in hits:
                try:
                    result = self._process_hit(hit, allowed_types)
                    if result:
                        search_results.append(result)
                except Exception as e:
                    # A single malformed document (e.g. an Elasticsearch index
                    # whose mapping has drifted from what this code expects)
                    # should not take down the rest of the batch.
                    current_app.logger.error(
                        f"Failed to process search hit (index={hit.get('_index')}, "
                        f"id={hit.get('_id')}): {e}"
                    )
                    current_app.logger.error(f"[DEBUG] full traceback:\n{traceback.format_exc()}")

        except Exception as e:
            current_app.logger.error(f"Elasticsearch error: {e}")
            current_app.logger.error(f"[DEBUG] full traceback:\n{traceback.format_exc()}")
        
        return search_results
    
    def _group_and_rank_results(self, search_results):
        """Group results by ID and rank by score."""
        # Group results by ID (combine duplicates)
        grouped_results = {}
        for result in search_results:
            result_id = result.result['id']
            if result_id in grouped_results:
                grouped_results[result_id].score += result.score
            else:
                grouped_results[result_id] = result
        
        # Sort by score and limit to top 4
        results_list = list(grouped_results.values())
        results_list.sort(key=lambda x: x.score, reverse=True)
        return results_list[:4]
    
    def _process_hit(self, hit, allowed_types):
        """Process a single Elasticsearch hit into a SearchResult."""
        index = hit['_index']
        index_to_type = {v: k for k, v in TYPE_TO_INDEX.items()}
        doc_type = index_to_type.get(index)
        
        if not doc_type or doc_type not in simple_search_targets:
            return None
        
        source = hit['_source']
        score = hit['_score']
        type_config = simple_search_targets[doc_type]
        
        # Process based on type using processor dictionary
        processors = {
            'mine': self._process_mine_result,
            'party': self._process_party_result,
            'permit': self._process_permit_result,
            'notice_of_departure': self._process_nod_result,
            'explosives_permit': self._process_explosives_permit_result,
            'now_application': self._process_now_application_result,
            'mine_documents': self._process_mine_document_result
        }
        
        processor = processors.get(doc_type)
        if not processor:
            return None
        
        result_type, value, description = processor(source)
        
        # Filter by allowed types
        if allowed_types and result_type not in allowed_types:
            return None
        
        # Extract highlight
        highlight_text = None
        if highlights := hit.get('highlight', {}):
            for fragments in highlights.values():
                if fragments:
                    highlight_text = fragments[0]
                    break
        
        mine_guid = self._extract_mine_guid(doc_type, source)
        mines = self._extract_mines(doc_type, source)
        
        return SearchResult(
            score,
            result_type,
            {
                'id': source.get(type_config['id_field']),
                'value': value,
                'description': description,
                'highlight': highlight_text,
                'mine_guid': mine_guid,
                'mines': mines
            }
        )
    
    def _process_mine_document_result(self, source):
        """Process mine document search result."""
        value = source.get('document_name', '')
        mine_name = source.get('mine', {}).get('mine_name', '') if isinstance(source.get('mine'), dict) else ''
        upload_date = source.get('upload_date', '')
        
        desc_parts = []
        if mine_name:
            desc_parts.append(mine_name)
        if upload_date:
            desc_parts.append(f"Date: {upload_date[:10]}")
        
        return 'mine_documents', value, " | ".join(desc_parts)
        
    def _extract_mine_guid(self, doc_type, source):
        """Extract mine_guid from source based on document type."""
        if doc_type == 'mine':
            return source.get('mine_guid')
        elif doc_type == 'mine_documents':
            return source.get('mine_guid')
        elif doc_type == 'permit':
            mine_guids = source.get('mine_guids', [])
            return mine_guids[0].get('mine_guid') if mine_guids and isinstance(mine_guids, list) else None
        elif doc_type in ['notice_of_departure', 'explosives_permit', 'now_application']:
            mine_info = source.get('mine')
            return mine_info.get('mine_guid') if isinstance(mine_info, dict) else None
        return None
    
    def _extract_mines(self, doc_type, source):
        """Extract mines (details) from source based on document type."""
        if doc_type == 'permit':
            mine_guids = source.get('mine_guids', [])
            return [{"mine_guid": mine.get("mine_guid"), "mine_name": mine.get("mine_name", "")} for mine in mine_guids] if mine_guids else None
        else:
            return None
    
    def _process_mine_result(self, source):
        """Process mine search result."""
        value = source.get('mine_name', '')
        mine_no = source.get('mine_no', '')
        mms_alias = source.get('mms_alias', '')
        
        # Extract commodities
        commodities = set()
        for mt in source.get('mine_types', []) or []:
            for detail in mt.get('mine_type_details', []) or []:
                if commodity := detail.get('mine_commodity_code'):
                    commodities.add(commodity)
        
        desc_parts = [f"Mine #: {mine_no}"] if mine_no else []
        if commodities:
            desc_parts.append(", ".join(sorted(commodities)))
        if mms_alias:
            desc_parts.append(f"Alias: {mms_alias}")
        
        return 'mine', value, " | ".join(desc_parts)
    
    def _process_party_result(self, source):
        """Process party search result."""
        first_name = source.get('first_name', '')
        party_name = source.get('party_name', '')
        party_type_code = source.get('party_type_code', 'PER')
        email = source.get('email', '')
        phone_no = source.get('phone_no', '')
        
        result_type = 'person' if party_type_code == 'PER' else 'organization'
        value = f"{first_name} {party_name}".strip() if first_name else party_name
        
        desc_parts = [email] if email else []
        if phone_no:
            desc_parts.append(phone_no)
        
        return result_type, value, " | ".join(desc_parts)
    
    def _process_permit_result(self, source):
        """Process permit search result."""
        value = source.get('permit_no') or source.get('permit_number', '')
        permit_status = source.get('permit_status_code', '')
        
        # Get first permittee
        current_permittee = ''
        if permittees := source.get('permittees', []):
            first_permittee = permittees[0] if isinstance(permittees, list) else permittees
            if first_permittee:
                first_name = first_permittee.get('first_name', '')
                party_name = first_permittee.get('party_name', '')
                current_permittee = f"{first_name} {party_name}".strip() if first_name else party_name
        
        desc_parts = [current_permittee] if current_permittee else []
        if permit_status:
            desc_parts.append(f"Status: {permit_status}")
        
        return 'permit', value, " | ".join(desc_parts)
    
    def _process_nod_result(self, source):
        """Process notice of departure search result."""
        value = source.get('nod_title', '') or source.get('nod_no', '')
        nod_no = source.get('nod_no', '')
        nod_status = source.get('nod_status', '')
        mine_name = source.get('mine', {}).get('mine_name', '') if source.get('mine') else ''
        
        desc_parts = [nod_no] if nod_no else []
        if mine_name:
            desc_parts.append(mine_name)
        if nod_status:
            desc_parts.append(nod_status.replace('_', ' ').title())
        
        return 'nod', value, " | ".join(desc_parts)
    
    def _process_explosives_permit_result(self, source):
        """Process explosives permit search result."""
        value = source.get('permit_number', '') or source.get('application_number', '')
        app_status = source.get('application_status', '')
        is_closed = source.get('is_closed', False)
        mine_name = source.get('mine', {}).get('mine_name', '') if source.get('mine') else ''
        
        status_map = {'REC': 'Received', 'APP': 'Approved', 'REJ': 'Rejected'}
        
        desc_parts = [mine_name] if mine_name else []
        if is_closed:
            desc_parts.append('Closed')
        elif app_status:
            desc_parts.append(status_map.get(app_status, app_status))
        
        return 'explosives_permit', value, " | ".join(desc_parts)
    
    def _process_now_application_result(self, source):
        """Process NOW application search result."""
        value = source.get('now_number', '')
        application = source.get('application', {})
        property_name = application.get('property_name', '') if application else ''
        status_code = application.get('now_application_status_code', '') if application else ''
        mine_name = source.get('mine', {}).get('mine_name', '') if source.get('mine') else ''
        
        status_map = {
            'REC': 'Received', 'REF': 'Referred', 'CDI': 'Client Delay', 'GVD': 'Govt Delay',
            'CON': 'Consultation', 'AIA': 'Approved', 'REJ': 'Rejected', 'WDN': 'Withdrawn', 'NPR': 'No Permit Required'
        }
        
        desc_parts = [property_name] if property_name else []
        if mine_name:
            desc_parts.append(mine_name)
        if status_code:
            desc_parts.append(status_map.get(status_code, status_code))
        
        return 'now_application', value, " | ".join(desc_parts)
    
    def _get_facet_counts(self, search_term):
        """Get facet counts using Elasticsearch aggregations and shared extraction logic."""
        all_indices = ",".join([TYPE_TO_INDEX[t] for t in simple_search_targets.keys() if t in TYPE_TO_INDEX])
        if not all_indices or not search_term:
            return extract_simple_type_facets({})  # Return empty facets with structure
        
        # Build query with aggregations using shared filter builder
        facet_query = self._build_search_query(
            search_term, 
            [build_deleted_filter()], 
            include_highlight=False
        )
        
        # Add aggregations for type counting
        facet_query["aggs"] = {
            "by_index": {
                "terms": {"field": "_index", "size": 100},  # Increased size to ensure we get all indices
                "aggs": {
                    "by_party_type": {
                        "terms": {"field": "party_type_code.keyword", "missing": "N/A"}
                    }
                }
            }
        }
        
        try:
            facet_results = ElasticSearchService.search(all_indices, facet_query, size=0)
            return extract_simple_type_facets(facet_results.get('aggregations', {}))
        except Exception as e:
            current_app.logger.error(f"Elasticsearch facet error: {e}")
            return extract_simple_type_facets({})
