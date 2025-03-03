import uuid
from unittest import mock

import pytest
from app.api.mines.permits.permit_conditions.services.permit_condition_comparer import (
    ConditionChangeType,
    ConditionComparison,
)

TEST_MINE_GUID = str(uuid.uuid4())
TEST_PERMIT_GUID = str(uuid.uuid4())
TEST_PERMIT_AMENDMENT_GUID = str(uuid.uuid4())
TEST_PERMIT_CONDITION_GUID = str(uuid.uuid4())

@pytest.fixture
def mine_mock():
    with mock.patch('app.api.mines.permits.permit_amendment.resources.permit_amendment_diff.Mine') as mock_mine:
        yield mock_mine

@pytest.fixture
def permit_mock():
    with mock.patch('app.api.mines.permits.permit_amendment.resources.permit_amendment_diff.Permit') as mock_permit:
        yield mock_permit

@pytest.fixture
def permit_amendment_mock():
    with mock.patch('app.api.mines.permits.permit_amendment.resources.permit_amendment_diff.PermitAmendment') as mock_amendment:
        yield mock_amendment

@pytest.fixture
def permit_conditions_mock():
    with mock.patch('app.api.mines.permits.permit_amendment.resources.permit_amendment_diff.PermitConditions') as mock_conditions:
        yield mock_conditions

@pytest.fixture
def permit_condition_comparer_mock():
    with mock.patch('app.api.mines.permits.permit_amendment.resources.permit_amendment_diff.PermitConditionComparer') as mock_comparer:
        yield mock_comparer

def test_get_diff_not_found_mine(test_client, auth_headers, mine_mock):
    mine_mock.find_by_mine_guid.return_value = None
    
    response = test_client.get(f'/mines/{TEST_MINE_GUID}/permits/{TEST_PERMIT_GUID}/amendments/{TEST_PERMIT_AMENDMENT_GUID}/diff', headers=auth_headers['full_auth_header'])
    assert response.status_code == 404

def test_get_diff_not_found_permit(test_client, auth_headers, mine_mock, permit_mock):
    mine_mock.find_by_mine_guid.return_value = mock.Mock()
    permit_mock.find_by_permit_guid.return_value = None
    
    response = test_client.get(f'/mines/{TEST_MINE_GUID}/permits/{TEST_PERMIT_GUID}/amendments/{TEST_PERMIT_AMENDMENT_GUID}/diff', headers=auth_headers['full_auth_header'])
    assert response.status_code == 404

def test_get_diff_not_found_amendment(test_client, auth_headers, mine_mock, permit_mock, permit_amendment_mock):
    mine_mock.find_by_mine_guid.return_value = mock.Mock()
    permit_mock.find_by_permit_guid.return_value = mock.Mock()
    permit_amendment_mock.find_by_permit_amendment_guid.return_value = None
    
    response = test_client.get(f'/mines/{TEST_MINE_GUID}/permits/{TEST_PERMIT_GUID}/amendments/{TEST_PERMIT_AMENDMENT_GUID}/diff', headers=auth_headers['full_auth_header'])
    assert response.status_code == 404

def test_get_diff_wrong_permit(test_client, auth_headers, mine_mock, permit_mock, permit_amendment_mock):
    mine_mock.find_by_mine_guid.return_value = mock.Mock()
    permit_mock.find_by_permit_guid.return_value = mock.Mock()
    
    amendment = mock.Mock()
    amendment.permit_guid = uuid.uuid4()
    permit_amendment_mock.find_by_permit_amendment_guid.return_value = amendment
    
    response = test_client.get(f'/mines/{TEST_MINE_GUID}/permits/{TEST_PERMIT_GUID}/amendments/{TEST_PERMIT_AMENDMENT_GUID}/diff', headers=auth_headers['full_auth_header'])
    assert response.status_code == 400

def test_get_diff_success(test_client, auth_headers, mine_mock, permit_mock, permit_amendment_mock, permit_condition_comparer_mock):
    mine_mock.find_by_mine_guid.return_value = mock.Mock()
    permit_mock.find_by_permit_guid.return_value = mock.Mock()
    
    amendment = mock.Mock()
    amendment.permit_guid = TEST_PERMIT_GUID
    amendment.permit._all_permit_amendments = [amendment, mock.Mock()]
    permit_amendment_mock.find_by_permit_amendment_guid.return_value = amendment

    comparer = mock.Mock()
    comparer.compare_all_conditions.return_value = [ConditionComparison(
        current_condition=mock.Mock(permit_condition_guid="abc123"),
        previous_condition=mock.Mock(permit_condition_guid="def456"),
        text_similarity=1.0,
        structure_similarity=1.0,
        combined_score=1.0,
        change_type=ConditionChangeType.UNCHANGED
    )]
    permit_condition_comparer_mock.return_value = comparer
    
    response = test_client.get(f'/mines/{TEST_MINE_GUID}/permits/{TEST_PERMIT_GUID}/amendments/{TEST_PERMIT_AMENDMENT_GUID}/diff', headers=auth_headers['full_auth_header'])
    assert response.status_code == 200
    assert response.json['comparison'] == [
        {
            'change_type': 'unchanged',
            'combined_score': 1.0,
            'condition_guid': 'abc123',
            'previous_condition_guid': 'def456',
            'structure_similarity': 1.0,
            'text_similarity': 1.0,
        },
    ]
    
