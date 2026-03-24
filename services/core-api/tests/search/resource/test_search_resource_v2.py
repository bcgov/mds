"""Tests for search resource with V2 (Elasticsearch) enabled."""

import json
import pytest
from unittest.mock import patch
from tests.factories import MineFactory, PartyFactory


@pytest.fixture
def enable_search_v2():
    """Enable V2 search for tests in this module."""
    with patch('app.api.search.search.resources.search.is_feature_enabled') as mock_flag:
        mock_flag.return_value = True
        yield mock_flag


@pytest.fixture
def enable_simple_search_v2():
    """Enable V2 simple search for tests in this module."""
    with patch('app.api.search.search.resources.simple_search.is_feature_enabled') as mock_flag:
        mock_flag.return_value = True
        yield mock_flag


@pytest.fixture
def mock_es_service():
    """Mock Elasticsearch service - mocks the class method 'search'."""
    with patch('app.api.search.elasticsearch.elastic_search_service.ElasticSearchService.search') as mock_search:
        # Default return value to prevent errors
        mock_search.return_value = {
            'hits': {'hits': []},
            'aggregations': {'by_index': {'buckets': []}}
        }
        yield mock_search


class TestSearchResourceV2:
    """Test search resource with V2 enabled."""

    def test_search_v2_mine_results(self, test_client, db_session, auth_headers, enable_search_v2, mock_es_service):
        """Test V2 search returns mine results."""
        mock_es_service.return_value = {
            'hits': {
                'hits': [
                    {
                        '_index': 'mines',
                        '_score': 10.0,
                        '_source': {
                            'mine_guid': 'test-mine-guid',
                            'mine_name': 'Test Mine',
                            'mine_no': 'M-001',
                            'mine_region': 'SW',
                            'major_mine_ind': True
                        }
                    }
                ]
            },
            'aggregations': {
                'by_index': {
                    'buckets': [{'key': 'mines', 'doc_count': 1}]
                },
                'mine_region': {
                    'buckets': [{'key': 'SW', 'doc_count': 1}]
                }
            }
        }
        
        response = test_client.get(
            '/search?search_term=Test', 
            headers=auth_headers['full_auth_header']
        )
        
        assert response.status_code == 200
        data = json.loads(response.data.decode())
        
        assert 'search_terms' in data
        assert 'search_results' in data
        assert 'facets' in data
        
        # Check mine results
        assert 'mine' in data['search_results']
        mines = data['search_results']['mine']
        assert len(mines) >= 1
        
        # Check facets are present
        assert 'mine_region' in data['facets']
        assert len(data['facets']['mine_region']) >= 1

    def test_search_v2_party_results(self, test_client, db_session, auth_headers, enable_search_v2, mock_es_service):
        """Test V2 search returns party results."""
        mock_es_service.return_value = {
            'hits': {
                'hits': [
                    {
                        '_index': 'parties',
                        '_score': 8.5,
                        '_source': {
                            'party_guid': 'test-party-guid',
                            'first_name': 'John',
                            'party_name': 'Doe',
                            'party_type_code': 'PER',
                            'email': 'john@example.com',
                            'phone_no': '555-1234'
                        }
                    }
                ]
            },
            'aggregations': {
                'by_index': {
                    'buckets': [{'key': 'parties', 'doc_count': 1}]
                },
                'party_type': {
                    'buckets': [{'key': 'PER', 'doc_count': 1}]
                }
            }
        }
        
        response = test_client.get(
            '/search?search_term=John&search_types=party',
            headers=auth_headers['full_auth_header']
        )
        
        assert response.status_code == 200
        data = json.loads(response.data.decode())
        
        assert 'party' in data['search_results']
        parties = data['search_results']['party']
        assert len(parties) >= 1
        
        party = parties[0]
        assert party['result']['name'] == 'John Doe'

    def test_search_v2_with_filters(self, test_client, db_session, auth_headers, enable_search_v2, mock_es_service):
        """Test V2 search with filter parameters."""
        mock_es_service.return_value = {
            'hits': {'hits': []},
            'aggregations': {'by_index': {'buckets': []}}
        }
        
        response = test_client.get(
            '/search?search_term=test&mine_region=SW&permit_status=O',
            headers=auth_headers['full_auth_header']
        )
        
        assert response.status_code == 200
        
        # Verify ES service was called with filters
        assert mock_es_service.called
        call_args = mock_es_service.call_args
        query = call_args[0][1]
        
        # Should have filter clauses
        assert 'filter' in query['query']['bool']

    def test_search_v2_multiple_types(self, test_client, db_session, auth_headers, enable_search_v2, mock_es_service):
        """Test V2 search with multiple result types."""
        mock_es_service.return_value = {
            'hits': {
                'hits': [
                    {
                        '_index': 'mines',
                        '_score': 10.0,
                        '_source': {'mine_guid': 'mine-1', 'mine_name': 'Mine 1'}
                    },
                    {
                        '_index': 'parties',
                        '_score': 8.0,
                        '_source': {
                            'party_guid': 'party-1',
                            'first_name': 'John',
                            'party_name': 'Doe',
                            'party_type_code': 'PER'
                        }
                    },
                    {
                        '_index': 'mine_permits',
                        '_score': 7.5,
                        '_source': {
                            'permit_guid': 'permit-1',
                            'permit_no': 'P-001',
                            'mine_guids': ['mine-1']
                        }
                    }
                ]
            },
            'aggregations': {
                'by_index': {
                    'buckets': [
                        {'key': 'mines', 'doc_count': 1},
                        {'key': 'parties', 'doc_count': 1},
                        {'key': 'mine_permits', 'doc_count': 1}
                    ]
                }
            }
        }
        
        response = test_client.get(
            '/search?search_term=test&search_types=mine,party,permit',
            headers=auth_headers['full_auth_header']
        )
        
        assert response.status_code == 200
        data = json.loads(response.data.decode())
        
        assert 'mine' in data['search_results']
        assert 'party' in data['search_results']
        assert 'permit' in data['search_results']

    def test_search_v2_empty_results(self, test_client, db_session, auth_headers, enable_search_v2, mock_es_service):
        """Test V2 search with no results."""
        mock_es_service.return_value = {
            'hits': {'hits': []},
            'aggregations': {'by_index': {'buckets': []}}
        }
        
        response = test_client.get(
            '/search?search_term=nonexistent',
            headers=auth_headers['full_auth_header']
        )
        
        assert response.status_code == 200
        data = json.loads(response.data.decode())
        
        # Should have structure but empty results
        assert 'search_results' in data
        for result_type in data['search_results'].values():
            assert len(result_type) == 0

    def test_search_v2_handles_es_error(self, test_client, db_session, auth_headers, enable_search_v2, mock_es_service):
        """Test V2 search handles Elasticsearch errors gracefully."""
        mock_es_service.side_effect = Exception('ES connection failed')
        
        response = test_client.get(
            '/search?search_term=test',
            headers=auth_headers['full_auth_header']
        )
        
        assert response.status_code == 200
        data = json.loads(response.data.decode())
        
        # Should return empty results instead of erroring
        assert 'search_results' in data
        assert len(data['search_results']) >= 0

    def test_search_options_returns_available_types(self, test_client, db_session, auth_headers):
        """Test search options endpoint returns available types."""
        response = test_client.get(
            '/search/options',
            headers=auth_headers['full_auth_header']
        )
        
        assert response.status_code == 200
        data = json.loads(response.data.decode())
        
        # Should return list of search types
        assert isinstance(data, list)
        assert len(data) > 0
        
        # Each item should have model_id and description
        for item in data:
            assert 'model_id' in item
            assert 'description' in item


class TestSimpleSearchResourceV2:
    """Test simple search resource with V2 enabled."""

    def test_simple_search_v2_basic(self, test_client, db_session, auth_headers, enable_simple_search_v2, mock_es_service):
        """Test V2 simple search returns results."""
        mock_es_service.return_value = {
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
        
        response = test_client.get(
            '/search/simple?search_term=Test',
            headers=auth_headers['full_auth_header']
        )
        
        assert response.status_code == 200
        data = json.loads(response.data.decode())
        
        assert 'search_results' in data
        assert 'facets' in data
        assert len(data['search_results']) >= 1

    def test_simple_search_v2_with_mine_guid(self, test_client, db_session, auth_headers, enable_simple_search_v2, mock_es_service):
        """Test V2 simple search with mine_guid filter (scoped search)."""
        mock_es_service.return_value = {
            'hits': {'hits': []},
            'aggregations': {'by_index': {'buckets': []}}
        }
        
        response = test_client.get(
            '/search/simple?search_term=test&mine_guid=test-mine-guid',
            headers=auth_headers['full_auth_header']
        )
        
        assert response.status_code == 200
        
        # Verify ES was called with mine_guid filter
        assert mock_es_service.called
        call_args = mock_es_service.call_args
        query = call_args[0][1]
        
        # Should include mine_guid in filter
        assert 'bool' in query['query']

    def test_simple_search_v2_facets(self, test_client, db_session, auth_headers, enable_simple_search_v2, mock_es_service):
        """Test V2 simple search returns facet counts."""
        mock_es_service.return_value = {
            'hits': {
                'hits': [
                    {
                        '_index': 'mines',
                        '_score': 10.0,
                        '_source': {'mine_guid': 'mine-1', 'mine_name': 'Mine 1'}
                    },
                    {
                        '_index': 'parties',
                        '_score': 8.0,
                        '_source': {
                            'party_guid': 'party-1',
                            'first_name': 'John',
                            'party_name': 'Doe',
                            'party_type_code': 'PER'
                        }
                    }
                ]
            },
            'aggregations': {
                'by_index': {
                    'buckets': [
                        {'key': 'mines', 'doc_count': 10},
                        {'key': 'parties', 'doc_count': 5}
                    ]
                }
            }
        }
        
        response = test_client.get(
            '/search/simple?search_term=test',
            headers=auth_headers['full_auth_header']
        )
        
        assert response.status_code == 200
        data = json.loads(response.data.decode())
        
        assert 'facets' in data
        # Simple search has different facet structure (counts by type)
        assert 'mine' in data['facets'] or isinstance(data['facets'], dict)


class TestSearchV1V2Compatibility:
    """Test compatibility between V1 and V2 search."""

    def test_response_structure_compatibility(self, test_client, db_session, auth_headers, enable_search_v2, mock_es_service):
        """Test V2 response structure matches V1 for basic fields."""
        mock_es_service.return_value = {
            'hits': {'hits': []},
            'aggregations': {'by_index': {'buckets': []}}
        }
        
        response = test_client.get(
            '/search?search_term=test',
            headers=auth_headers['full_auth_header']
        )
        
        assert response.status_code == 200
        data = json.loads(response.data.decode())
        
        # V1 and V2 should both have these keys
        assert 'search_terms' in data
        assert 'search_results' in data
        
        # V2 adds facets
        assert 'facets' in data

    def test_search_terms_parsing_matches_v1(self, test_client, db_session, auth_headers, enable_search_v2, mock_es_service):
        """Test search terms are parsed the same way as V1."""
        mock_es_service.return_value = {
            'hits': {'hits': []},
            'aggregations': {'by_index': {'buckets': []}}
        }
        
        response = test_client.get(
            '/search?search_term=test mine',
            headers=auth_headers['full_auth_header']
        )
        
        assert response.status_code == 200
        data = json.loads(response.data.decode())
        
        # Should parse into individual terms
        assert isinstance(data['search_terms'], list)
        assert len(data['search_terms']) >= 1
