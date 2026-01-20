"""Tests for search facets extraction."""

import pytest
from app.api.search.search.search_facets import extract_facets


class TestExtractFacets:
    """Test facet extraction from ES aggregations."""

    def test_extract_facets_basic(self):
        aggregations = {
            'by_index': {
                'buckets': [
                    {'key': 'mines', 'doc_count': 10},
                    {'key': 'parties', 'doc_count': 5}
                ]
            }
        }
        
        facets = extract_facets(aggregations)
        
        assert 'type' in facets
        # extract_facets adds predefined values with 0 counts for missing types
        assert len(facets['type']) == 7
        # Find the actual results (non-zero counts)
        mine_facet = next(f for f in facets['type'] if f['key'] == 'mine')
        party_facet = next(f for f in facets['type'] if f['key'] == 'party')
        assert mine_facet == {'key': 'mine', 'count': 10}
        assert party_facet == {'key': 'party', 'count': 5}

    def test_extract_facets_mine_region(self):
        aggregations = {
            'mine_region': {
                'buckets': [
                    {'key': 'SW', 'doc_count': 15},
                    {'key': 'NE', 'doc_count': 8}
                ]
            }
        }
        
        facets = extract_facets(aggregations)
        
        assert 'mine_region' in facets
        assert len(facets['mine_region']) == 2
        assert facets['mine_region'][0] == {'key': 'SW', 'count': 15}

    def test_extract_facets_major_mine_ind(self):
        aggregations = {
            'major_mine_ind': {
                'buckets': [
                    {'key': 1, 'doc_count': 20},
                    {'key': 0, 'doc_count': 30}
                ]
            }
        }
        
        facets = extract_facets(aggregations)
        
        assert 'mine_classification' in facets
        assert len(facets['mine_classification']) == 2
        # key=1 maps to 'Major Mine', key=0 maps to 'Regional Mine'
        assert facets['mine_classification'][0] == {'key': 'Major Mine', 'count': 20}
        assert facets['mine_classification'][1] == {'key': 'Regional Mine', 'count': 30}

    def test_extract_facets_nested_aggregation(self):
        # Nested aggregation uses specific path structure: ['status_codes', 'codes']
        aggregations = {
            'mine_operation_status': {
                'status_codes': {
                    'codes': {
                        'buckets': [
                            {'key': 'OP', 'doc_count': 25},
                            {'key': 'CLD', 'doc_count': 10}
                        ]
                    }
                }
            }
        }
        
        facets = extract_facets(aggregations)
        
        assert 'mine_operation_status' in facets
        assert len(facets['mine_operation_status']) == 2
        assert facets['mine_operation_status'][0] == {'key': 'OP', 'count': 25}
        assert facets['mine_operation_status'][1] == {'key': 'CLD', 'count': 10}

    def test_extract_facets_empty_aggregations(self):
        aggregations = {}
        
        facets = extract_facets(aggregations)
        
        # Should return all expected facet keys
        expected_keys = [
            'mine_region', 'mine_classification', 'mine_operation_status',
            'mine_tenure', 'mine_commodity', 'has_tsf', 'verified_status',
            'permit_status', 'party_type', 'type'
        ]
        
        for key in expected_keys:
            assert key in facets
        
        # Some facets have predefined values with 0 counts
        assert facets['mine_classification'] == [
            {'key': 'Major Mine', 'count': 0},
            {'key': 'Regional Mine', 'count': 0}
        ]
        assert facets['party_type'] == [
            {'key': 'Person', 'count': 0},
            {'key': 'Organization', 'count': 0}
        ]
        assert len(facets['type']) == 7  # All 7 document types with 0 counts
        
        # Others should be empty
        assert facets['mine_region'] == []
        assert facets['permit_status'] == []

    def test_extract_facets_boolean_fields(self):
        # has_tsf uses special count aggregation, not boolean buckets
        aggregations = {
            'has_tsf': {
                'count': {
                    'value': 12
                }
            },
            'by_index': {
                'buckets': [
                    {'key': 'mines', 'doc_count': 100},
                ]
            }
        }
        
        facets = extract_facets(aggregations)
        
        assert 'has_tsf' in facets
        assert len(facets['has_tsf']) == 2
        assert facets['has_tsf'][0] == {'key': 'Has TSF', 'count': 12}
        assert facets['has_tsf'][1] == {'key': 'No TSF', 'count': 88}

    def test_extract_facets_party_type(self):
        aggregations = {
            'party_type': {
                'buckets': [
                    {'key': 'PER', 'doc_count': 50},
                    {'key': 'ORG', 'doc_count': 30}
                ]
            }
        }
        
        facets = extract_facets(aggregations)
        
        assert 'party_type' in facets
        assert len(facets['party_type']) == 2
        # Party types are mapped to display names
        assert facets['party_type'][0] == {'key': 'Person', 'count': 50}
        assert facets['party_type'][1] == {'key': 'Organization', 'count': 30}

    def test_extract_facets_multiple_aggregations(self):
        aggregations = {
            'mine_region': {
                'buckets': [{'key': 'SW', 'doc_count': 10}]
            },
            'permit_status': {
                'buckets': [{'key': 'O', 'doc_count': 5}]
            },
            'major_mine_ind': {
                'buckets': [{'key': 1, 'doc_count': 3}]
            }
        }
        
        facets = extract_facets(aggregations)
        
        assert 'mine_region' in facets
        assert 'permit_status' in facets
        assert 'mine_classification' in facets
        assert len(facets['mine_region']) == 1
        assert len(facets['permit_status']) == 1
        # mine_classification adds predefined values, so we get 2 (Major Mine: 3, Regional Mine: 0)
        assert len(facets['mine_classification']) == 2
        assert facets['mine_classification'][0] == {'key': 'Major Mine', 'count': 3}
        assert facets['mine_classification'][1] == {'key': 'Regional Mine', 'count': 0}
