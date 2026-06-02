import pytest
import json
import uuid
from unittest.mock import patch, MagicMock
from flask import current_app

from app.api.services.email_service import EmailService


@patch('app.api.services.email_service.requests.post')
@patch('app.api.services.email_service.EmailService.get_auth_token')
@patch('app.api.services.email_service.EmailService.perform_health_check')
@patch('app.config.Config.EMAIL_ENABLED', True)
@patch('app.config.Config.ENVIRONMENT_NAME', 'test')
@patch('app.config.Config.EMAIL_RECIPIENT_OVERRIDE', 'test@example.com')
@patch('app.config.Config.USE_LOCAL_MAILPIT', False)
def test_send_template_email_renders_jinja2_templates_correctly(mock_health_check, mock_get_auth_token, mock_post, test_client, db_session):
    # Mock the HTTP response
    mock_response = MagicMock()
    mock_response.status_code = 201  # requests.codes.created
    mock_response.json.return_value = {'messageId': 'test-message-id'}
    mock_post.return_value = mock_response
    mock_get_auth_token.return_value = 'fake-token'
    
    # Test data for error report template
    context = {
        'reporter': {
            'name': 'John Developer',
            'email': 'john.developer@gov.bc.ca'
        },
        'reported_date': '2024-09-29 14:30:00',
        'environment': 'Test Environment',
        'business_error': 'Database connection timeout',
        'trace_id': 'abc123-def456-ghi789',
        'kibana_link': 'https://kibana.example.com/trace/abc123'
    }
    
    # Use template path (simplified EmailService behavior)
    template_path = 'email/report_error/core_error_report_email.html'
    
    with current_app.app_context():
        EmailService.send_template_email(
            subject='Test Error Report',
            recipients=['test@example.com'],
            template_path=template_path,
            context=context
        )
    
    # Verify the HTTP request was made
    mock_post.assert_called_once()
    
    # Get the call arguments and check the rendered body
    call_args = mock_post.call_args
    request_data = json.loads(call_args[0][1])  # JSON data that was posted
    rendered_body = request_data['body']
    
    # Verify the template was rendered properly
    assert 'Error Reported in Test Environment' in rendered_body
    assert 'John Developer' in rendered_body
    assert 'Database connection timeout' in rendered_body
    assert '#6B6363' in rendered_body  # Core text color should be present
    assert 'data:image/' in rendered_body  # Logo should be injected as base64


@patch('app.api.services.email_service.requests.post')
@patch('app.api.services.email_service.EmailService.get_auth_token')
@patch('app.api.services.email_service.EmailService.perform_health_check')
@patch('app.config.Config.EMAIL_ENABLED', True)
@patch('app.config.Config.ENVIRONMENT_NAME', 'test')
@patch('app.config.Config.EMAIL_RECIPIENT_OVERRIDE', 'test@example.com')
@patch('app.config.Config.USE_LOCAL_MAILPIT', False)
def test_minespace_template_renders_with_correct_branding(mock_health_check, mock_get_auth_token, mock_post, test_client, db_session):
    # Mock the HTTP response
    mock_response = MagicMock()
    mock_response.status_code = 201
    mock_response.json.return_value = {'messageId': 'test-message-id'}
    mock_post.return_value = mock_response
    mock_get_auth_token.return_value = 'fake-token'
    
    # Test data for Minespace template
    context = {
        'report_submision': {  # Note: keeping original typo for compatibility
            'mine_name': 'Highland Valley Copper',
            'mine_number': 'HVC001',
            'report_name': 'Annual Environmental Report',
            'report_compliance_year': '2024',
            'report_due_date': '2024-12-31',
            'report_recieved_date': '2024-09-29'
        },
        'minespace_login_link': 'https://minespace.gov.bc.ca/login'
    }
    
    # Use Minespace template path
    template_path = 'email/report/ms_new_report_submitted_email.html'
    
    with current_app.app_context():
        EmailService.send_template_email(
            subject='Report Submitted',
            recipients=['test@example.com'],
            template_path=template_path,
            context=context
        )
    
    mock_post.assert_called_once()
    call_args = mock_post.call_args
    request_data = json.loads(call_args[0][1])  # JSON data that was posted
    rendered_body = request_data['body']
    
    # Verify Minespace branding
    assert '#003366' in rendered_body  # Minespace brand color
    assert 'Highland Valley Copper' in rendered_body
    assert 'Your report has been successfully submitted' in rendered_body


@patch('app.api.services.email_service.requests.post')
@patch('app.api.services.email_service.EmailService.get_auth_token')
@patch('app.api.services.email_service.EmailService.perform_health_check')
@patch('app.config.Config.EMAIL_ENABLED', True)
@patch('app.config.Config.ENVIRONMENT_NAME', 'test')
@patch('app.config.Config.EMAIL_RECIPIENT_OVERRIDE', 'test@example.com')
@patch('app.config.Config.USE_LOCAL_MAILPIT', False)
def test_logos_and_brand_colors_injected_automatically(mock_health_check, mock_get_auth_token, mock_post, test_client, db_session):
    # Mock the HTTP response
    mock_response = MagicMock()
    mock_response.status_code = 201
    mock_response.json.return_value = {'messageId': 'test-message-id'}
    mock_post.return_value = mock_response
    mock_get_auth_token.return_value = 'fake-token'
    
    # Proper context matching the template's expected structure
    context = {
        'message': 'Test message',
        'mine': {
            'mine_name': 'Test Mine',
            'mine_no': 'TEST001'
        },
        'project_summary': {
            'project_summary_description': 'Test project description for mining operations'
        },
        'core_project_summary_link': 'https://core.gov.bc.ca/projects/123'
    }
    
    template_path = 'email/projects/ministry_project_summary_email.html'
    
    with current_app.app_context():
        EmailService.send_template_email(
            subject='Test Project',
            recipients=['test@example.com'],
            template_path=template_path,
            context=context
        )
    
    mock_post.assert_called_once()
    call_args = mock_post.call_args
    request_data = json.loads(call_args[0][1])  # JSON data that was posted
    rendered_body = request_data['body']
    
    # Verify all logos were injected and used
    assert 'data:image/' in rendered_body  # Base64 image data should be present
    assert 'Test Mine' in rendered_body
    assert 'Test project description' in rendered_body
    assert '#6B6363' in rendered_body  # Core text color for ministry templates


# _validate_and_prepare_send

def test_validate_and_prepare_send_invalid_body_type(test_client, db_session):
    with pytest.raises(Exception, match='body type is invalid'):
        EmailService._validate_and_prepare_send('invalid', 'utf-8', 'normal', ['a@b.com'], [], [])


def test_validate_and_prepare_send_invalid_encoding(test_client, db_session):
    with pytest.raises(Exception, match='encoding is invalid'):
        EmailService._validate_and_prepare_send('html', 'invalid', 'normal', ['a@b.com'], [], [])


def test_validate_and_prepare_send_invalid_priority(test_client, db_session):
    with pytest.raises(Exception, match='priority is invalid'):
        EmailService._validate_and_prepare_send('html', 'utf-8', 'urgent', ['a@b.com'], [], [])


@patch('app.config.Config.EMAIL_ENABLED', False)
@patch('app.config.Config.USE_LOCAL_MAILPIT', False)
def test_validate_and_prepare_send_emails_disabled(test_client, db_session):
    result = EmailService._validate_and_prepare_send('html', 'utf-8', 'normal', ['a@b.com'], [], [])
    assert result is None


@patch('app.config.Config.EMAIL_ENABLED', True)
@patch('app.config.Config.ENVIRONMENT_NAME', 'test')
@patch('app.config.Config.EMAIL_RECIPIENT_OVERRIDE', '')
@patch('app.config.Config.USE_LOCAL_MAILPIT', False)
def test_validate_and_prepare_send_no_override_in_non_prod(test_client, db_session):
    result = EmailService._validate_and_prepare_send('html', 'utf-8', 'normal', ['a@b.com'], [], [])
    assert result is None


@patch('app.config.Config.EMAIL_ENABLED', True)
@patch('app.config.Config.ENVIRONMENT_NAME', 'test')
@patch('app.config.Config.EMAIL_RECIPIENT_OVERRIDE', 'override@example.com')
@patch('app.config.Config.USE_LOCAL_MAILPIT', False)
def test_validate_and_prepare_send_no_recipients(test_client, db_session):
    result = EmailService._validate_and_prepare_send('html', 'utf-8', 'normal', [], [], [])
    assert result is None


@patch('app.config.Config.EMAIL_ENABLED', True)
@patch('app.config.Config.ENVIRONMENT_NAME', 'prod')
@patch('app.config.Config.EMAIL_RECIPIENT_OVERRIDE', '')
@patch('app.config.Config.USE_LOCAL_MAILPIT', False)
def test_validate_and_prepare_send_prod_returns_prepared(test_client, db_session):
    result = EmailService._validate_and_prepare_send('html', 'utf-8', 'normal', ['a@b.com'], ['cc@b.com'], [])
    assert result is not None
    is_not_prod, original_recipients, recipients, cc, bcc = result
    assert is_not_prod is False
    assert original_recipients == ['a@b.com']


# _create_tracking_records_for_recipients

def test_create_tracking_records_empty_recipients(test_client, db_session):
    from app.api.email_tracking.models.email_tracking import RecipientType
    records = EmailService._create_tracking_records_for_recipients(
        [], RecipientType.primary,
        {'reference_id': None, 'reference_table': None, 'email_template_name': None,
         'reference_email_type': None, 'email_subject': 'Test', 'distribution_list_guid': None}
    )
    assert records == []


def test_create_tracking_records_filters_none_emails(test_client, db_session):
    from app.api.email_tracking.models.email_tracking import RecipientType
    records = EmailService._create_tracking_records_for_recipients(
        [None, '', 'valid@example.com'], RecipientType.primary,
        {'reference_id': None, 'reference_table': None, 'email_template_name': None,
         'reference_email_type': None, 'email_subject': 'Test', 'distribution_list_guid': None}
    )
    assert len(records) == 1
    assert records[0].recipient_email == 'valid@example.com'


def test_create_tracking_records_multiple(test_client, db_session):
    from app.api.email_tracking.models.email_tracking import RecipientType
    records = EmailService._create_tracking_records_for_recipients(
        ['a@example.com', 'b@example.com'], RecipientType.cc,
        {'reference_id': None, 'reference_table': None, 'email_template_name': None,
         'reference_email_type': None, 'email_subject': 'Test', 'distribution_list_guid': None}
    )
    assert len(records) == 2
    for r in records:
        assert r.recipient_type == RecipientType.cc


# get_ches_email_status

@patch('app.api.services.email_service.EmailService.get_auth_token', return_value=None)
def test_get_ches_email_status_no_auth_token(mock_auth, test_client, db_session):
    result = EmailService.get_ches_email_status(str(uuid.uuid4()))
    assert result['status'] == 'error'
    assert 'authenticate' in result['message']


@patch('app.api.services.email_service.requests.get')
@patch('app.api.services.email_service.EmailService.get_auth_token', return_value='fake-token')
def test_get_ches_email_status_404(mock_auth, mock_get, test_client, db_session):
    mock_response = MagicMock()
    mock_response.status_code = 404
    mock_get.return_value = mock_response

    result = EmailService.get_ches_email_status(str(uuid.uuid4()))
    assert result['status'] == 'not_found'


@patch('app.api.services.email_service.requests.get')
@patch('app.api.services.email_service.EmailService.get_auth_token', return_value='fake-token')
def test_get_ches_email_status_non_200(mock_auth, mock_get, test_client, db_session):
    mock_response = MagicMock()
    mock_response.status_code = 500
    mock_get.return_value = mock_response

    result = EmailService.get_ches_email_status(str(uuid.uuid4()))
    assert result['status'] == 'error'


@patch('app.api.services.email_service.requests.get')
@patch('app.api.services.email_service.EmailService.get_auth_token', return_value='fake-token')
def test_get_ches_email_status_completed(mock_auth, mock_get, test_client, db_session):
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        'status': 'completed',
        'updatedTS': 1700000000000,
        'smtpResponse': None
    }
    mock_get.return_value = mock_response

    result = EmailService.get_ches_email_status(str(uuid.uuid4()))
    assert result['status'] == 'success'
    assert result['ches_status'] == 'completed'


@patch('app.api.services.email_service.requests.get')
@patch('app.api.services.email_service.EmailService.get_auth_token', return_value='fake-token')
def test_get_ches_email_status_unknown(mock_auth, mock_get, test_client, db_session):
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {'status': 'weird_status', 'updatedTS': None, 'smtpResponse': None}
    mock_get.return_value = mock_response

    result = EmailService.get_ches_email_status(str(uuid.uuid4()))
    assert result['status'] == 'unknown_status'


# _handle_successful_email_response

def test_handle_successful_email_response_updates_tracking(test_client, db_session):
    tracking = MagicMock()
    resp_data = {'txId': 'tx-123', 'messages': [{'msgId': 'msg-456'}]}
    EmailService._handle_successful_email_response(resp_data, [tracking])
    tracking.mark_as_sent.assert_called_once_with(ches_message_id='msg-456', ches_transaction_id='tx-123')


def test_handle_successful_email_response_empty_messages(test_client, db_session):
    tracking = MagicMock()
    resp_data = {'txId': 'tx-123', 'messages': []}
    EmailService._handle_successful_email_response(resp_data, [tracking])
    tracking.mark_as_sent.assert_not_called()


# _send_via_mailpit

@patch('app.api.services.email_service.EmailService._handle_successful_email_response')
@patch('app.api.services.email_service.smtplib.SMTP')
@patch('app.config.Config.MAILPIT_HOST', 'localhost')
@patch('app.config.Config.MAILPIT_PORT', 1025)
def test_send_via_mailpit_success(mock_smtp, mock_handle, test_client, db_session):
    mock_server = MagicMock()
    mock_smtp.return_value.__enter__ = MagicMock(return_value=mock_server)
    mock_smtp.return_value.__exit__ = MagicMock(return_value=False)

    tracking = MagicMock()
    EmailService._send_via_mailpit(
        subject='Test', sender='from@test.com', recipients=['to@test.com'],
        cc=[], bcc=[], body='<p>Hi</p>', body_type='html',
        tracking_records=[tracking]
    )
    mock_handle.assert_called_once()


@patch('app.api.services.email_service.smtplib.SMTP', side_effect=Exception('connection refused'))
@patch('app.config.Config.MAILPIT_HOST', 'localhost')
@patch('app.config.Config.MAILPIT_PORT', 1025)
def test_send_via_mailpit_failure_marks_tracking_failed(mock_smtp, test_client, db_session):
    tracking = MagicMock()
    EmailService._send_via_mailpit(
        subject='Test', sender='from@test.com', recipients=['to@test.com'],
        cc=[], bcc=[], body='<p>Hi</p>', body_type='html',
        tracking_records=[tracking]
    )
    tracking.mark_as_failed.assert_called_once()


# send_email disabled/no recipients guards

@patch('app.config.Config.EMAIL_ENABLED', False)
@patch('app.config.Config.USE_LOCAL_MAILPIT', False)
def test_send_email_disabled_returns_early(test_client, db_session):
    with patch.object(EmailService, 'perform_health_check') as mock_health:
        EmailService.send_email(subject='Test', recipients=['a@b.com'], body='body')
        mock_health.assert_not_called()


@patch('app.config.Config.EMAIL_ENABLED', True)
@patch('app.config.Config.ENVIRONMENT_NAME', 'test')
@patch('app.config.Config.EMAIL_RECIPIENT_OVERRIDE', 'override@example.com')
@patch('app.config.Config.USE_LOCAL_MAILPIT', False)
def test_send_email_no_recipients_returns_early(test_client, db_session):
    with patch.object(EmailService, 'perform_health_check') as mock_health:
        EmailService.send_email(subject='Test', recipients=[], cc=[], bcc=[], body='body')
        mock_health.assert_not_called()