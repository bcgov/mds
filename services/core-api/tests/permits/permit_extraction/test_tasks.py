import uuid
from unittest import mock

import pytest
from app.api.mines.permits.permit_extraction.tasks import (
    initialize_single_permit_extraction,
    poll_update_permit_extraction_status,
)
from app.tasks.celery import celery


@pytest.fixture
def permit_search_service_mock():
    with mock.patch('app.api.mines.permits.permit_extraction.tasks.PermitSearchService') as mc:
        yield mc

@pytest.fixture
def export_and_index_single_permit_amendment_mock():
    with mock.patch('app.api.mines.permits.permit_extraction.tasks.export_and_index_single_permit_amendment') as mc:
        yield mc

@pytest.fixture
def create_permit_conditions_mock():
    with mock.patch('app.api.mines.permits.permit_extraction.tasks.create_permit_conditions_from_task') as mc:
        yield mc

@pytest.fixture
def permit_amendment_document_mock():
    with mock.patch('app.api.mines.permits.permit_amendment.models.permit_amendment_document.PermitAmendmentDocument') as mc:
        yield mc

@pytest.fixture
def permit_amendment_mock():
    with mock.patch('app.api.mines.permits.permit_amendment.models.permit_amendment.PermitAmendment') as mc:
        yield mc

@pytest.fixture(scope='module')
def celery_app(request, app):
    celery.conf.update(CELERY_ALWAYS_EAGER=True)
    return app


def test_poll_update_permit_extraction_status_success(permit_search_service_mock, celery_app, test_client, create_permit_conditions_mock, db_session, export_and_index_single_permit_amendment_mock):
    permit_search_service_mock.return_value.update_task_status.return_value = (mock.Mock(), 'SUCCESS')

    result = poll_update_permit_extraction_status.apply(args=(str(uuid.uuid4()),)).get()
    create_permit_conditions_mock.assert_called_once()

    assert result.task_status == 'SUCCESS'


def test_poll_update_permit_extraction_status_failure(permit_search_service_mock, celery_app, test_client, create_permit_conditions_mock, db_session):
    permit_search_service_mock.return_value.update_task_status.return_value = mock.Mock(), 'FAILURE'
    result = poll_update_permit_extraction_status.apply(args=(str(uuid.uuid4()),)).get()

    create_permit_conditions_mock.assert_not_called()
    assert result.task_status == 'FAILURE'


def test_poll_update_permit_extraction_status_retry(permit_search_service_mock, celery_app, test_client, create_permit_conditions_mock, db_session):
    permit_search_service_mock.return_value.update_task_status.return_value = mock.Mock(), 'IN_PROGRESS'

    with mock.patch('app.api.mines.permits.permit_extraction.tasks.poll_update_permit_extraction_status.retry') as retry_mock:
        poll_update_permit_extraction_status.apply(args=(str(uuid.uuid4()),)).get()
        retry_mock.assert_called_once_with(countdown=10)
        create_permit_conditions_mock.assert_not_called()


def test_initialize_single_permit_extraction_success(permit_search_service_mock, permit_amendment_document_mock, 
                                                    permit_amendment_mock, celery_app, test_client, db_session):
    # Set up mocks for the imported classes
    document_mock = mock.Mock()
    permit_amendment_document_mock.find_by_document_manager_guid.return_value = document_mock
    
    amendment_mock = mock.Mock()
    amendment_mock.conditions = []
    permit_amendment_mock.find_by_permit_amendment_guid.return_value = amendment_mock
    
    task_mock = mock.Mock()
    task_mock.permit_extraction_task_id = str(uuid.uuid4())
    permit_search_service_mock.return_value.initialize_permit_extraction.return_value = task_mock
    
    with mock.patch('app.api.mines.permits.permit_extraction.tasks.poll_update_permit_extraction_status') as poll_mock:
        poll_mock.delay.return_value = mock.Mock(id='test_task_id')
        
        result = initialize_single_permit_extraction('test_document_guid', 'test_amendment_guid')
        
        assert result == task_mock.permit_extraction_task_id
        permit_amendment_document_mock.find_by_document_manager_guid.assert_called_with('test_document_guid')
        permit_amendment_mock.find_by_permit_amendment_guid.assert_called_with('test_amendment_guid')
        permit_search_service_mock.return_value.initialize_permit_extraction.assert_called_with(document_mock, with_internal_auth=True)
        poll_mock.delay.assert_called_with(task_mock.permit_extraction_task_id)
        assert task_mock.core_status_task_id == 'test_task_id'
        task_mock.save.assert_called_once()


def test_initialize_single_permit_extraction_invalid_document(permit_amendment_document_mock, celery_app, test_client, db_session):
    permit_amendment_document_mock.find_by_document_manager_guid.return_value = None
    
    with pytest.raises(ValueError, match="Invalid document test_document_guid"):
        initialize_single_permit_extraction('test_document_guid', 'test_amendment_guid')


def test_initialize_single_permit_extraction_invalid_amendment(permit_amendment_document_mock, permit_amendment_mock, 
                                                             celery_app, test_client, db_session):
    document_mock = mock.Mock()
    permit_amendment_document_mock.find_by_document_manager_guid.return_value = document_mock
    
    permit_amendment_mock.find_by_permit_amendment_guid.return_value = None
    
    with pytest.raises(ValueError, match="Invalid amendment test_amendment_guid"):
        initialize_single_permit_extraction('test_document_guid', 'test_amendment_guid')


def test_initialize_single_permit_extraction_amendment_has_conditions(permit_amendment_document_mock, permit_amendment_mock,
                                                                      celery_app, test_client, db_session):
    document_mock = mock.Mock()
    permit_amendment_document_mock.find_by_document_manager_guid.return_value = document_mock
    
    amendment_mock = mock.Mock()
    amendment_mock.conditions = ['condition1', 'condition2']  # Non-empty conditions list
    permit_amendment_mock.find_by_permit_amendment_guid.return_value = amendment_mock
    
    with pytest.raises(ValueError, match="Amendment test_amendment_guid already has conditions"):
        initialize_single_permit_extraction('test_document_guid', 'test_amendment_guid')


def test_initialize_single_permit_extraction_no_task_created(permit_search_service_mock, permit_amendment_document_mock, 
                                                           permit_amendment_mock, celery_app, test_client, db_session):
    document_mock = mock.Mock()
    permit_amendment_document_mock.find_by_document_manager_guid.return_value = document_mock
    
    amendment_mock = mock.Mock()
    amendment_mock.conditions = []
    permit_amendment_mock.find_by_permit_amendment_guid.return_value = amendment_mock
    
    permit_search_service_mock.return_value.initialize_permit_extraction.return_value = None
    
    result = initialize_single_permit_extraction('test_document_guid', 'test_amendment_guid')
    
    assert result is None
    permit_search_service_mock.return_value.initialize_permit_extraction.assert_called_with(document_mock, with_internal_auth=True)