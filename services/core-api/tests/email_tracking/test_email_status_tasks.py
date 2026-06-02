import pytest
import uuid
from datetime import datetime, timezone
from unittest.mock import patch, MagicMock

from app.api.email_tracking.models.email_tracking import EmailStatus


# send_email_task 

@patch('app.api.email_tracking.email_status_tasks.EmailService.send_email')
def test_send_email_task_success(mock_send_email, test_client, db_session):
    from app.api.email_tracking.email_status_tasks import send_email_task
    result = send_email_task.apply(kwargs={
        'subject': 'Test Subject',
        'recipients': ['test@example.com'],
        'body': '<p>Test body</p>',
    }).get()
    mock_send_email.assert_called_once()
    assert result == {'status': 'success'}


@patch('app.api.email_tracking.email_status_tasks.EmailService.send_email', side_effect=Exception('send failed'))
def test_send_email_task_retries_on_failure(mock_send_email, test_client, db_session):
    from app.api.email_tracking.email_status_tasks import send_email_task
    with pytest.raises(Exception):
        send_email_task.apply(kwargs={
            'subject': 'Test Subject',
            'recipients': ['test@example.com'],
            'body': '<p>Test body</p>',
        }).get()


# send_template_email_task

@patch('app.api.email_tracking.email_status_tasks.EmailService.send_template_email')
def test_send_template_email_task_success(mock_send, test_client, db_session):
    from app.api.email_tracking.email_status_tasks import send_template_email_task
    result = send_template_email_task.apply(kwargs={
        'subject': 'Template Test',
        'recipients': ['test@example.com'],
        'template_path': 'email/report_error/core_error_report_email.html',
        'context': {},
    }).get()
    mock_send.assert_called_once()
    assert result == {'status': 'success'}


@patch('app.api.email_tracking.email_status_tasks.EmailService.send_template_email', side_effect=Exception('template failed'))
def test_send_template_email_task_retries_on_failure(mock_send, test_client, db_session):
    from app.api.email_tracking.email_status_tasks import send_template_email_task
    with pytest.raises(Exception):
        send_template_email_task.apply(kwargs={
            'subject': 'Template Test',
            'recipients': ['test@example.com'],
            'template_path': 'email/report_error/core_error_report_email.html',
            'context': {},
        }).get()


# poll_ches_email_status

@patch('app.api.email_tracking.email_status_tasks.EmailTracking.find_by_ches_message_id', return_value=None)
def test_poll_ches_status_tracking_record_not_found(mock_find, test_client, db_session):
    from app.api.email_tracking.email_status_tasks import poll_ches_email_status
    result = poll_ches_email_status.apply(args=[str(uuid.uuid4())]).get()
    assert result['status'] == 'error'
    assert 'not found' in result['message']


@patch('app.api.email_tracking.email_status_tasks.EmailTracking.find_by_ches_message_id')
def test_poll_ches_status_already_in_final_state(mock_find, test_client, db_session):
    tracking = MagicMock()
    tracking.email_status = EmailStatus.completed
    mock_find.return_value = tracking

    from app.api.email_tracking.email_status_tasks import poll_ches_email_status
    result = poll_ches_email_status.apply(args=[str(uuid.uuid4())]).get()
    assert result['status'] == 'complete'


@patch('app.api.email_tracking.email_status_tasks.EmailService.get_ches_email_status')
@patch('app.api.email_tracking.email_status_tasks.EmailTracking.find_by_ches_message_id')
def test_poll_ches_status_not_found_response(mock_find, mock_get_status, test_client, db_session):
    tracking = MagicMock()
    tracking.email_status = EmailStatus.sent
    mock_find.return_value = tracking
    mock_get_status.return_value = {'status': 'not_found', 'message': 'Message not found in CHES'}

    from app.api.email_tracking.email_status_tasks import poll_ches_email_status
    result = poll_ches_email_status.apply(args=[str(uuid.uuid4())]).get()
    assert result['status'] == 'not_found'


@patch('app.api.email_tracking.email_status_tasks.EmailService.get_ches_email_status')
@patch('app.api.email_tracking.email_status_tasks.EmailTracking.find_by_ches_message_id')
def test_poll_ches_status_unknown_status(mock_find, mock_get_status, test_client, db_session):
    tracking = MagicMock()
    tracking.email_status = EmailStatus.sent
    mock_find.return_value = tracking
    mock_get_status.return_value = {'status': 'unknown_status', 'message': 'Unknown CHES status: weird'}

    from app.api.email_tracking.email_status_tasks import poll_ches_email_status
    result = poll_ches_email_status.apply(args=[str(uuid.uuid4())]).get()
    assert result['status'] == 'unknown_status'


@patch('app.api.email_tracking.email_status_tasks.EmailService.get_ches_email_status')
@patch('app.api.email_tracking.email_status_tasks.EmailTracking.find_by_ches_message_id')
def test_poll_ches_status_completed(mock_find, mock_get_status, test_client, db_session):
    tracking = MagicMock()
    tracking.email_status = EmailStatus.sent
    mock_find.return_value = tracking
    mock_get_status.return_value = {
        'status': 'success',
        'ches_status': 'completed',
        'email_status': EmailStatus.completed,
        'ches_data': {},
        'updated_timestamp': int(datetime.now(timezone.utc).timestamp() * 1000),
        'message': 'completed',
    }

    from app.api.email_tracking.email_status_tasks import poll_ches_email_status
    result = poll_ches_email_status.apply(args=[str(uuid.uuid4())]).get()
    assert result['status'] == 'success'
    tracking.mark_as_delivered.assert_called_once()


@patch('app.api.email_tracking.email_status_tasks.EmailService.get_ches_email_status')
@patch('app.api.email_tracking.email_status_tasks.EmailTracking.find_by_ches_message_id')
def test_poll_ches_status_failed(mock_find, mock_get_status, test_client, db_session):
    tracking = MagicMock()
    tracking.email_status = EmailStatus.sent
    mock_find.return_value = tracking
    mock_get_status.return_value = {
        'status': 'success',
        'ches_status': 'failed',
        'email_status': EmailStatus.failed,
        'ches_data': {'smtpResponse': {'response': '550 rejected'}},
        'updated_timestamp': 1000000000000,
        'message': 'failed',
    }

    from app.api.email_tracking.email_status_tasks import poll_ches_email_status
    result = poll_ches_email_status.apply(args=[str(uuid.uuid4())]).get()
    assert result['status'] == 'success'
    tracking.mark_as_failed.assert_called_once()


@patch('app.api.email_tracking.email_status_tasks.EmailService.get_ches_email_status')
@patch('app.api.email_tracking.email_status_tasks.EmailTracking.find_by_ches_message_id')
def test_poll_ches_status_accepted(mock_find, mock_get_status, test_client, db_session):
    tracking = MagicMock()
    tracking.email_status = EmailStatus.sent
    mock_find.return_value = tracking
    mock_get_status.return_value = {
        'status': 'success',
        'ches_status': 'accepted',
        'email_status': EmailStatus.accepted,
        'ches_data': {},
        'updated_timestamp': None,
        'message': 'accepted',
    }

    from app.api.email_tracking.email_status_tasks import poll_ches_email_status
    # accepted → schedules retry; calling with retries=0 so it will attempt retry
    with pytest.raises(Exception):
        poll_ches_email_status.apply(args=[str(uuid.uuid4())]).get()


@patch('app.api.email_tracking.email_status_tasks.EmailService.get_ches_email_status')
@patch('app.api.email_tracking.email_status_tasks.EmailTracking.find_by_ches_message_id')
def test_poll_ches_status_no_change(mock_find, mock_get_status, test_client, db_session):
    tracking = MagicMock()
    tracking.email_status = EmailStatus.completed
    mock_find.return_value = tracking

    from app.api.email_tracking.email_status_tasks import poll_ches_email_status
    result = poll_ches_email_status.apply(args=[str(uuid.uuid4())]).get()
    assert result['status'] == 'complete'
    mock_get_status.assert_not_called()
