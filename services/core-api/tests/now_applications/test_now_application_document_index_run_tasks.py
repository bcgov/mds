from datetime import datetime
from unittest import mock

import pytest
from app.api.now_applications.models.now_application_document_index_run import (
    NowApplicationDocumentIndexRun,
)
from app.api.now_applications.tasks import (
    poll_update_now_application_document_index_status,
)
from app.tasks.celery import celery
from tests.now_application_factories import NOWApplicationIdentityFactory


@pytest.fixture
def now_application_search_service_mock():
    with mock.patch('app.api.now_applications.tasks.NowApplicationSearchService') as mc:
        yield mc


@pytest.fixture(scope='module')
def celery_app(request, app):
    celery.conf.update(CELERY_ALWAYS_EAGER=True)
    return app


def _create_run(now_application_guid):
    return NowApplicationDocumentIndexRun.create(
        now_application_guid=now_application_guid,
        status='running',
        last_run_start=datetime.utcnow(),
    )


def test_poll_update_now_application_document_index_status_success(
    now_application_search_service_mock, celery_app, test_client, db_session
):
    now_application_identity = NOWApplicationIdentityFactory()
    run = _create_run(now_application_identity.now_application_guid)

    now_application_search_service_mock.return_value.get_index_status.return_value = {
        'status': 'success',
        'items_processed': 5,
        'error_count': 0,
        'error_message': None,
    }

    result = poll_update_now_application_document_index_status.apply(
        args=(str(run.now_application_document_index_run_id),)
    ).get()

    assert result.status == 'success'
    assert result.items_processed == 5
    assert result.last_run_end is not None


def test_poll_update_now_application_document_index_status_error(
    now_application_search_service_mock, celery_app, test_client, db_session
):
    now_application_identity = NOWApplicationIdentityFactory()
    run = _create_run(now_application_identity.now_application_guid)

    now_application_search_service_mock.return_value.get_index_status.return_value = {
        'status': 'error',
        'items_processed': 1,
        'error_count': 2,
        'error_message': 'boom',
    }

    result = poll_update_now_application_document_index_status.apply(
        args=(str(run.now_application_document_index_run_id),)
    ).get()

    assert result.status == 'error'
    assert result.error_count == 2
    assert result.error_message == 'boom'


def test_poll_update_now_application_document_index_status_retries_while_running(
    now_application_search_service_mock, celery_app, test_client, db_session
):
    now_application_identity = NOWApplicationIdentityFactory()
    run = _create_run(now_application_identity.now_application_guid)

    now_application_search_service_mock.return_value.get_index_status.return_value = {
        'status': 'running',
    }

    with mock.patch(
        'app.api.now_applications.tasks.poll_update_now_application_document_index_status.retry'
    ) as retry_mock:
        poll_update_now_application_document_index_status.apply(
            args=(str(run.now_application_document_index_run_id),)
        ).get()
        retry_mock.assert_called_once_with(countdown=10)

    refreshed = NowApplicationDocumentIndexRun.query.get(run.now_application_document_index_run_id)
    assert refreshed.status == 'running'
    assert refreshed.last_run_end is None


def test_on_failure_finds_run_via_task_args_even_when_core_status_task_id_unset(
    celery_app, test_client, db_session
):
    """
    Regression test: on_failure must locate the run using the run id passed as the
    task's own argument, not by looking up core_status_task_id. The resource sets
    core_status_task_id on the run AFTER poll_update_now_application_document_index_status.delay()
    returns, so if the task fails before that write lands, a lookup by
    core_status_task_id would find nothing.
    """
    now_application_identity = NOWApplicationIdentityFactory()
    run = _create_run(now_application_identity.now_application_guid)
    run_id = str(run.now_application_document_index_run_id)
    assert run.core_status_task_id is None

    poll_update_now_application_document_index_status.on_failure(
        exc=Exception('boom'),
        task_id='some-unrelated-celery-task-id',
        args=(run_id,),
        kwargs={},
        einfo=None,
    )

    refreshed = NowApplicationDocumentIndexRun.query.get(run_id)
    assert refreshed.status == 'error'
    assert refreshed.error_message == 'boom'
    assert refreshed.last_run_end is not None
