"""Global search service for executing searches against Elasticsearch."""

import regex
from flask import current_app

from app.api.search.elasticsearch.elastic_search_service import ElasticSearchService
from .search_constants import TYPE_TO_INDEX, ES_AGGREGATIONS, FACET_KEYS, FILTER_PARAMS, SEARCH_FIELDS
from .search_filters import build_filter_clauses
from .search_facets import extract_facets
from .search_transformers import transform_es_results


def parse_csv_param(value):
    """Parse comma-separated parameter into list."""
    return [v.strip() for v in value.split(',')] if value else []


def parse_search_terms(search_term):
    """Parse search term into individual terms."""
    reg_exp = regex.compile(r'\'.*?\' | ".*?" | \S+ ', regex.VERBOSE)
    return [term.replace('"', '') for term in reg_exp.findall(search_term)]


def parse_filters(request_args):
    """Parse filter parameters from request args."""
    return {param: parse_csv_param(request_args.get(param)) for param in FILTER_PARAMS}


def build_search_query(search_term, filter_clauses):
    """Build the complete ES search query."""
    if not search_term or search_term == "*":
        return {
            "query": {
                "bool": {
                    "must": [{"match_all": {}}],
                    "filter": filter_clauses
                }
            },
            "sort": [{"_score": "desc"}],
            "aggs": ES_AGGREGATIONS
        }

    # Highlight configuration (optional usage for now)
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
    
    should_clauses = [
        {
            "multi_match": {
                "query": search_term,
                "fields": SEARCH_FIELDS,
                "type": "phrase_prefix"
            }
        }
    ]
    
    # If search term is longer, add fuzzy match
    if len(search_term) >= 3:
        should_clauses.append({
            "multi_match": {
                "query": search_term,
                "fields": SEARCH_FIELDS,
                "fuzziness": "AUTO"
            }
        })

    return {
        "query": {
            "bool": {
                "should": should_clauses,
                "minimum_should_match": 1,
                "filter": filter_clauses
            }
        },
        "highlight": highlight_config,
        "aggs": ES_AGGREGATIONS
    }


def get_empty_results(search_types):
    """Get empty results structure."""
    return {
        'results': {t: [] for t in search_types},
        'facets': {k: [] for k in FACET_KEYS}
    }


class GlobalSearchService:
    """Service for executing global searches."""

    @staticmethod
    def search(search_term, search_types, filters, size=200):
        """
        Execute a global search.

        Args:
            search_term: The search query string
            search_types: List of types to search (e.g., ['mine', 'party', 'permit'])
            filters: Dict of filter parameters
            size: Maximum number of results to return

        Returns:
            Dict with 'results' and 'facets' keys
        """
        indices = [TYPE_TO_INDEX[t] for t in search_types if t in TYPE_TO_INDEX]

        if not indices:
            return get_empty_results(search_types)

        try:
            filter_clauses = build_filter_clauses(filters)
            query = build_search_query(search_term, filter_clauses)

            current_app.logger.info(f"Searching ES indices: {','.join(indices)} for: {search_term}")

            es_results = ElasticSearchService.search(','.join(set(indices)), query, size=size)
            hits = es_results['hits']['hits']

            current_app.logger.info(f"ES returned {len(hits)} hits")

            facets = extract_facets(es_results.get('aggregations', {}))
            results = transform_es_results(hits)

            # Ensure all requested types have entries
            for t in search_types:
                if t not in results:
                    results[t] = []

            return {'results': results, 'facets': facets}

        except Exception as e:
            current_app.logger.error(f"Elasticsearch error: {e}")
            import traceback
            current_app.logger.error(traceback.format_exc())
            return get_empty_results(search_types)
