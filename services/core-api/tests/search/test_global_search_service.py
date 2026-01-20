"""Tests for global search service."""

import pytest
from unittest.mock import patch, MagicMock
from app.api.search.search.global_search_service import (
    GlobalSearchService,
    parse_csv_param,
    parse_search_terms,
    parse_filters,
    build_search_query,
)


class TestParseHelpers:
    """Test parsing helper functions."""

    def test_parse_csv_param_with_values(self):
        result = parse_csv_param('SW,NE,NW')
        assert result == ['SW', 'NE', 'NW']

    def test_parse_csv_param_empty(self):
        result = parse_csv_param('')
        assert result == []

    def test_parse_csv_param_none(self):
        result = parse_csv_param(None)
        assert result == []

    def test_parse_csv_param_with_spaces(self):
        result = parse_csv_param(' SW , NE , NW ')
        assert result == ['SW', 'NE', 'NW']

    def test_parse_search_terms_basic(self):
        result = parse_search_terms('test mine')
        assert 'test' in result
        assert 'mine' in result

    def test_parse_search_terms_with_quotes(self):
        result = parse_search_terms('"test mine" another')
        assert 'test mine' in result
        assert 'another' in result

    def test_parse_search_terms_empty(self):
        result = parse_search_terms('')
        assert result == []

    def test_parse_filters(self):
        args = MagicMock()
        args.get.side_effect = lambda key: {
            'mine_region': 'SW,NE',
            'permit_status': 'O',
            'other_param': 'ignored'
        }.get(key)
        
        result = parse_filters(args)
        
        assert 'mine_region' in result
        assert result['mine_region'] == ['SW', 'NE']
        assert 'permit_status' in result
        assert result['permit_status'] == ['O']


class TestBuildSearchQuery:
    """Test search query building."""

    def test_build_search_query_with_term(self):
        query = build_search_query('test', [])
        
        assert 'query' in query
        assert 'bool' in query['query']
        assert 'should' in query['query']['bool']
        assert 'aggs' in query

    def test_build_search_query_wildcard(self):
        query = build_search_query('*', [])
        
        assert 'query' in query
        assert 'match_all' in query['query']['bool']['must'][0]

    def test_build_search_query_empty(self):
        query = build_search_query('', [])
        
        assert 'match_all' in query['query']['bool']['must'][0]

    def test_build_search_query_with_filters(self):
        filter_clauses = [
            {'term': {'mine_region.keyword': 'SW'}}
        ]
        query = build_search_query('test', filter_clauses)
        
        assert 'filter' in query['query']['bool']
        assert len(query['query']['bool']['filter']) == 1

    def test_build_search_query_includes_aggregations(self):
        query = build_search_query('test', [])
        
        assert 'aggs' in query
        # Should have various aggregations defined
        assert len(query['aggs']) > 0

    def test_build_search_query_phrase_prefix(self):
        query = build_search_query('test mine', [])
        
        # Should include phrase_prefix match
        should_clauses = query['query']['bool']['should']
        phrase_prefix = next((c for c in should_clauses if 'multi_match' in c and c['multi_match'].get('type') == 'phrase_prefix'), None)
        assert phrase_prefix is not None

    def test_build_search_query_fuzzy_for_long_term(self):
        query = build_search_query('testing', [])
        
        # Should include fuzzy match for terms >= 3 chars
        should_clauses = query['query']['bool']['should']
        fuzzy_match = next((c for c in should_clauses if 'multi_match' in c and 'fuzziness' in c['multi_match']), None)
        assert fuzzy_match is not None

    def test_build_search_query_no_fuzzy_for_short_term(self):
        query = build_search_query('ab', [])
        
        # Should not include fuzzy match for short terms
        should_clauses = query['query']['bool']['should']
        fuzzy_matches = [c for c in should_clauses if 'multi_match' in c and 'fuzziness' in c['multi_match']]
        assert len(fuzzy_matches) == 0


class TestGlobalSearchService:
    """Test GlobalSearchService."""

    @patch('app.api.search.search.global_search_service.ElasticSearchService')
    def test_search_basic(self, mock_es_service):
        # Mock ES response
        mock_es_service.search.return_value = {
            'hits': {
                'hits': [
                    {
                        '_index': 'mines',
                        '_score': 10.0,
                        '_source': {
                            'mine_guid': 'mine-123',
                            'mine_name': 'Test Mine',
                            'mine_no': 'M-001'
                        }
                    }
                ]
            },
            'aggregations': {
                'by_index': {
                    'buckets': [{'key': 'mines', 'doc_count': 1}]
                }
            }
        }
        
        result = GlobalSearchService.search('test', ['mine'], {})
        
        assert 'results' in result
        assert 'facets' in result
        assert 'mine' in result['results']
        assert len(result['results']['mine']) == 1
        mock_es_service.search.assert_called_once()

    @patch('app.api.search.search.global_search_service.ElasticSearchService')
    def test_search_multiple_types(self, mock_es_service):
        mock_es_service.search.return_value = {
            'hits': {
                'hits': [
                    {
                        '_index': 'mines',
                        '_score': 10.0,
                        '_source': {'mine_guid': 'mine-123', 'mine_name': 'Test Mine'}
                    },
                    {
                        '_index': 'parties',
                        '_score': 8.0,
                        '_source': {'party_guid': 'party-123', 'first_name': 'John', 'party_name': 'Doe'}
                    }
                ]
            },
            'aggregations': {}
        }
        
        result = GlobalSearchService.search('test', ['mine', 'party'], {})
        
        assert 'mine' in result['results']
        assert 'party' in result['results']
        assert len(result['results']['mine']) == 1
        assert len(result['results']['party']) == 1

    @patch('app.api.search.search.global_search_service.ElasticSearchService')
    def test_search_with_filters(self, mock_es_service):
        mock_es_service.search.return_value = {
            'hits': {'hits': []},
            'aggregations': {}
        }
        
        filters = {'mine_region': ['SW'], 'permit_status': ['O']}
        result = GlobalSearchService.search('test', ['mine'], filters)
        
        # Verify ES service was called
        mock_es_service.search.assert_called_once()
        call_args = mock_es_service.search.call_args
        query = call_args[0][1]
        
        # Query should include filters
        assert 'filter' in query['query']['bool']

    @patch('app.api.search.search.global_search_service.ElasticSearchService')
    def test_search_ensures_all_types_present(self, mock_es_service):
        # ES returns only mines
        mock_es_service.search.return_value = {
            'hits': {
                'hits': [
                    {
                        '_index': 'mines',
                        '_score': 10.0,
                        '_source': {'mine_guid': 'mine-123', 'mine_name': 'Test Mine'}
                    }
                ]
            },
            'aggregations': {}
        }
        
        # Request both mines and parties
        result = GlobalSearchService.search('test', ['mine', 'party'], {})
        
        # Both should be in results, party should be empty list
        assert 'mine' in result['results']
        assert 'party' in result['results']
        assert len(result['results']['mine']) == 1
        assert len(result['results']['party']) == 0

    @patch('app.api.search.search.global_search_service.ElasticSearchService')
    def test_search_handles_es_error(self, mock_es_service):
        # Simulate ES error
        mock_es_service.search.side_effect = Exception('ES connection failed')
        
        result = GlobalSearchService.search('test', ['mine'], {})
        
        # Should return empty results instead of raising
        assert 'results' in result
        assert 'facets' in result
        assert result['results']['mine'] == []

    @patch('app.api.search.search.global_search_service.ElasticSearchService')
    def test_search_with_custom_size(self, mock_es_service):
        mock_es_service.search.return_value = {
            'hits': {'hits': []},
            'aggregations': {}
        }
        
        GlobalSearchService.search('test', ['mine'], {}, size=100)
        
        # Verify size parameter was passed
        call_args = mock_es_service.search.call_args
        assert call_args[1]['size'] == 100

    @patch('app.api.search.search.global_search_service.ElasticSearchService')
    def test_search_builds_correct_indices_string(self, mock_es_service):
        mock_es_service.search.return_value = {
            'hits': {'hits': []},
            'aggregations': {}
        }
        
        GlobalSearchService.search('test', ['mine', 'party', 'permit'], {})
        
        # Verify correct indices were passed
        call_args = mock_es_service.search.call_args
        indices = call_args[0][0]
        
        # Should be comma-separated index names
        assert 'mines' in indices
        assert 'parties' in indices
        assert 'permits' in indices or 'mine_permits' in indices

    @patch('app.api.search.search.global_search_service.ElasticSearchService')
    def test_search_returns_facets(self, mock_es_service):
        mock_es_service.search.return_value = {
            'hits': {'hits': []},
            'aggregations': {
                'mine_region': {
                    'buckets': [{'key': 'SW', 'doc_count': 10}]
                }
            }
        }
        
        result = GlobalSearchService.search('test', ['mine'], {})
        
        assert 'facets' in result
        assert 'mine_region' in result['facets']
        assert len(result['facets']['mine_region']) == 1
        assert result['facets']['mine_region'][0]['key'] == 'SW'

    def test_search_with_no_indices(self):
        result = GlobalSearchService.search('test', [], {})
        
        # Should return empty results
        assert 'results' in result
        assert 'facets' in result
        assert result['results'] == {}

    @patch('app.api.search.search.global_search_service.ElasticSearchService')
    def test_search_logs_info(self, mock_es_service):
        mock_es_service.search.return_value = {
            'hits': {'hits': []},
            'aggregations': {}
        }
        
        with patch('app.api.search.search.global_search_service.current_app') as mock_app:
            GlobalSearchService.search('test query', ['mine'], {})
            
            # Should log the search
            assert mock_app.logger.info.called
            call_args = str(mock_app.logger.info.call_args_list)
            assert 'test query' in call_args
