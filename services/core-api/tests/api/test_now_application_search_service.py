import json
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import pytest
import requests
from app.api.search.search.now_application_search_service import (
    NowApplicationSearchService,
)


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

def test_search_now_documents_enriches_table_with_presigned_url(mock_oauth_session, mock_oidc_configuration, app):
    with app.app_context():
        now_guid = "test-now-guid"
        search_params = {"query": "test query", "filters": {"type": "report"}}
        
        mock_response = MagicMock()
        mock_response.ok = True
        mock_oauth_session.post.return_value = mock_response

        docman_response = MagicMock()
        docman_response.raise_for_status.return_value = None
        docman_response.content = b'{"url": "https://s3.example.com/presigned"}'
        docman_response.json.return_value = {'url': 'https://s3.example.com/presigned'}
        mock_oidc_configuration.side_effect = [
            MagicMock(json=MagicMock(return_value={'token_endpoint': 'https://example.com/token'})),
            docman_response,
        ]
        
        with patch(
            'app.api.search.search.now_application_search_service.Config.DOCUMENT_MANAGER_URL',
            'https://docman.example.com',
        ), patch(
            'app.api.search.search.now_application_search_service.DocumentManagerService.create_download_token',
            return_value='token-123',
        ), patch(
            'app.api.search.search.now_application_search_service.SSEClient',
            return_value=SimpleNamespace(events=lambda: iter([
                SimpleNamespace(
                    event='documents',
                    data='{"documents": [{"meta": {"artifact_type": "table", "artifact_document_manager_guid": "artifact-guid"}}]}',
                    id=None,
                    retry=None,
                )
            ])),
        ):
            service = NowApplicationSearchService()
            chunks = list(service.search(now_guid, search_params))
        
        payload_line = chunks[0].decode('utf-8').split('\n')[1]
        payload = json.loads(payload_line.replace('data: ', '', 1))
        assert payload['documents'][0]['meta']['artifact_presigned_url'] == 'https://s3.example.com/presigned'
        mock_oauth_session.post.assert_called_once()
        args, kwargs = mock_oauth_session.post.call_args
        assert now_guid in args[0]
        assert kwargs['json'] == {'query': 'test query', 'filters': {'type': 'report'}}


def test_search_now_documents_without_artifact_guid(mock_oauth_session, app):
    with app.app_context():
        now_guid = "test-now-guid"
        search_params = {"query": "test query", "filters": None}

        mock_response = MagicMock()
        mock_response.ok = True
        mock_oauth_session.post.return_value = mock_response

        with patch(
            'app.api.search.search.now_application_search_service.DocumentManagerService.create_download_token'
        ) as mock_token, patch(
            'app.api.search.search.now_application_search_service.SSEClient',
            return_value=SimpleNamespace(events=lambda: iter([
                SimpleNamespace(
                    event='documents',
                    data='{"documents": [{"meta": {"artifact_type": "text"}}]}',
                    id=None,
                    retry=None,
                )
            ])),
        ):
            service = NowApplicationSearchService()
            chunks = list(service.search(now_guid, search_params))

        payload_line = chunks[0].decode('utf-8').split('\n')[1]
        payload = json.loads(payload_line.replace('data: ', '', 1))
        assert 'artifact_presigned_url' not in payload['documents'][0]['meta']
        mock_token.assert_not_called()


def test_search_now_documents_non_table_artifact_is_enriched(mock_oauth_session, mock_oidc_configuration, app):
    with app.app_context():
        now_guid = "test-now-guid"
        search_params = {"query": "test query", "filters": None}

        mock_response = MagicMock()
        mock_response.ok = True
        mock_oauth_session.post.return_value = mock_response

        docman_response = MagicMock()
        docman_response.raise_for_status.return_value = None
        docman_response.content = b'{"url": "https://s3.example.com/presigned"}'
        docman_response.json.return_value = {'url': 'https://s3.example.com/presigned'}
        mock_oidc_configuration.side_effect = [
            MagicMock(json=MagicMock(return_value={'token_endpoint': 'https://example.com/token'})),
            docman_response,
        ]

        with patch(
            'app.api.search.search.now_application_search_service.Config.DOCUMENT_MANAGER_URL',
            'https://docman.example.com',
        ), patch(
            'app.api.search.search.now_application_search_service.DocumentManagerService.create_download_token',
            return_value='token-123',
        ) as mock_token, patch(
            'app.api.search.search.now_application_search_service.SSEClient',
            return_value=SimpleNamespace(events=lambda: iter([
                SimpleNamespace(
                    event='documents',
                    data='{"documents": [{"meta": {"artifact_type": "figure", "artifact_document_manager_guid": "artifact-guid"}}]}',
                    id=None,
                    retry=None,
                )
            ])),
        ):
            service = NowApplicationSearchService()
            chunks = list(service.search(now_guid, search_params))

        payload_line = chunks[0].decode('utf-8').split('\n')[1]
        payload = json.loads(payload_line.replace('data: ', '', 1))
        assert payload['documents'][0]['meta']['artifact_presigned_url'] == 'https://s3.example.com/presigned'
        mock_token.assert_called_once_with('artifact-guid')


def test_search_now_documents_uses_token_url_fallback_when_presigned_lookup_fails(mock_oauth_session, mock_oidc_configuration, app):
    with app.app_context():
        now_guid = "test-now-guid"
        search_params = {"query": "test query", "filters": None}

        mock_response = MagicMock()
        mock_response.ok = True
        mock_oauth_session.post.return_value = mock_response

        failing_docman_response = MagicMock()
        failing_docman_response.raise_for_status.side_effect = requests.RequestException('boom')
        mock_oidc_configuration.side_effect = [
            MagicMock(json=MagicMock(return_value={'token_endpoint': 'https://example.com/token'})),
            failing_docman_response,
        ]

        with patch(
            'app.api.search.search.now_application_search_service.Config.DOCUMENT_MANAGER_URL',
            'https://docman.example.com',
        ), patch(
            'app.api.search.search.now_application_search_service.DocumentManagerService.create_download_token',
            return_value='token-123',
        ), patch(
            'app.api.search.search.now_application_search_service.SSEClient',
            return_value=SimpleNamespace(events=lambda: iter([
                SimpleNamespace(
                    event='documents',
                    data='{"documents": [{"meta": {"artifact_type": "table", "artifact_document_manager_guid": "artifact-guid"}}]}',
                    id=None,
                    retry=None,
                )
            ])),
        ):
            service = NowApplicationSearchService()
            chunks = list(service.search(now_guid, search_params))

        payload_line = chunks[0].decode('utf-8').split('\n')[1]
        payload = json.loads(payload_line.replace('data: ', '', 1))
        assert payload['documents'][0]['meta']['artifact_presigned_url'].endswith('token=token-123')

def test_index_documents_success(mock_oauth_session, app):
    with app.app_context():
        now_guid = "test-now-guid"
        documents = [
            {"document_manager_guid": "doc1", "document_name": "file1.pdf"},
            {"document_manager_guid": "doc2", "document_name": "file2.pdf"}
        ]
        
        mock_oauth_session.post.return_value.status_code = 200
        mock_oauth_session.post.return_value.ok = True

        service = NowApplicationSearchService()
        result = service.index_documents(now_guid, documents)

        assert result == {'status': 'running', 'queued': 2}
        assert mock_oauth_session.post.call_count == 1
        args, kwargs = mock_oauth_session.post.call_args
        assert args[0].endswith(f'/document_search/{now_guid}/index/manifest')
        assert kwargs['json'] == {'documents': documents}

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
