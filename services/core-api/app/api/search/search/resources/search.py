"""Search API resources."""

from flask import request
from flask_restx import Resource

from app.api.search.response_models import SEARCH_RESULT_RETURN_MODEL
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.search import search_targets
from app.extensions import api
from ..global_search_service import GlobalSearchService, parse_search_terms, parse_filters


class SearchOptionsResource(Resource, UserMixin):
    """Resource for retrieving available search options."""

    @requires_role_view_all
    def get(self):
        """Get list of searchable types with descriptions."""
        return [
            {'model_id': type_key, 'description': config['description']}
            for type_key, config in search_targets.items()
        ]


class SearchResource(Resource, UserMixin):
    """Resource for executing global searches."""

    @requires_role_view_all
    @api.marshal_with(SEARCH_RESULT_RETURN_MODEL, 200)
    def get(self):
        """
        Execute a global search across mines, parties, permits, and documents.

        Query Parameters:
            search_term: The search query string
            search_types: Comma-separated list of types to search (optional)
            Various filter parameters (mine_region, permit_status, etc.)

        Returns:
            search_terms: List of parsed search terms
            search_results: Dict of results grouped by type
            facets: Dict of facet counts for filtering
        """
        search_term = request.args.get('search_term', '', type=str)
        search_types_param = request.args.get('search_types', None, type=str)
        search_types = search_types_param.split(',') if search_types_param else list(search_targets.keys())

        search_terms = parse_search_terms(search_term)
        filters = parse_filters(request.args)

        search_result = GlobalSearchService.search(search_term, search_types, filters)

        return {
            'search_terms': search_terms,
            'search_results': search_result['results'],
            'facets': search_result['facets']
        }
