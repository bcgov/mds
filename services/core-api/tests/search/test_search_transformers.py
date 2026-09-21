"""Tests for search transformers."""

import pytest
from app.api.search.search.search_transformers import (
    prepare_mine_source,
    prepare_party_source,
    prepare_permit_source,
    prepare_document_source,
    prepare_explosives_permit_source,
    prepare_now_application_source,
    prepare_nod_source,
    transform_es_results,
    PREPARE_FUNCTIONS,
    SEARCH_RESULT_MODELS,
)


class TestPrepareMineSources:
    """Test mine source preparation."""

    def test_prepare_mine_source_basic(self):
        source = {
            'mine_guid': 'test-guid-123',
            'mine_name': 'Test Mine',
            'mine_no': 'M-001',
            'mine_region': 'SW',
            'major_mine_ind': True,
            'mms_alias': 'ALIAS001',
        }
        
        result = prepare_mine_source(source)
        
        assert result['mine_guid'] == 'test-guid-123'
        assert result['mine_name'] == 'Test Mine'
        assert result['mine_no'] == 'M-001'
        assert result['mine_region'] == 'SW'
        assert result['major_mine_ind'] is True

    def test_prepare_mine_source_with_status(self):
        source = {
            'mine_guid': 'test-guid-123',
            'mine_name': 'Test Mine',
            'mine_status': [{
                'status_xref': {
                    'mine_operation_status_code': 'OP'
                }
            }]
        }
        
        result = prepare_mine_source(source)
        
        assert 'mine_status' in result
        assert result['mine_status']['status_labels'] == ['OP']

    def test_prepare_mine_source_with_nested_fields(self):
        source = {
            'mine_guid': 'test-guid-123',
            'mine_types': [{'mine_type_guid': 'type-1'}],
            'tailings_storage_facilities': [{'tsf_guid': 'tsf-1'}],
            'work_information': {'work_start_date': '2024-01-01'},
            'verified_status': {'healthy_ind': True}
        }
        
        result = prepare_mine_source(source)
        
        assert result['mine_type'] == [{'mine_type_guid': 'type-1'}]
        assert result['mine_tailings_storage_facilities'] == [{'tsf_guid': 'tsf-1'}]
        assert result['mine_work_information'] == {'work_start_date': '2024-01-01'}
        assert result['verified_status'] == {'healthy_ind': True}


class TestPreparePartySources:
    """Test party source preparation."""

    def test_prepare_party_source_person(self):
        source = {
            'party_guid': 'party-123',
            'first_name': 'John',
            'party_name': 'Doe',
            'party_type_code': 'PER',
            'email': 'john.doe@example.com',
            'phone_no': '555-1234',
            'party_orgbook_entity': {'registration_id': 'BC123456'}
        }
        
        result = prepare_party_source(source)
        
        assert result['party_guid'] == 'party-123'
        assert result['name'] == 'John Doe'
        assert result['first_name'] == 'John'
        assert result['party_name'] == 'Doe'
        assert result['email'] == 'john.doe@example.com'
        assert result['party_orgbook_entity'] == {'registration_id': 'BC123456'}
        assert result['business_role_appts'] == []
        assert result['address'] == []
    
    def test_prepare_party_source_without_orgbook_entity(self):
        source = {} 

        result = prepare_party_source(source)

        assert result['party_orgbook_entity'] is None


    def test_prepare_party_source_organization(self):
        source = {
            'party_guid': 'party-456',
            'first_name': '',
            'party_name': 'ACME Corporation',
            'party_type_code': 'ORG'
        }
        
        result = prepare_party_source(source)
        
        assert result['name'] == 'ACME Corporation'
        assert result['first_name'] == ''

    def test_prepare_party_source_with_appointments(self):
        source = {
            'party_guid': 'party-123',
            'first_name': 'Jane',
            'party_name': 'Smith',
            'mine_party_appt': [{
                'mine_party_appt_guid': 'appt-123',
                'mine_party_appt_type_code': 'PMT',
                'start_date': '2024-01-01',
                'end_date': None
            }]
        }
        
        result = prepare_party_source(source)
        
        assert len(result['mine_party_appt']) == 1
        appt = result['mine_party_appt'][0]
        assert appt['mine_party_appt_guid'] == 'appt-123'
        assert appt['mine_party_appt_type_code'] == 'PMT'
        assert appt['start_date'] == '2024-01-01'
        assert appt['end_date'] is None
        assert appt['mine'] is None
        assert appt['permit_no'] is None


class TestPreparePermitSources:
    """Test permit source preparation."""

    def test_prepare_permit_source_basic(self):
        source = {
            'permit_guid': 'permit-123',
            'permit_no': 'P-001',
            'permittees': [{
                'first_name': 'John',
                'party_name': 'Doe'
            }],
            'mine_guids': [
                {'mine_guid': 'mine-guid-1', 'mine_name': 'Test Mine One', 'mine_no': 'M-001'},
                {'mine_guid': 'mine-guid-2', 'mine_name': 'Test Mine Two', 'mine_no': 'M-002'}
            ]
        }

        result = prepare_permit_source(source)

        assert result['permit_guid'] == 'permit-123'
        assert result['permit_no'] == 'P-001'
        assert result['current_permittee'] == 'John Doe'
        assert len(result['mine']) == 2
        assert result['mine'][0]['mine_guid'] == 'mine-guid-1'
        assert result['mine'][0]['mine_name'] == 'Test Mine One'
        assert result['mine'][0]['mine_no'] == 'M-001'
        assert result['mine'][1]['mine_guid'] == 'mine-guid-2'
        assert result['mine'][1]['mine_name'] == 'Test Mine Two'
        assert result['mine'][1]['mine_no'] == 'M-002'

    def test_prepare_permit_source_mine_with_missing_name(self):
        source = {
            'permit_guid': 'permit-789',
            'permit_no': 'P-003',
            'mine_guids': [
                {'mine_guid': 'mine-guid-3', 'mine_name': '', 'mine_no': ''}
            ]
        }

        result = prepare_permit_source(source)

        assert len(result['mine']) == 1
        assert result['mine'][0]['mine_guid'] == 'mine-guid-3'
        assert result['mine'][0]['mine_name'] == ''
        assert result['mine'][0]['mine_no'] == ''

    def test_prepare_permit_source_organization_permittee(self):
        source = {
            'permit_guid': 'permit-456',
            'permit_no': 'P-002',
            'permittees': [{
                'first_name': '',
                'party_name': 'Mining Corp'
            }]
        }
        
        result = prepare_permit_source(source)
        
        assert result['current_permittee'] == 'Mining Corp'


class TestPrepareDocumentSources:
    """Test document source preparation."""

    def test_prepare_document_source_with_mine_info(self):
        source = {
            'mine_document_guid': 'doc-123',
            'document_name': 'Test Document.pdf',
            'mine': {
                'mine_name': 'Test Mine',
                'mine_guid': 'mine-123'
            }
        }
        
        result = prepare_document_source(source)
        
        assert result['mine_name'] == 'Test Mine'

    def test_prepare_document_source_without_mine_info(self):
        source = {
            'mine_document_guid': 'doc-123',
            'document_name': 'Test Document.pdf'
        }
        
        result = prepare_document_source(source)
        
        assert result['mine_name'] is None


class TestPrepareExplosivesPermitSources:
    """Test explosives permit source preparation."""

    def test_prepare_explosives_permit_source(self):
        source = {
            'explosives_permit_guid': 'exp-123',
            'application_number': 'APP-001',
            'mine': {
                'mine_name': 'Test Mine'
            }
        }
        
        result = prepare_explosives_permit_source(source)
        
        assert result['mine_name'] == 'Test Mine'


class TestPrepareNowApplicationSources:
    """Test NoW application source preparation."""

    def test_prepare_now_application_source(self):
        source = {
            'now_application_guid': 'now-123',
            'now_number': 'NOW-001',
            'mine': {
                'mine_name': 'Test Mine'
            },
            'application': {
                'now_application_status_code': 'REC',
                'notice_of_work_type_code': 'QIM'
            }
        }
        
        result = prepare_now_application_source(source)
        
        assert result['mine_name'] == 'Test Mine'
        assert result['now_application_status_code'] == 'REC'
        assert result['notice_of_work_type_code'] == 'QIM'


class TestPrepareNodSources:
    """Test NOD source preparation."""

    def test_prepare_nod_source(self):
        source = {
            'nod_guid': 'nod-123',
            'nod_no': 'NOD-001',
            'mine': {
                'mine_name': 'Test Mine'
            }
        }
        
        result = prepare_nod_source(source)
        
        assert result['mine_name'] == 'Test Mine'


class TestTransformESResults:
    """Test ES results transformation."""

    def test_transform_es_results_multiple_types(self):
        hits = [
            {
                '_index': 'mines',
                '_score': 10.5,
                '_source': {
                    'mine_guid': 'mine-123',
                    'mine_name': 'Test Mine',
                    'mine_no': 'M-001'
                }
            },
            {
                '_index': 'parties',
                '_score': 8.3,
                '_source': {
                    'party_guid': 'party-123',
                    'first_name': 'John',
                    'party_name': 'Doe',
                    'party_type_code': 'PER'
                }
            }
        ]
        
        results = transform_es_results(hits)
        
        assert 'mine' in results
        assert 'party' in results
        assert len(results['mine']) == 1
        assert len(results['party']) == 1
        
        mine_result = results['mine'][0]
        assert mine_result['score'] == 10.5
        assert mine_result['type'] == 'mine'
        assert mine_result['result']['mine_name'] == 'Test Mine'
        
        party_result = results['party'][0]
        assert party_result['score'] == 8.3
        assert party_result['type'] == 'party'
        assert party_result['result']['name'] == 'John Doe'

    def test_transform_es_results_unknown_index(self):
        hits = [
            {
                '_index': 'unknown_index',
                '_score': 5.0,
                '_source': {'test': 'data'}
            }
        ]
        
        results = transform_es_results(hits)
        
        assert results == {}

    def test_transform_es_results_skips_malformed_permit_and_preserves_others(self):
        """Regression test for a production incident: a malformed permit
        document (mine_guids as flat GUID strings instead of
        {mine_guid, mine_name, mine_no} objects, caused by an Elasticsearch
        index mapping that drifted out of sync with the current PGSync
        schema) should be skipped without breaking results for other
        documents or types in the same batch.
        """
        hits = [
            {
                '_index': 'mines',
                '_score': 10.0,
                '_source': {'mine_guid': 'mine-1', 'mine_name': 'Good Mine'}
            },
            {
                '_index': 'mine_permits',
                '_score': 9.0,
                '_id': 'bad-permit-guid',
                '_source': {
                    'permit_guid': 'bad-permit-guid',
                    'permit_no': 'BAD-001',
                    # Reproduces the real incident shape: mine_guids as flat
                    # GUID strings instead of objects.
                    'mine_guids': ['41d9de2c-8afd-4fe8-8076-06d28014f484'],
                }
            },
            {
                '_index': 'mine_permits',
                '_score': 8.0,
                '_source': {
                    'permit_guid': 'good-permit-guid',
                    'permit_no': 'GOOD-001',
                    'mine_guids': [
                        {'mine_guid': 'mine-guid-1', 'mine_name': 'Test Mine', 'mine_no': 'M-001'}
                    ]
                }
            }
        ]

        results = transform_es_results(hits)

        # The mine result is untouched by the unrelated permit failure.
        assert len(results['mine']) == 1
        assert results['mine'][0]['result']['mine_name'] == 'Good Mine'

        # Only the well-formed permit made it through; the malformed one
        # was skipped rather than raising and losing the whole batch.
        assert len(results['permit']) == 1
        assert results['permit'][0]['result']['permit_no'] == 'GOOD-001'

    def test_transform_es_results_groups_by_type(self):
        hits = [
            {
                '_index': 'mines',
                '_score': 10.0,
                '_source': {'mine_guid': 'mine-1', 'mine_name': 'Mine 1'}
            },
            {
                '_index': 'mines',
                '_score': 9.0,
                '_source': {'mine_guid': 'mine-2', 'mine_name': 'Mine 2'}
            }
        ]
        
        results = transform_es_results(hits)
        
        assert 'mine' in results
        assert len(results['mine']) == 2
        assert results['mine'][0]['result']['mine_name'] == 'Mine 1'
        assert results['mine'][1]['result']['mine_name'] == 'Mine 2'


class TestTransformerMappings:
    """Test transformer configuration mappings."""

    def test_prepare_functions_has_all_types(self):
        expected_types = [
            'mine', 'party', 'permit', 'mine_documents',
            'explosives_permit', 'now_application', 'notice_of_departure'
        ]
        
        for doc_type in expected_types:
            assert doc_type in PREPARE_FUNCTIONS, f"Missing prepare function for {doc_type}"

    def test_search_result_models_has_all_types(self):
        expected_types = [
            'mine', 'party', 'permit', 'mine_documents',
            'explosives_permit', 'now_application', 'notice_of_departure'
        ]
        
        for doc_type in expected_types:
            assert doc_type in SEARCH_RESULT_MODELS, f"Missing search result model for {doc_type}"

    def test_mappings_are_synchronized(self):
        """Ensure both mappings have the same keys."""
        assert set(PREPARE_FUNCTIONS.keys()) == set(SEARCH_RESULT_MODELS.keys())
