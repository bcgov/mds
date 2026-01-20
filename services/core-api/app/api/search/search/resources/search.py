"""Search API resources."""

import regex
from concurrent.futures import ThreadPoolExecutor, as_completed
from flask import request, current_app
from flask_restx import Resource

from app.api.search.response_models import SEARCH_RESULT_RETURN_MODEL
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.search import search_targets, execute_search
from app.api.utils.feature_flag import Feature, is_feature_enabled
from app.extensions import api, db
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
            facets: Dict of facet counts for filtering (v2 only)
        """
        if is_feature_enabled(Feature.GLOBAL_SEARCH_V2):
            return self._search_v2()
        else:
            return self._search_v1()

    def _search_v2(self):
        """New Elasticsearch-based search implementation."""
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

    def _search_v1(self):
        """Original ThreadPoolExecutor-based search implementation."""
        search_results = []
        app = current_app._get_current_object()

        search_term = request.args.get('search_term', None, type=str)
        search_types = request.args.get('search_types', None, type=str)
        search_types = search_types.split(',') if search_types else search_targets.keys()

        # Split incoming search query by space to search by individual words
        reg_exp = regex.compile(r'\'.*?\' | ".*?" | \S+ ', regex.VERBOSE)
        search_terms = reg_exp.findall(search_term)
        search_terms = [term.replace('"', '') for term in search_terms]

        with ThreadPoolExecutor(max_workers=50) as executor:
            task_list = []
            for type, type_config in search_targets.items():
                if type in search_types:
                    task_list.append(
                        executor.submit(execute_search, app, search_results, search_term,
                                        search_terms, type, type_config))
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

        top_search_results = list(grouped_results.values())
        top_search_results.sort(key=lambda x: x.score, reverse=True)

        all_search_results = {}

        for type in search_types:
            top_search_results_by_type = {}

            max_results = 5
            if len(search_types) == 1:
                max_results = 50

            for result in top_search_results:
                if len(top_search_results_by_type) > max_results:
                    break
                if result.type == type:
                    top_search_results_by_type[result.result['id']] = result
            if search_targets[type].get('primary_column'):
                # Look up result data from the DB if the search type has a primary column
                # specified. Otherwise, just return the JSON representation of the result (in the case of the permit search service).
                full_results = db.session.query(search_targets[type]['model'])\
                    .filter(
                        search_targets[type]['primary_column'].in_(
                            top_search_results_by_type.keys())
                    )\
                    .all()

                for full_result in full_results:
                    top_search_results_by_type[getattr(
                        full_result, search_targets[type]['id_field'])].result = full_result

                all_search_results[type] = list(top_search_results_by_type.values())
            else:
                all_search_results[type] = [res.json() for res in search_results if res.type == type]

        return {'search_terms': search_terms, 'search_results': all_search_results}
