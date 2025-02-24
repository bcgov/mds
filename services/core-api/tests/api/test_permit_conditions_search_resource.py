import json
from unittest.mock import MagicMock, patch

import pytest
from app.api.search.search.permit_search_service import PermitSearchService


@pytest.fixture
def mock_oauth_session():
    with patch('app.api.search.search.permit_search_service.OAuth2Session') as mock:
        session_instance = MagicMock()
        mock.return_value = session_instance
        session_instance.fetch_token.return_value = {'access_token': 'test_token'}
        yield session_instance

def test_permit_conditions_search_resource_success(test_client, auth_headers, mock_oauth_session):
    test_data = {
        'query': 'test query',
        'filters': {'type': 'permit'}
    }
    
    expected_response = {
        'prompt': "abc123",
        'facets': {
            "mine_name": [{"value": "mine1", "count": 1}],
        },
        'documents': [{
            'id': '1',
            'content': 'test content',
            'meta': {
                "mine_guid": "abc123",
                "mine_name": "mine1",
            },
            'score': 0.5
        }]
    }

    mock_oauth_session.post.return_value.json.return_value = expected_response

    response = test_client.post(
        '/search/permit-conditions',
        json=test_data,
        headers=auth_headers['full_auth_header']
    )
    assert response.status_code == 200
    assert json.loads(response.data.decode()) == expected_response
    mock_oauth_session.post.assert_called_once()

def test_permit_conditions_search_resource_unauthorized(test_client):
    response = test_client.post(
        '/search/permit-conditions',
        json={'query': 'test'},
    )
    assert response.status_code == 401

def test_permit_conditions_search_missing_query(test_client, auth_headers):
    test_data = {
        'filters': {'type': 'permit'}
    }
    
    response = test_client.post(
        '/search/permit-conditions',
        json=test_data,
        headers=auth_headers['full_auth_header']
    )
    assert response.status_code == 400
    assert 'query' in json.loads(response.data.decode())['errors']

def test_permit_conditions_search_invalid_query_type(test_client, auth_headers):
    test_data = {
        'query': 123,  # should be string
        'filters': {'type': 'permit'}
    }
    
    response = test_client.post(
        '/search/permit-conditions',
        json=test_data,
        headers=auth_headers['full_auth_header']
    )
    assert response.status_code == 400
    assert 'query' in json.loads(response.data.decode())['errors']

def test_permit_conditions_search_invalid_filters_type(test_client, auth_headers):
    test_data = {
        'query': 'test query',
        'filters': 'not a dict'  # should be dictionary
    }
    
    response = test_client.post(
        '/search/permit-conditions',
        json=test_data,
        headers=auth_headers['full_auth_header']
    )
    assert response.status_code == 400
    assert 'filters' in json.loads(response.data.decode())['errors']

def test_permit_conditions_search_malformed_json(test_client, auth_headers):
    response = test_client.post(
        '/search/permit-conditions',
        data='{"invalid_json":',
        content_type='application/json',
        headers=auth_headers['full_auth_header']
    )
    assert response.status_code == 400
    assert 'Failed to decode JSON object' in json.loads(response.data.decode())['message']
