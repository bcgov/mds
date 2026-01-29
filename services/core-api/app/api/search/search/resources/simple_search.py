"""
Simple Search Resource

REST API endpoint for simple search functionality.
Delegates business logic to SimpleSearchService - thin resource layer.
"""

import logging
from concurrent.futures import ThreadPoolExecutor, as_completed

from flask import current_app, request
from flask_restx import Resource

from app.api.search.response_models import SIMPLE_SEARCH_RESULT_RETURN_MODEL
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.search import execute_search, simple_search_targets
from app.api.utils.feature_flag import Feature, is_feature_enabled
from app.extensions import api

# Import services
from ..simple_search_service import SimpleSearchService
from ..global_search_service import parse_search_terms

logger = logging.getLogger(__name__)


class SimpleSearchResource(Resource, UserMixin):
    """
    REST API resource for simple search.
    
    Responsibilities:
    - Handle HTTP request/response
    - Extract and validate request parameters
    - Delegate to SimpleSearchService for business logic
    - Return formatted response
    """
    
    @requires_role_view_all
    @api.marshal_with(SIMPLE_SEARCH_RESULT_RETURN_MODEL, 200)
    def get(self):
        """
        GET /search/simple
        
        Execute a simple search query.
        
        Query Parameters:
            search_term: Text to search for
            search_types: Optional comma-separated list of types to filter by
            mine_guid: Optional mine GUID to scope the search
            
        Returns:
            dict with search_terms, search_results, and facets (V2 only)
        """
        if is_feature_enabled(Feature.GLOBAL_SEARCH_V2):
            return self._search_v2()
        else:
            return self._search_v1()
    
    def _search_v1(self):
        """
        V1 search implementation - ThreadPoolExecutor-based.
        Kept for backward compatibility when V2 feature flag is off.
        """
        search_results = []
        app = current_app._get_current_object()

        search_term = request.args.get('search_term', None, type=str)
        search_terms = parse_search_terms(search_term) if search_term else []

        with ThreadPoolExecutor(max_workers=50) as executor:
            task_list = []
            for type, type_config in simple_search_targets.items():
                task_list.append(
                    executor.submit(execute_search, app, search_results, search_term, search_terms,
                                    type, type_config, 200))
            for task in as_completed(task_list):
                try:
                    data = task.result()
                except Exception as exc:
                    current_app.logger.error(
                        f'generated an exception: {exc} with search term - {search_term}')

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

    def _search_v2(self):
        """
        V2 search implementation - delegates to SimpleSearchService.
        
        Thin resource method that only handles HTTP concerns:
        - Extract request parameters
        - Delegate to service layer
        - Return response
        """
        # Extract request parameters
        search_term = request.args.get('search_term', None, type=str)
        search_types = request.args.get('search_types', None, type=str)
        mine_guid = request.args.get('mine_guid', None, type=str)

        # Instantiate service (allows for easier mocking in tests)
        search_service = SimpleSearchService()
        
        # Delegate all business logic to service layer
        return search_service.execute_search(search_term, search_types, mine_guid)
