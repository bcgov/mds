"""Tests for search filters."""

import pytest
from app.api.search.search.search_filters import build_filter_clauses


class TestBuildFilterClauses:
    """Test building ES filter clauses from filter parameters."""

    def test_build_filter_clauses_empty_filters(self):
        filters = {
            'mine_region': [],
            'mine_classification': [],
            'permit_status': []
        }
        
        clauses = build_filter_clauses(filters)
        
        # Should always include deleted_ind filter
        assert len(clauses) >= 1
        deleted_filter = next((c for c in clauses if 'bool' in c and 'should' in c['bool']), None)
        assert deleted_filter is not None

    def test_build_filter_clauses_mine_region(self):
        filters = {
            'mine_region': ['SW', 'NE']
        }
        
        clauses = build_filter_clauses(filters)
        
        # Should have region filter
        region_filter = next((c for c in clauses if 'terms' in c and 'mine_region.keyword' in c['terms']), None)
        assert region_filter is not None
        assert set(region_filter['terms']['mine_region.keyword']) == {'SW', 'NE'}

    def test_build_filter_clauses_major_mine(self):
        filters = {
            'mine_classification': ['Major Mine']
        }
        
        clauses = build_filter_clauses(filters)
        
        # Should have major_mine_ind filter set to true (using terms, not term)
        major_mine_filter = next((c for c in clauses if 'terms' in c and 'major_mine_ind' in c['terms']), None)
        assert major_mine_filter is not None
        assert major_mine_filter['terms']['major_mine_ind'] == [True]

    def test_build_filter_clauses_regional_mine(self):
        filters = {
            'mine_classification': ['Regional Mine']
        }
        
        clauses = build_filter_clauses(filters)
        
        # Should have major_mine_ind filter set to false (using terms, not term)
        regional_mine_filter = next((c for c in clauses if 'terms' in c and 'major_mine_ind' in c['terms']), None)
        assert regional_mine_filter is not None
        assert regional_mine_filter['terms']['major_mine_ind'] == [False]

    def test_build_filter_clauses_permit_status(self):
        filters = {
            'permit_status': ['O', 'C']
        }
        
        clauses = build_filter_clauses(filters)
        
        # Should have permit status filter
        permit_filter = next((c for c in clauses if 'terms' in c and 'permit_status_code.keyword' in c['terms']), None)
        assert permit_filter is not None
        assert set(permit_filter['terms']['permit_status_code.keyword']) == {'O', 'C'}

    def test_build_filter_clauses_has_tsf_yes(self):
        filters = {
            'has_tsf': ['Has TSF']  # Uses 'Has TSF' label, not 'Yes'
        }
        
        clauses = build_filter_clauses(filters)
        
        # Should have nested filter with exists for TSF
        tsf_filter = next((c for c in clauses if 'nested' in c and c['nested'].get('path') == 'tailings_storage_facilities'), None)
        assert tsf_filter is not None
        # Check the nested query has an exists clause
        assert 'exists' in tsf_filter['nested']['query']
        assert tsf_filter['nested']['query']['exists']['field'] == 'tailings_storage_facilities.mine_tailings_storage_facility_guid'

    def test_build_filter_clauses_has_tsf_no(self):
        filters = {
            'has_tsf': ['No TSF']  # Uses 'No TSF' label, not 'No'
        }
        
        clauses = build_filter_clauses(filters)
        
        # Should have bool must_not with nested filter
        tsf_filter = next((c for c in clauses if 'bool' in c and 'must_not' in c['bool']), None)
        assert tsf_filter is not None
        # Check that must_not contains a nested filter
        assert 'nested' in tsf_filter['bool']['must_not']
        assert tsf_filter['bool']['must_not']['nested']['path'] == 'tailings_storage_facilities'

    def test_build_filter_clauses_verified_status(self):
        filters = {
            'verified_status': ['Verified']
        }
        
        clauses = build_filter_clauses(filters)
        
        # Should have nested filter for verified status
        verified_filter = next((c for c in clauses if 'nested' in c and c['nested'].get('path') == 'verified_status'), None)
        assert verified_filter is not None

    def test_build_filter_clauses_multiple_filters(self):
        filters = {
            'mine_region': ['SW'],
            'permit_status': ['O'],
            'mine_classification': ['Major Mine']
        }
        
        clauses = build_filter_clauses(filters)
        
        # Should have multiple filters
        assert len(clauses) >= 3

    def test_build_filter_clauses_mine_operation_status(self):
        filters = {
            'mine_operation_status': ['OP', 'CLD']
        }
        
        clauses = build_filter_clauses(filters)
        
        # Should have nested filter for operation status
        op_status_filter = next((c for c in clauses if 'nested' in c and c['nested'].get('path') == 'mine_status'), None)
        assert op_status_filter is not None

    def test_build_filter_clauses_mine_tenure(self):
        filters = {
            'mine_tenure': ['PLR', 'MIN']
        }
        
        clauses = build_filter_clauses(filters)
        
        # Should have nested filter for tenure
        tenure_filter = next((c for c in clauses if 'nested' in c and c['nested'].get('path') == 'mine_types'), None)
        assert tenure_filter is not None

    def test_build_filter_clauses_mine_commodity(self):
        filters = {
            'mine_commodity': ['CU', 'AU']
        }
        
        clauses = build_filter_clauses(filters)
        
        # Should have nested filter for commodity
        commodity_filter = next((c for c in clauses if 'nested' in c), None)
        assert commodity_filter is not None
