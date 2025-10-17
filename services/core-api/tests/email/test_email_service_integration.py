import pytest
import json
from unittest.mock import patch, MagicMock
from flask import current_app

from app.api.services.email_service import EmailService


@patch('app.api.services.email_service.requests.post')
@patch('app.api.services.email_service.EmailService.get_auth_token')
@patch('app.api.services.email_service.EmailService.perform_health_check')
@patch('app.config.Config.EMAIL_ENABLED', True)
@patch('app.config.Config.ENVIRONMENT_NAME', 'test')
@patch('app.config.Config.EMAIL_RECIPIENT_OVERRIDE', 'test@example.com')
def test_send_template_email_renders_jinja2_templates_correctly(mock_health_check, mock_get_auth_token, mock_post, test_client):
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
def test_minespace_template_renders_with_correct_branding(mock_health_check, mock_get_auth_token, mock_post, test_client):
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
def test_logos_and_brand_colors_injected_automatically(mock_health_check, mock_get_auth_token, mock_post, test_client):
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