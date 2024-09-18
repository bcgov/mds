import uuid
from unittest import mock

import pytest
from app.api.mines.permits.permit_extraction.tasks import (
    poll_update_permit_extraction_status,
)
from app.tasks.celery import celery


@pytest.fixture
def permit_search_service_mock():
    with mock.patch('app.api.mines.permits.permit_extraction.tasks.PermitSearchService') as mc:
        yield mc

@pytest.fixture
def create_permit_conditions_mock():
    with mock.patch('app.api.mines.permits.permit_extraction.tasks.create_permit_conditions_from_task') as mc:
        yield mc

@pytest.fixture(scope='module')
def celery_app(request, app):
    celery.conf.update(CELERY_ALWAYS_EAGER=True)
    return app


def test_poll_update_permit_extraction_status_success(permit_search_service_mock, celery_app, test_client, create_permit_conditions_mock, db_session):
    permit_search_service_mock.return_value.update_task_status.return_value = mock.Mock(
        task_status='SUCCESS'
    )

    result = poll_update_permit_extraction_status.apply(args=(str(uuid.uuid4()),)).get()
    create_permit_conditions_mock.assert_called_once()

    assert result.task_status == 'SUCCESS'


def test_poll_update_permit_extraction_status_failure(permit_search_service_mock, celery_app, test_client, create_permit_conditions_mock, db_session):
    permit_search_service_mock.return_value.update_task_status.return_value = mock.Mock(
        task_status='FAILURE'
    )
    result = poll_update_permit_extraction_status.apply(args=(str(uuid.uuid4()),)).get()

    create_permit_conditions_mock.assert_not_called()
    assert result.task_status == 'FAILURE'


def test_poll_update_permit_extraction_status_retry(permit_search_service_mock, celery_app, test_client, create_permit_conditions_mock, db_session):
    permit_search_service_mock.return_value.update_task_status.return_value = mock.Mock(
        task_status='IN_PROGRESS'
    )

    with mock.patch('app.api.mines.permits.permit_extraction.tasks.poll_update_permit_extraction_status.retry') as retry_mock:
        poll_update_permit_extraction_status.apply(args=(str(uuid.uuid4()),)).get()
        retry_mock.assert_called_once_with(countdown=10)
        create_permit_conditions_mock.assert_not_called()