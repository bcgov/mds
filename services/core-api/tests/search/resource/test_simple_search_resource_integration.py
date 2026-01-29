"""
Integration tests for SimpleSearchResource API

Tests the full HTTP request/response cycle including parameter extraction,
service delegation, and response formatting.
"""

import json
import pytest
from unittest.mock import patch, Mock
from tests.factories import MineFactory, PartyFactory


@pytest.fixture
def enable_simple_search_v2():
    """Enable V2 simple search for tests."""
    with patch('app.api.search.search.resources.simple_search.is_feature_enabled') as mock_flag:
        mock_flag.return_value = True
        yield mock_flag


@pytest.fixture
def mock_simple_search_service():
    """Mock SimpleSearchService for integration testing."""
    with patch('app.api.search.search.resources.simple_search.SimpleSearchService') as mock_service_class:
        mock_service = Mock()
        mock_service_class.return_value = mock_service
        yield mock_service


class TestSimpleSearchResourceIntegration:
    """Integration tests for SimpleSearchResource API endpoints."""
    
    # ==================== Basic API Tests ====================
    
    def test_simple_search_endpoint_exists(self, test_client, auth_headers):
        """Test that the simple search endpoint exists."""
        response = test_client.get(
            '/search/simple?search_term=test',
            headers=auth_headers['full_auth_header']
        )
        
        # Should not return 404
        assert response.status_code != 404
    
    def test_simple_search_requires_authentication(self, test_client):
        """Test that simple search requires authentication."""
        response = test_client.get('/search/simple?search_term=test')
        
        # Should return 401 or 403 (depending on auth setup)
        assert response.status_code in [401, 403]
    
    # ==================== V2 API Tests (with service delegation) ====================
    
    def test_simple_search_v2_delegates_to_service(
        self, test_client, db_session, auth_headers, 
        enable_simple_search_v2, mock_simple_search_service
    ):
        """Test that V2 endpoint delegates to SimpleSearchService."""
        # Configure mock service response
        mock_simple_search_service.execute_search.return_value = {
            'search_terms': ['test'],
            'search_results': [],
            'facets': {'mine': 0, 'person': 0, 'organization': 0}
        }
        
        response = test_client.get(
            '/search/simple?search_term=test',
            headers=auth_headers['full_auth_header']
        )
        
        assert response.status_code == 200
        
        # Verify service was called with correct parameters
        mock_simple_search_service.execute_search.assert_called_once_with(
            'test',  # search_term
            None,    # search_types
            None     # mine_guid
        )
    
    def test_simple_search_v2_with_all_parameters(
        self, test_client, db_session, auth_headers,
        enable_simple_search_v2, mock_simple_search_service
    ):
        """Test V2 endpoint with all query parameters."""
        mock_simple_search_service.execute_search.return_value = {
            'search_terms': ['mountain'],
            'search_results': [],
            'facets': {}
        }
        
        response = test_client.get(
            '/search/simple?search_term=mountain&search_types=mine,permit&mine_guid=abc-123',
            headers=auth_headers['full_auth_header']
        )
        
        assert response.status_code == 200
        
        # Verify all parameters were passed to service
        mock_simple_search_service.execute_search.assert_called_once_with(
            'mountain',      # search_term
            'mine,permit',   # search_types
            'abc-123'        # mine_guid
        )
    
    def test_simple_search_v2_returns_correct_response_format(
        self, test_client, db_session, auth_headers,
        enable_simple_search_v2, mock_simple_search_service
    ):
        """Test that V2 endpoint returns correctly formatted response."""
        # Mock service response with sample data
        mock_result = Mock()
        mock_result.score = 10.0
        mock_result.type = 'mine'
        mock_result.result = {
            'id': 'mine-123',
            'value': 'Test Mine',
            'description': 'Mine #: M-001',
            'highlight': None,
            'mine_guid': 'mine-123'
        }
        
        mock_simple_search_service.execute_search.return_value = {
            'search_terms': ['test'],
            'search_results': [mock_result],
            'facets': {
                'mine': 1,
                'person': 0,
                'organization': 0,
                'permit': 0,
                'nod': 0,
                'explosives_permit': 0,
                'now_application': 0,
                'mine_documents': 0,
                'permit_documents': 0
            }
        }
        
        response = test_client.get(
            '/search/simple?search_term=test',
            headers=auth_headers['full_auth_header']
        )
        
        assert response.status_code == 200
        data = json.loads(response.data.decode())
        
        # Verify response structure
        assert 'search_terms' in data
        assert 'search_results' in data
        assert 'facets' in data
        
        assert data['search_terms'] == ['test']
        assert len(data['search_results']) == 1
        assert data['facets']['mine'] == 1
    
    # ==================== Query Parameter Tests ====================
    
    def test_simple_search_with_wildcard(
        self, test_client, db_session, auth_headers,
        enable_simple_search_v2, mock_simple_search_service
    ):
        """Test search with wildcard (*) search term."""
        mock_simple_search_service.execute_search.return_value = {
            'search_terms': [],
            'search_results': [],
            'facets': {}
        }
        
        response = test_client.get(
            '/search/simple?search_term=*',
            headers=auth_headers['full_auth_header']
        )
        
        assert response.status_code == 200
        mock_simple_search_service.execute_search.assert_called_once()
    
    def test_simple_search_with_empty_search_term(
        self, test_client, db_session, auth_headers,
        enable_simple_search_v2, mock_simple_search_service
    ):
        """Test search with empty search term."""
        mock_simple_search_service.execute_search.return_value = {
            'search_terms': [],
            'search_results': [],
            'facets': {}
        }
        
        response = test_client.get(
            '/search/simple?search_term=',
            headers=auth_headers['full_auth_header']
        )
        
        assert response.status_code == 200
    
    def test_simple_search_with_special_characters(
        self, test_client, db_session, auth_headers,
        enable_simple_search_v2, mock_simple_search_service
    ):
        """Test search with special characters in search term."""
        mock_simple_search_service.execute_search.return_value = {
            'search_terms': [],
            'search_results': [],
            'facets': {}
        }
        
        response = test_client.get(
            '/search/simple?search_term=test&special',
            headers=auth_headers['full_auth_header']
        )
        
        assert response.status_code == 200
    
    def test_simple_search_with_unicode_characters(
        self, test_client, db_session, auth_headers,
        enable_simple_search_v2, mock_simple_search_service
    ):
        """Test search with unicode characters."""
        mock_simple_search_service.execute_search.return_value = {
            'search_terms': [],
            'search_results': [],
            'facets': {}
        }
        
        response = test_client.get(
            '/search/simple?search_term=café',
            headers=auth_headers['full_auth_header']
        )
        
        assert response.status_code == 200
    
    # ==================== Type Filter Tests ====================
    
    def test_simple_search_with_single_type_filter(
        self, test_client, db_session, auth_headers,
        enable_simple_search_v2, mock_simple_search_service
    ):
        """Test search with single type filter."""
        mock_simple_search_service.execute_search.return_value = {
            'search_terms': ['test'],
            'search_results': [],
            'facets': {}
        }
        
        response = test_client.get(
            '/search/simple?search_term=test&search_types=mine',
            headers=auth_headers['full_auth_header']
        )
        
        assert response.status_code == 200
        mock_simple_search_service.execute_search.assert_called_with('test', 'mine', None)
    
    def test_simple_search_with_multiple_type_filters(
        self, test_client, db_session, auth_headers,
        enable_simple_search_v2, mock_simple_search_service
    ):
        """Test search with multiple type filters."""
        mock_simple_search_service.execute_search.return_value = {
            'search_terms': ['test'],
            'search_results': [],
            'facets': {}
        }
        
        response = test_client.get(
            '/search/simple?search_term=test&search_types=mine,permit,person',
            headers=auth_headers['full_auth_header']
        )
        
        assert response.status_code == 200
        mock_simple_search_service.execute_search.assert_called_with(
            'test', 'mine,permit,person', None
        )
    
    # ==================== Mine GUID Scoping Tests ====================
    
    def test_simple_search_with_mine_guid(
        self, test_client, db_session, auth_headers,
        enable_simple_search_v2, mock_simple_search_service
    ):
        """Test mine-scoped search."""
        mock_simple_search_service.execute_search.return_value = {
            'search_terms': ['permit'],
            'search_results': [],
            'facets': {}
        }
        
        response = test_client.get(
            '/search/simple?search_term=permit&mine_guid=test-mine-guid-123',
            headers=auth_headers['full_auth_header']
        )
        
        assert response.status_code == 200
        mock_simple_search_service.execute_search.assert_called_with(
            'permit', None, 'test-mine-guid-123'
        )
    
    def test_simple_search_with_mine_guid_and_types(
        self, test_client, db_session, auth_headers,
        enable_simple_search_v2, mock_simple_search_service
    ):
        """Test mine-scoped search with type filter."""
        mock_simple_search_service.execute_search.return_value = {
            'search_terms': [],
            'search_results': [],
            'facets': {}
        }
        
        response = test_client.get(
            '/search/simple?search_term=*&mine_guid=abc-123&search_types=permit',
            headers=auth_headers['full_auth_header']
        )
        
        assert response.status_code == 200
        mock_simple_search_service.execute_search.assert_called_with(
            '*', 'permit', 'abc-123'
        )
    
    # ==================== Error Handling Tests ====================
    
    def test_simple_search_handles_service_error(
        self, test_client, db_session, auth_headers,
        enable_simple_search_v2, mock_simple_search_service
    ):
        """Test that API handles service errors gracefully."""
        # Mock service error
        mock_simple_search_service.execute_search.side_effect = Exception("Service error")
        
        response = test_client.get(
            '/search/simple?search_term=test',
            headers=auth_headers['full_auth_header']
        )
        
        # Should handle error gracefully (might return 500 or empty results depending on implementation)
        assert response.status_code in [200, 500]
    
    def test_simple_search_with_missing_search_term(
        self, test_client, db_session, auth_headers,
        enable_simple_search_v2, mock_simple_search_service
    ):
        """Test search without search_term parameter."""
        mock_simple_search_service.execute_search.return_value = {
            'search_terms': [],
            'search_results': [],
            'facets': {}
        }
        
        response = test_client.get(
            '/search/simple',
            headers=auth_headers['full_auth_header']
        )
        
        assert response.status_code == 200
        # Should call service with None
        mock_simple_search_service.execute_search.assert_called_with(None, None, None)
    
    # ==================== Response Format Tests ====================
    
    def test_simple_search_response_has_required_fields(
        self, test_client, db_session, auth_headers,
        enable_simple_search_v2, mock_simple_search_service
    ):
        """Test that response contains all required fields."""
        mock_simple_search_service.execute_search.return_value = {
            'search_terms': ['test'],
            'search_results': [],
            'facets': {
                'mine': 0,
                'person': 0,
                'organization': 0,
                'permit': 0,
                'nod': 0,
                'explosives_permit': 0,
                'now_application': 0
            }
        }
        
        response = test_client.get(
            '/search/simple?search_term=test',
            headers=auth_headers['full_auth_header']
        )
        
        assert response.status_code == 200
        data = json.loads(response.data.decode())
        
        # V2 should have search_terms, search_results, and facets
        assert 'search_terms' in data
        assert 'search_results' in data
        assert 'facets' in data
        
        # Facets should have at least the basic types
        facet_keys = data['facets'].keys()
        basic_types = [
            'mine', 'person', 'organization', 'permit', 
            'nod', 'explosives_permit', 'now_application'
        ]
        for basic_type in basic_types:
            assert basic_type in facet_keys
    
    def test_simple_search_result_structure(
        self, test_client, db_session, auth_headers,
        enable_simple_search_v2, mock_simple_search_service
    ):
        """Test the structure of individual search results."""
        mock_result = Mock()
        mock_result.score = 15.5
        mock_result.type = 'mine'
        mock_result.result = {
            'id': 'mine-123',
            'value': 'Test Mine',
            'description': 'Mine #: M-001 | Coal',
            'highlight': '<mark>Test</mark> Mine',
            'mine_guid': 'mine-123'
        }
        
        mock_simple_search_service.execute_search.return_value = {
            'search_terms': ['test'],
            'search_results': [mock_result],
            'facets': {}
        }
        
        response = test_client.get(
            '/search/simple?search_term=test',
            headers=auth_headers['full_auth_header']
        )
        
        assert response.status_code == 200
        data = json.loads(response.data.decode())
        
        result = data['search_results'][0]
        # Verify result structure (depends on marshalling)
        assert 'id' in result or 'result' in result
    
    # ==================== Performance Tests ====================
    
    def test_simple_search_response_time(
        self, test_client, db_session, auth_headers,
        enable_simple_search_v2, mock_simple_search_service
    ):
        """Test that search responds within reasonable time."""
        import time
        
        mock_simple_search_service.execute_search.return_value = {
            'search_terms': ['test'],
            'search_results': [],
            'facets': {}
        }
        
        start_time = time.time()
        response = test_client.get(
            '/search/simple?search_term=test',
            headers=auth_headers['full_auth_header']
        )
        end_time = time.time()
        
        assert response.status_code == 200
        # Should respond within 5 seconds (with mocked service this should be very fast)
        assert (end_time - start_time) < 5.0
    
    # ==================== V1 Backward Compatibility Tests ====================
    
    def test_simple_search_v1_still_works(
        self, test_client, db_session, auth_headers
    ):
        """Test that V1 endpoint still works when feature flag is off."""
        with patch('app.api.search.search.resources.simple_search.is_feature_enabled') as mock_flag:
            mock_flag.return_value = False  # V1 mode
            
            response = test_client.get(
                '/search/simple?search_term=test',
                headers=auth_headers['full_auth_header']
            )
            
            assert response.status_code == 200
            data = json.loads(response.data.decode())
            
            # V1 should have search_terms and search_results
            assert 'search_terms' in data
            assert 'search_results' in data
            # V1 might not have facets
    
    # ==================== Edge Cases ====================
    
    def test_simple_search_with_very_long_search_term(
        self, test_client, db_session, auth_headers,
        enable_simple_search_v2, mock_simple_search_service
    ):
        """Test search with very long search term."""
        long_term = 'a' * 500
        mock_simple_search_service.execute_search.return_value = {
            'search_terms': [],
            'search_results': [],
            'facets': {}
        }
        
        response = test_client.get(
            f'/search/simple?search_term={long_term}',
            headers=auth_headers['full_auth_header']
        )
        
        assert response.status_code == 200
    
    def test_simple_search_with_many_type_filters(
        self, test_client, db_session, auth_headers,
        enable_simple_search_v2, mock_simple_search_service
    ):
        """Test search with all possible type filters."""
        all_types = 'mine,person,organization,permit,nod,explosives_permit,now_application'
        mock_simple_search_service.execute_search.return_value = {
            'search_terms': ['test'],
            'search_results': [],
            'facets': {}
        }
        
        response = test_client.get(
            f'/search/simple?search_term=test&search_types={all_types}',
            headers=auth_headers['full_auth_header']
        )
        
        assert response.status_code == 200
        mock_simple_search_service.execute_search.assert_called_with('test', all_types, None)
    
    def test_simple_search_with_invalid_type_filter(
        self, test_client, db_session, auth_headers,
        enable_simple_search_v2, mock_simple_search_service
    ):
        """Test search with invalid type filter."""
        mock_simple_search_service.execute_search.return_value = {
            'search_terms': ['test'],
            'search_results': [],
            'facets': {}
        }
        
        response = test_client.get(
            '/search/simple?search_term=test&search_types=invalid_type',
            headers=auth_headers['full_auth_header']
        )
        
        # Should handle gracefully
        assert response.status_code == 200
