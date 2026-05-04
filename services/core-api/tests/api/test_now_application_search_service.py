import io
from unittest.mock import MagicMock, patch
import pytest
from app.api.search.search.now_application_search_service import NowApplicationSearchService

@pytest.fixture
def mock_oauth_session():
    with patch('app.api.search.search.now_application_search_service.OAuth2Session') as mock:
        session_instance = MagicMock()
        mock.return_value = session_instance
        session_instance.fetch_token.return_value = {'access_token': 'test_token'}
        yield session_instance

@pytest.fixture(autouse=True)
def mock_oidc_configuration():
    with patch('app.api.search.search.now_application_search_service.requests.get') as mock_get:
        response = MagicMock()
        response.raise_for_status.return_value = None
        response.json.return_value = {'token_endpoint': 'https://example.com/token'}
        mock_get.return_value = response
        yield mock_get

def test_search_now_documents(mock_oauth_session, app):
    with app.app_context():
        now_guid = "test-now-guid"
        search_params = {"query": "test query", "filters": {"type": "report"}}
        
        mock_response = MagicMock()
        mock_oauth_session.post.return_value = mock_response
        
        service = NowApplicationSearchService()
        response = service.search(now_guid, search_params)
        
        assert response == mock_response
        mock_oauth_session.post.assert_called_once()
        args, kwargs = mock_oauth_session.post.call_args
        assert now_guid in args[0]
        assert kwargs['json'] == {'query': 'test query', 'filters': {'type': 'report'}}

def test_index_documents_success(mock_oauth_session, app):
    with app.app_context():
        now_guid = "test-now-guid"
        documents = [
            {"document_manager_guid": "doc1", "document_name": "file1.pdf"},
            {"document_manager_guid": "doc2", "document_name": "file2.pdf"}
        ]
        
        mock_oauth_session.post.return_value.status_code = 200
        
        with patch('app.api.services.document_manager_service.DocumentManagerService.download_document_to_file') as mock_download:
            mock_download.return_value = ('test.pdf', io.BytesIO(b"content"))
            
            service = NowApplicationSearchService()
            result = service.index_documents(now_guid, documents)
            
            assert result == {'status': 'running', 'queued': 2}
            assert mock_oauth_session.post.call_count == 2

def test_get_index_status(mock_oauth_session, app):
    with app.app_context():
        now_guid = "test-now-guid"
        expected_status = {"status": "success", "percent": 100}
        
        mock_oauth_session.get.return_value.ok = True
        mock_oauth_session.get.return_value.json.return_value = expected_status
        
        service = NowApplicationSearchService()
        result = service.get_index_status(now_guid)
        
        assert result == expected_status
        mock_oauth_session.get.assert_called_once()

def test_cancel_indexing(mock_oauth_session, app):
    with app.app_context():
        now_guid = "test-now-guid"
        expected_response = {"message": "cancelled"}
        
        mock_oauth_session.delete.return_value.ok = True
        mock_oauth_session.delete.return_value.json.return_value = expected_response
        
        service = NowApplicationSearchService()
        result = service.cancel_indexing(now_guid)
        
        assert result == expected_response
        mock_oauth_session.delete.assert_called_once()
