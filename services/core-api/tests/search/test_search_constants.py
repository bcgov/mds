"""Tests for search constants and mappings."""

import pytest
from app.api.search.search.search_constants import (
    TYPE_TO_INDEX,
    INDEX_TO_TYPE,
    FACET_KEYS,
    FILTER_PARAMS,
    SEARCH_FIELDS,
    ES_AGGREGATIONS,
)


class TestSearchConstants:
    """Test search constant definitions."""

    def test_type_to_index_mapping(self):
        """Test TYPE_TO_INDEX has all expected mappings."""
        expected_types = [
            'mine', 'party', 'permit', 'mine_documents',
            'explosives_permit', 'now_application', 'notice_of_departure'
        ]
        
        for doc_type in expected_types:
            assert doc_type in TYPE_TO_INDEX, f"Missing TYPE_TO_INDEX mapping for {doc_type}"
            assert isinstance(TYPE_TO_INDEX[doc_type], str), f"TYPE_TO_INDEX[{doc_type}] should be a string"

    def test_index_to_type_mapping(self):
        """Test INDEX_TO_TYPE is inverse of TYPE_TO_INDEX."""
        expected_indices = [
            'mines', 'parties', 'mine_permits', 'documents',
            'explosives_permits', 'now_applications', 'notices_of_departure'
        ]
        
        for index in expected_indices:
            assert index in INDEX_TO_TYPE, f"Missing INDEX_TO_TYPE mapping for {index}"

    def test_type_index_mappings_are_inverse(self):
        """Test TYPE_TO_INDEX and INDEX_TO_TYPE are inverses of each other."""
        for doc_type, index in TYPE_TO_INDEX.items():
            assert INDEX_TO_TYPE[index] == doc_type, \
                f"TYPE_TO_INDEX[{doc_type}] = {index} but INDEX_TO_TYPE[{index}] != {doc_type}"

    def test_facet_keys_defined(self):
        """Test FACET_KEYS contains expected facet names."""
        expected_facets = [
            'mine_region', 'mine_classification', 'mine_operation_status',
            'mine_tenure', 'mine_commodity', 'has_tsf', 'verified_status',
            'permit_status', 'party_type', 'type'
        ]
        
        for facet in expected_facets:
            assert facet in FACET_KEYS, f"Missing facet key: {facet}"

    def test_filter_params_defined(self):
        """Test FILTER_PARAMS contains expected filter names."""
        expected_filters = [
            'mine_region', 'mine_classification', 'mine_operation_status',
            'mine_tenure', 'mine_commodity', 'has_tsf', 'verified_status',
            'permit_status', 'is_exploration', 'party_type',
            'explosives_permit_status', 'explosives_permit_closed',
            'nod_type', 'nod_status', 'now_application_status', 'now_type'
        ]
        
        for filter_param in expected_filters:
            assert filter_param in FILTER_PARAMS, f"Missing filter param: {filter_param}"

    def test_search_fields_defined(self):
        """Test SEARCH_FIELDS contains expected searchable fields."""
        # Should have various searchable fields
        assert isinstance(SEARCH_FIELDS, list)
        assert len(SEARCH_FIELDS) > 0
        
        # Should include common fields
        expected_fields = [
            'mine_name', 'mine_no', 'party_name', 'first_name',
            'permit_no', 'document_name'
        ]
        
        for field in expected_fields:
            # Check if field or field with boost is present
            field_present = any(field in search_field for search_field in SEARCH_FIELDS)
            assert field_present, f"Expected search field containing '{field}'"

    def test_es_aggregations_structure(self):
        """Test ES_AGGREGATIONS has proper structure."""
        assert isinstance(ES_AGGREGATIONS, dict)
        assert len(ES_AGGREGATIONS) > 0
        
        # Should have by_index aggregation
        assert 'by_index' in ES_AGGREGATIONS
        assert 'terms' in ES_AGGREGATIONS['by_index']
        
        # Should have mine-related aggregations
        assert 'mine_region' in ES_AGGREGATIONS
        assert 'major_mine_ind' in ES_AGGREGATIONS

    def test_es_aggregations_nested_properly(self):
        """Test nested aggregations have correct structure."""
        # Check nested aggregations
        nested_aggs = [
            'mine_operation_status',
            'mine_tenure_type',
            'mine_commodity_code'
        ]
        
        for agg_name in nested_aggs:
            if agg_name in ES_AGGREGATIONS:
                assert 'nested' in ES_AGGREGATIONS[agg_name], \
                    f"{agg_name} should be a nested aggregation"

    def test_facet_keys_match_aggregations(self):
        """Test FACET_KEYS and ES_AGGREGATIONS are consistent."""
        # Most facet keys should have corresponding aggregations
        # (some may be derived from multiple aggregations)
        core_facets = [
            'mine_region', 'mine_operation_status', 'mine_tenure',
            'mine_commodity', 'has_tsf', 'permit_status'
        ]
        
        for facet in core_facets:
            # Check if there's a related aggregation
            # (may not be exact match due to transformation)
            agg_exists = facet in ES_AGGREGATIONS or \
                        any(facet in agg_name for agg_name in ES_AGGREGATIONS.keys())
            assert agg_exists, f"No aggregation found for facet: {facet}"

    def test_search_fields_have_boosts(self):
        """Test important search fields have boost values."""
        # Important fields should have boost notation (^N)
        boosted_fields = [f for f in SEARCH_FIELDS if '^' in f]
        assert len(boosted_fields) > 0, "Expected some fields to have boost values"

    def test_search_fields_cover_all_types(self):
        """Test search fields cover all searchable entity types."""
        # Should have fields from all major entity types
        field_str = ' '.join(SEARCH_FIELDS)
        
        assert 'mine' in field_str.lower()
        assert 'party' in field_str.lower() or 'name' in field_str.lower()
        assert 'permit' in field_str.lower()
        assert 'document' in field_str.lower()

    def test_type_to_index_no_duplicates(self):
        """Test TYPE_TO_INDEX has no duplicate index names."""
        indices = list(TYPE_TO_INDEX.values())
        assert len(indices) == len(set(indices)), "Duplicate index names found in TYPE_TO_INDEX"

    def test_index_to_type_no_duplicates(self):
        """Test INDEX_TO_TYPE has no duplicate type names."""
        types = list(INDEX_TO_TYPE.values())
        assert len(types) == len(set(types)), "Duplicate type names found in INDEX_TO_TYPE"


class TestSearchConstantsUsage:
    """Test search constants can be used correctly."""

    def test_can_lookup_index_from_type(self):
        """Test looking up ES index from document type."""
        index = TYPE_TO_INDEX['mine']
        assert index == 'mines'
        
        index = TYPE_TO_INDEX['party']
        assert index == 'parties'

    def test_can_lookup_type_from_index(self):
        """Test looking up document type from ES index."""
        doc_type = INDEX_TO_TYPE['mines']
        assert doc_type == 'mine'
        
        doc_type = INDEX_TO_TYPE['parties']
        assert doc_type == 'party'

    def test_can_iterate_facet_keys(self):
        """Test can iterate over FACET_KEYS."""
        count = 0
        for facet_key in FACET_KEYS:
            assert isinstance(facet_key, str)
            count += 1
        
        assert count > 0, "FACET_KEYS should not be empty"

    def test_can_iterate_filter_params(self):
        """Test can iterate over FILTER_PARAMS."""
        count = 0
        for filter_param in FILTER_PARAMS:
            assert isinstance(filter_param, str)
            count += 1
        
        assert count > 0, "FILTER_PARAMS should not be empty"

    def test_can_use_search_fields_in_query(self):
        """Test SEARCH_FIELDS format is valid for ES queries."""
        for field in SEARCH_FIELDS:
            assert isinstance(field, str)
            # Should not have invalid characters
            assert not any(char in field for char in ['<', '>', '{', '}'])
            # If has boost, should be in format field^number
            if '^' in field:
                parts = field.split('^')
                assert len(parts) == 2, f"Invalid boost format: {field}"
                try:
                    float(parts[1])  # Boost should be a number
                except ValueError:
                    pytest.fail(f"Invalid boost value in field: {field}")
