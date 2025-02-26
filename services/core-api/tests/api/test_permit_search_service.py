import json
import tempfile
from unittest.mock import MagicMock, patch

import pytest
from app.api.mines.permits.permit_amendment.models import permit_amendment
from app.api.mines.permits.permit_extraction.models.permit_extraction_task import (
    PermitExtractionTask,
)
from app.api.search.search.permit_search_service import PermitSearchService
from tests.factories import PermitAmendmentDocumentFactory, create_mine_and_permit


@pytest.fixture
def mock_oauth_session():
    with patch('app.api.search.search.permit_search_service.OAuth2Session') as mock:
        session_instance = MagicMock()
        mock.return_value = session_instance
        session_instance.fetch_token.return_value = {'access_token': 'test_token'}
        yield session_instance

def test_permit_search_success(mock_oauth_session):
    search_term = {'query': 'test', 'filters': {'type': 'permit'}}
    expected_response = {'total': 1, 'results': [{'id': '1'}]}
    
    mock_oauth_session.post.return_value.json.return_value = expected_response
    
    service = PermitSearchService()
    result = service.search(search_term)
    
    assert result == expected_response
    mock_oauth_session.post.assert_called_once()

def test_initialize_permit_extraction(mock_oauth_session, test_client, db_session):
    _, permit = create_mine_and_permit()

    doc = PermitAmendmentDocumentFactory(permit_amendment=permit.permit_amendments[0])
    expected_response = {
        'id': '698569db-ede6-4ec8-9562-c049e2cc0948',
        'status': 'PENDING',
        'meta': {'pages': 5}
    }
    
    mock_oauth_session.post.return_value.status_code = 200
    mock_oauth_session.post.return_value.json.return_value = expected_response
    
    with patch('app.api.services.document_manager_service.DocumentManagerService.download_document_to_file') as mock_download:
        mock_download.return_value = ('test.pdf', tempfile.NamedTemporaryFile())
        
        service = PermitSearchService()
        task = service.initialize_permit_extraction(doc)
        
        assert isinstance(task, PermitExtractionTask)
        assert task.task_id == '698569db-ede6-4ec8-9562-c049e2cc0948'
        assert task.task_status == 'PENDING'
        assert task.task_meta == {'pages': 5}

def test_update_task_status(mock_oauth_session, test_client, db_session):
    _, permit = create_mine_and_permit()

    doc = PermitAmendmentDocumentFactory(permit_amendment=permit.permit_amendments[0])

    task = PermitExtractionTask(
        permit_amendment_guid=permit.permit_amendments[0].permit_amendment_guid,
        permit_extraction_task_id='1ad38bc1-b58c-49ef-8559-075aa79d718c',
        permit_amendment_document_guid=doc.permit_amendment_document_guid,
        task_id='698569db-ede6-4ec8-9562-c049e2cc0948',
        task_status='PENDING'
    )

    db_session.add(task)
    db_session.flush()


    status_response = {
        'status': 'SUCCESS',
        'meta': {'pages': 5}
    }
    results_response = {
        'conditions': [{
            'text': 'Sample condition',
            'page': 1
        }]
    }

    mock_oauth_session.get.side_effect = [
        MagicMock(status_code=200, json=lambda: status_response),
        MagicMock(status_code=200, json=lambda: results_response)
    ]

    service = PermitSearchService()
    updated_task, status = service.update_task_status(task.permit_extraction_task_id)

    assert status == 'SUCCESS'
    assert updated_task.task_result == results_response
    assert updated_task.meta == {'pages': 5}
