import json
from unittest.mock import MagicMock, patch

import pytest


@pytest.fixture
def mock_oauth_session():
    with patch('app.api.search.search.permit_search_service.OAuth2Session') as mock:
        session_instance = MagicMock()
        mock.return_value = session_instance
        session_instance.fetch_token.return_value = {'access_token': 'test_token'}
        yield session_instance

@pytest.fixture
def mock_sse_response():
    mock_response = MagicMock()
    
    mock_response.iter_lines.return_value = [
        b'data: {"prompt":"abc123","facets":{"mine_name":[{"value":"mine1","count":1}]},"documents":[]}',
        b'data: {"documents":[{"id":"1","content":"test content","meta":{"mine_guid":"abc123","mine_name":"mine1"},"score":0.5}]}',
        b'data: {"done":true}'
    ]
    return mock_response

def test_permit_conditions_search_resource_success(test_client, auth_headers, mock_oauth_session, mock_sse_response):
    test_data = {
        'query': 'test query',
        'filters': {'type': 'permit'}
    }
    
    mock_oauth_session.post.return_value = mock_sse_response

    response = test_client.post(
        '/search/permit-conditions',
        json=test_data,
        headers=auth_headers['full_auth_header']
    )
    
    assert response.status_code == 200
    assert response.mimetype == "text/event-stream"
    assert response.headers['Cache-Control'] == "no-cache"
    assert response.headers['Connection'] == "keep-alive"

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

def test_permit_conditions_search_sse_format(test_client, auth_headers, mock_oauth_session, mock_sse_response):
    """Test that ensures the SSE format is handled correctly"""
    test_data = {
        'query': 'test query',
        'filters': {'type': 'permit'}
    }
    
    mock_oauth_session.post.return_value = mock_sse_response
    
    response = test_client.post(
        '/search/permit-conditions',
        json=test_data,
        headers=auth_headers['full_auth_header']
    )
    
    assert response.status_code == 200
    assert mock_sse_response.iter_lines.called
