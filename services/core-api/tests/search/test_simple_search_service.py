"""
Unit tests for SimpleSearchService

Tests the business logic layer independently of HTTP/Flask concerns.
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
from app.api.search.search.simple_search_service import SimpleSearchService


class TestSimpleSearchService:
    """Unit tests for SimpleSearchService business logic."""
    
    @pytest.fixture
    def service(self):
        """Create a SimpleSearchService instance."""
        return SimpleSearchService()
    
    # ==================== Index Selection Tests ====================
    
    def test_determine_search_indices_all_types(self, service):
        """Test determining indices when no type filter specified."""
        indices = service._determine_search_indices(None)
        
        assert len(indices) > 0
        assert 'mines' in indices
        assert 'parties' in indices
        assert 'mine_permits' in indices
    
    def test_determine_search_indices_single_type(self, service):
        """Test determining indices with single type filter."""
        indices = service._determine_search_indices(['mine'])
        
        assert len(indices) == 1
        assert 'mines' in indices
    
    def test_determine_search_indices_multiple_types(self, service):
        """Test determining indices with multiple type filters."""
        indices = service._determine_search_indices(['mine', 'permit'])
        
        assert len(indices) == 2
        assert 'mines' in indices
        assert 'mine_permits' in indices
    
    def test_determine_search_indices_empty_types(self, service):
        """Test determining indices with empty type list."""
        indices = service._determine_search_indices([])
        
        assert len(indices) == 0
    
    # ==================== Filter Building Tests ====================
    
    def test_build_base_filters_without_mine_guid(self, app, service):
        """Test building base filters without mine_guid."""
        with app.app_context():
            # Configure app config
            app.config['DELETED_DOCUMENTS_LOOKBACK_MONTHS'] = 12
            
            filters = service._build_base_filters(None)
            
            assert len(filters) == 1
            assert 'bool' in filters[0]  # Deleted filter
    
    def test_build_base_filters_with_mine_guid(self, app, service):
        """Test building base filters with mine_guid."""
        with app.app_context():
            # Configure app config
            app.config['DELETED_DOCUMENTS_LOOKBACK_MONTHS'] = 12
            
            filters = service._build_base_filters('test-guid-123')
            
            assert len(filters) == 2
            assert 'bool' in filters[0]  # Deleted filter
            assert 'bool' in filters[1]  # Mine GUID filter
    
    # ==================== Query Building Tests ====================
    
    def test_build_search_query_wildcard(self, service):
        """Test building wildcard search query."""
        filters = [{'term': {'deleted_ind': False}}]
        query = service._build_search_query('*', filters)
        
        assert 'query' in query
        assert 'match_all' in query['query']['bool']['must'][0]
        assert 'sort' in query
    
    def test_build_search_query_short_term(self, service):
        """Test building query for short search term (< 3 chars)."""
        filters = [{'term': {'deleted_ind': False}}]
        query = service._build_search_query('ab', filters)
        
        assert 'query' in query
        assert 'bool' in query['query']
        assert 'should' in query['query']['bool']
        assert 'phrase_prefix' in str(query)
        assert 'highlight' in query
    
    def test_build_search_query_long_term(self, service):
        """Test building query for long search term (>= 3 chars)."""
        filters = [{'term': {'deleted_ind': False}}]
        query = service._build_search_query('mountain', filters)
        
        assert 'query' in query
        assert 'bool' in query['query']
        assert 'should' in query['query']['bool']
        assert 'fuzziness' in str(query)
        assert 'highlight' in query
    
    def test_build_search_query_without_highlight(self, service):
        """Test building query without highlight configuration."""
        filters = [{'term': {'deleted_ind': False}}]
        query = service._build_search_query('test', filters, include_highlight=False)
        
        assert 'query' in query
        assert 'highlight' not in query
    
    # ==================== GUID Extraction Tests ====================
    
    def test_extract_mine_guid_from_mine(self, service):
        """Test extracting mine_guid from mine document."""
        source = {'mine_guid': 'abc-123', 'mine_name': 'Test Mine'}
        
        guid = service._extract_mine_guid('mine', source)
        
        assert guid == 'abc-123'
    
    def test_extract_mine_guid_from_permit(self, service):
        """Test extracting mine_guid from permit document."""
        source = {'mine_guids': ['def-456', 'ghi-789'], 'permit_no': 'P-001'}
        
        guid = service._extract_mine_guid('permit', source)
        
        assert guid == 'def-456'  # First GUID
    
    def test_extract_mine_guid_from_nod(self, service):
        """Test extracting mine_guid from NOD document."""
        source = {'mine': {'mine_guid': 'jkl-012'}, 'nod_no': 'NOD-001'}
        
        guid = service._extract_mine_guid('notice_of_departure', source)
        
        assert guid == 'jkl-012'
    
    def test_extract_mine_guid_missing(self, service):
        """Test extracting mine_guid when not present."""
        source = {'mine_name': 'Test Mine'}
        
        guid = service._extract_mine_guid('mine', source)
        
        assert guid is None
    
    # ==================== Result Processing Tests ====================
    
    def test_process_mine_result(self, service):
        """Test processing mine search result."""
        source = {
            'mine_name': 'Test Mine',
            'mine_no': 'M-123',
            'mms_alias': 'TM',
            'mine_types': [
                {
                    'mine_type_details': [
                        {'mine_commodity_code': 'Coal'},
                        {'mine_commodity_code': 'Gold'}
                    ]
                }
            ]
        }
        
        result_type, value, description = service._process_mine_result(source)
        
        assert result_type == 'mine'
        assert value == 'Test Mine'
        assert 'M-123' in description
        assert ('Coal' in description or 'Gold' in description)
        assert 'Alias: TM' in description
    
    def test_process_party_result_person(self, service):
        """Test processing person party result."""
        source = {
            'first_name': 'John',
            'party_name': 'Doe',
            'party_type_code': 'PER',
            'email': 'john@example.com',
            'phone_no': '555-1234'
        }
        
        result_type, value, description = service._process_party_result(source)
        
        assert result_type == 'person'
        assert value == 'John Doe'
        assert 'john@example.com' in description
        assert '555-1234' in description
    
    def test_process_party_result_organization(self, service):
        """Test processing organization party result."""
        source = {
            'party_name': 'ACME Corp',
            'party_type_code': 'ORG',
            'email': 'info@acme.com'
        }
        
        result_type, value, description = service._process_party_result(source)
        
        assert result_type == 'organization'
        assert value == 'ACME Corp'
        assert 'info@acme.com' in description
    
    def test_process_permit_result(self, service):
        """Test processing permit search result."""
        source = {
            'permit_no': 'P-001',
            'permit_status_code': 'APP',
            'permittees': [
                {'first_name': 'Jane', 'party_name': 'Smith'}
            ]
        }
        
        result_type, value, description = service._process_permit_result(source)
        
        assert result_type == 'permit'
        assert value == 'P-001'
        assert 'Jane Smith' in description
        assert 'Status: APP' in description
    
    def test_process_nod_result(self, service):
        """Test processing NOD search result."""
        source = {
            'nod_title': 'Test NOD',
            'nod_no': 'NOD-001',
            'nod_status': 'approved',
            'mine': {'mine_name': 'Test Mine'}
        }
        
        result_type, value, description = service._process_nod_result(source)
        
        assert result_type == 'nod'
        assert value == 'Test NOD'
        assert 'NOD-001' in description
        assert 'Test Mine' in description
        assert 'Approved' in description
    
    def test_process_explosives_permit_result(self, service):
        """Test processing explosives permit result."""
        source = {
            'permit_number': 'EP-001',
            'application_status': 'APP',
            'is_closed': False,
            'mine': {'mine_name': 'Test Mine'}
        }
        
        result_type, value, description = service._process_explosives_permit_result(source)
        
        assert result_type == 'explosives_permit'
        assert value == 'EP-001'
        assert 'Test Mine' in description
        assert 'Approved' in description
    
    def test_process_now_application_result(self, service):
        """Test processing NOW application result."""
        source = {
            'now_number': 'NOW-001',
            'application': {
                'property_name': 'Test Property',
                'now_application_status_code': 'AIA'
            },
            'mine': {'mine_name': 'Test Mine'}
        }
        
        result_type, value, description = service._process_now_application_result(source)
        
        assert result_type == 'now_application'
        assert value == 'NOW-001'
        assert 'Test Property' in description
        assert 'Test Mine' in description
        assert 'Approved' in description
    
    # ==================== Group and Rank Tests ====================
    
    def test_group_and_rank_results(self, service):
        """Test grouping and ranking search results."""
        # Create mock SearchResult objects
        result1 = Mock(score=10.0, result={'id': 'id-1', 'value': 'Result 1'})
        result2 = Mock(score=20.0, result={'id': 'id-2', 'value': 'Result 2'})
        result3 = Mock(score=15.0, result={'id': 'id-1', 'value': 'Result 1'})  # Duplicate
        
        search_results = [result1, result2, result3]
        
        ranked = service._group_and_rank_results(search_results)
        
        assert len(ranked) == 2  # Duplicates merged
        assert ranked[0].result['id'] == 'id-1'  # Highest score (10+15=25)
        assert ranked[0].score == 25.0
        assert ranked[1].result['id'] == 'id-2'
        assert ranked[1].score == 20.0
    
    def test_group_and_rank_results_limits_to_4(self, service):
        """Test that ranking limits results to top 4."""
        # Create 6 mock results
        results = [
            Mock(score=float(i), result={'id': f'id-{i}', 'value': f'Result {i}'})
            for i in range(6)
        ]
        
        ranked = service._group_and_rank_results(results)
        
        assert len(ranked) == 4
        assert ranked[0].score == 5.0  # Highest score first
        assert ranked[3].score == 2.0
    
    # ==================== Integration Tests (with mocked ES) ====================
    
    @patch('app.api.search.search.simple_search_service.ElasticSearchService.search')
    def test_execute_search_basic(self, mock_es_search, app, service):
        """Test basic search execution flow."""
        with app.app_context():
            # Mock the search method directly
            mock_es_search.return_value = {
                'hits': {
                    'hits': [
                        {
                            '_index': 'mines',
                            '_score': 10.0,
                            '_source': {
                                'mine_guid': 'test-guid',
                                'mine_name': 'Test Mine',
                                'mine_no': 'M-001',
                                'mine_types': []
                            },
                            'highlight': {}
                        }
                    ]
                },
                'aggregations': {
                    'by_index': {
                        'buckets': [{'key': 'mines', 'doc_count': 1}]
                    }
                }
            }
        
            result = service.execute_search('test', None, None)
            
            assert 'search_terms' in result
            assert 'search_results' in result
            assert 'facets' in result
            assert len(result['search_results']) == 1
            assert result['search_results'][0].result['value'] == 'Test Mine'
    
    @patch('app.api.search.search.simple_search_service.ElasticSearchService.search')
    def test_execute_search_with_mine_guid_filter(self, mock_es_search, app, service):
        """Test search execution with mine_guid filter."""
        with app.app_context():
            mock_es_search.return_value = {
                'hits': {'hits': []},
                'aggregations': {'by_index': {'buckets': []}}
            }
            
            result = service.execute_search('test', None, 'test-mine-guid')
            
            assert 'search_results' in result
            assert 'facets' in result
            # Verify ElasticSearchService was called
            assert mock_es_search.called
    
    @patch('app.api.search.search.simple_search_service.ElasticSearchService.search')
    def test_execute_search_with_type_filter(self, mock_es_search, app, service):
        """Test search execution with type filter."""
        with app.app_context():
            mock_es_search.return_value = {
                'hits': {'hits': []},
                'aggregations': {'by_index': {'buckets': []}}
            }
            
            result = service.execute_search('test', 'mine,permit', None)
            
            assert 'search_results' in result
            assert 'facets' in result
    
    @patch('app.api.search.search.simple_search_service.ElasticSearchService.search')
    def test_execute_search_no_indices(self, mock_es_search, app, service):
        """Test search execution when no indices match."""
        with app.app_context():
            result = service.execute_search('test', 'invalid_type', None)
            
            assert result['search_results'] == []
            assert result['facets'] == {}
            # ES should not be called
            assert not mock_es_search.called
    
    @patch('app.api.search.search.simple_search_service.ElasticSearchService.search')
    def test_execute_search_handles_es_error(self, mock_es_search, app, service):
        """Test that search handles Elasticsearch errors gracefully."""
        with app.app_context():
            # Mock Elasticsearch error
            mock_es_search.side_effect = Exception("ES connection error")
            
            result = service.execute_search('test', None, None)
            
            assert 'search_results' in result
            assert 'facets' in result
            assert len(result['search_results']) == 0  # Empty results on error
    
    # ==================== Edge Cases ====================
    
    def test_process_mine_result_minimal_data(self, service):
        """Test processing mine result with minimal data."""
        source = {'mine_name': 'Test Mine'}
        
        result_type, value, description = service._process_mine_result(source)
        
        assert result_type == 'mine'
        assert value == 'Test Mine'
        assert description == ''  # No additional data
    
    def test_process_party_result_no_first_name(self, service):
        """Test processing party result without first name."""
        source = {
            'party_name': 'Doe',
            'party_type_code': 'PER'
        }
        
        result_type, value, description = service._process_party_result(source)
        
        assert result_type == 'person'
        assert value == 'Doe'
    
    def test_process_permit_result_no_permittees(self, service):
        """Test processing permit result without permittees."""
        source = {
            'permit_no': 'P-001',
            'permittees': []
        }
        
        result_type, value, description = service._process_permit_result(source)
        
        assert result_type == 'permit'
        assert value == 'P-001'
    
    def test_extract_mine_guid_from_permit_empty_list(self, service):
        """Test extracting mine_guid from permit with empty mine_guids list."""
        source = {'mine_guids': [], 'permit_no': 'P-001'}
        
        guid = service._extract_mine_guid('permit', source)
        
        assert guid is None
    
    def test_build_search_query_empty_term(self, service):
        """Test building query with empty search term."""
        filters = [{'term': {'deleted_ind': False}}]
        query = service._build_search_query('', filters)
        
        assert 'match_all' in query['query']['bool']['must'][0]
    
    @patch('app.api.search.search.simple_search_service.ElasticSearchService.search')
    def test_get_facet_counts_no_search_term(self, mock_es_search, app, service):
        """Test getting facet counts with no search term."""
        with app.app_context():
            facets = service._get_facet_counts('')
            
            # Should return empty facets structure
            assert 'mine' in facets
            assert 'person' in facets
            assert all(v == 0 for v in facets.values())
            # ES should not be called
            assert not mock_es_search.called
