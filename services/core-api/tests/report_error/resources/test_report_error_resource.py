from unittest.mock import patch

from app.config import Config


ENDPOINT = '/report-error'


def _call_args(mock):
    """The resource calls send_template_email positionally: (subject, recipients, template_path, context)."""
    args, _ = mock.call_args
    subject, recipients, template_path, context = args
    return subject, recipients, template_path, context


@patch('app.api.services.email_service.EmailService.send_template_email')
def test_post_report_error_defaults_and_context(mock_send_template_email, test_client, db_session,
                                                 auth_headers):
    data = {
        'business_error': 'Database connection timeout',
        'trace_id': 'abc123-def456-ghi789',
    }

    resp = test_client.post(ENDPOINT, headers=auth_headers['full_auth_header'], json=data)

    assert resp.status_code == 201
    mock_send_template_email.assert_called_once()

    subject, _recipients, template_path, context = _call_args(mock_send_template_email)

    # Severity defaults to Low and appears in the subject line
    assert '[LOW]' in subject
    assert 'Database connection timeout' in subject

    # Core (non-proponent) users get the core template
    assert template_path == 'email/report_error/core_error_report_email.html'

    assert context['severity'] == 'Low'
    assert context['business_error'] == 'Database connection timeout'
    assert context['trace_id'] == 'abc123-def456-ghi789'
    assert context['description'] == ''
    # seen_before was not provided, so it should be reported as "Not sure"
    assert context['seen_before'] == 'Not sure'


@patch('app.api.services.email_service.EmailService.send_template_email')
def test_post_report_error_with_all_fields(mock_send_template_email, test_client, db_session,
                                            auth_headers):
    data = {
        'business_error': 'Failed to save document',
        'trace_id': 'trace-999',
        'severity': 'High',
        'description': 'I clicked save on the permit form and got an error.',
        'seen_before': True,
    }

    resp = test_client.post(ENDPOINT, headers=auth_headers['full_auth_header'], json=data)

    assert resp.status_code == 201
    subject, _recipients, _template_path, context = _call_args(mock_send_template_email)

    assert '[HIGH]' in subject
    assert context['severity'] == 'High'
    assert context['description'] == 'I clicked save on the permit form and got an error.'
    assert context['seen_before'] == 'Yes'


@patch('app.api.services.email_service.EmailService.send_template_email')
def test_post_report_error_seen_before_false(mock_send_template_email, test_client, db_session,
                                              auth_headers):
    data = {
        'business_error': 'Some error',
        'trace_id': 'trace-000',
        'seen_before': False,
    }

    test_client.post(ENDPOINT, headers=auth_headers['full_auth_header'], json=data)

    _subject, _recipients, _template_path, context = _call_args(mock_send_template_email)
    assert context['seen_before'] == 'No'


@patch('app.api.report_error.resources.report_error_resource.auth.get_user_is_proponent',
      return_value=True)
@patch('app.api.services.email_service.EmailService.send_template_email')
def test_post_report_error_proponent_uses_minespace_template(mock_send_template_email,
                                                              mock_is_proponent, test_client,
                                                              db_session, auth_headers):
    data = {
        'business_error': 'Could not submit report',
        'trace_id': 'trace-111',
    }

    resp = test_client.post(ENDPOINT, headers=auth_headers['full_auth_header'], json=data)

    assert resp.status_code == 201
    _subject, _recipients, template_path, _context = _call_args(mock_send_template_email)
    assert template_path == 'email/report_error/ms_error_report_email.html'


@patch('app.api.services.email_service.EmailService.send_template_email')
def test_post_report_error_builds_observe_logs_link(mock_send_template_email, test_client,
                                                     db_session, auth_headers):
    data = {
        'business_error': 'Some error',
        'trace_id': 'trace-abc',
    }

    test_client.post(ENDPOINT, headers=auth_headers['full_auth_header'], json=data)

    _subject, _recipients, _template_path, context = _call_args(mock_send_template_email)
    observe_logs_link = context['observe_logs_link']

    assert observe_logs_link.startswith(Config.OBSERVE_LOGS_BASE_URL)
    assert f'/ns/{Config.OPENSHIFT_NAMESPACE}/logs' in observe_logs_link
    assert 'trace_id%3Dtrace-abc' in observe_logs_link
    assert Config.OPENSHIFT_NAMESPACE in observe_logs_link


@patch('app.api.services.email_service.EmailService.send_template_email')
def test_post_report_error_builds_observe_logs_link_without_trace_id(mock_send_template_email,
                                                                      test_client, db_session,
                                                                      auth_headers):
    data = {
        'business_error': 'Network timeout',
        'trace_id': '',
    }

    test_client.post(ENDPOINT, headers=auth_headers['full_auth_header'], json=data)

    _subject, _recipients, _template_path, context = _call_args(mock_send_template_email)
    observe_logs_link = context['observe_logs_link']

    assert 'trace_id' not in observe_logs_link
    assert f'/ns/{Config.OPENSHIFT_NAMESPACE}/logs' in observe_logs_link


@patch('app.api.services.email_service.EmailService.send_template_email')
def test_post_report_error_formats_multiline_description(mock_send_template_email, test_client,
                                                          db_session, auth_headers):
    data = {
        'business_error': 'Crash',
        'trace_id': 'trace-1',
        'description': 'Step 1: Open form\n<Step 2>: Click save',
    }

    test_client.post(ENDPOINT, headers=auth_headers['full_auth_header'], json=data)

    _subject, _recipients, _template_path, context = _call_args(mock_send_template_email)
    assert 'Step 1: Open form<br />&lt;Step 2&gt;: Click save' == context['description']


def test_post_report_error_requires_auth(test_client, db_session):
    data = {
        'business_error': 'Some error',
        'trace_id': 'trace-abc',
    }

    resp = test_client.post(ENDPOINT, json=data)

    assert resp.status_code == 401


@patch('app.api.services.email_service.EmailService.send_template_email',
      side_effect=Exception('SMTP relay unreachable'))
def test_post_report_error_email_failure_returns_500(mock_send_template_email, test_client,
                                                      db_session, auth_headers):
    data = {
        'business_error': 'Some error',
        'trace_id': 'trace-abc',
    }

    resp = test_client.post(ENDPOINT, headers=auth_headers['full_auth_header'], json=data)

    assert resp.status_code == 500
