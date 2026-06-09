from unittest.mock import patch

from app.api.ministry_contacts.models.distribution_list import DistributionListNames
from tests.factories import MineIncidentFactory


@patch('app.api.services.email_service.EmailService.send_template_email_async')
def test_send_incidents_email(mock_send_async, db_session):
    incident = MineIncidentFactory()
    incident.send_incidents_email()

    assert mock_send_async.call_count == 2
    first_call = mock_send_async.call_args_list[0]
    assert first_call.kwargs['distribution_list'] == DistributionListNames.INCIDENTS
    assert first_call.kwargs['reference_table'] == 'mine_incident'
    assert first_call.kwargs['reference_email_type'] == 'incident_notification'

    second_call = mock_send_async.call_args_list[1]
    assert second_call.kwargs['reference_email_type'] == 'incident_notification_minespace'
    assert 'distribution_list' not in second_call.kwargs or second_call.kwargs.get('distribution_list') is None


@patch('app.api.services.email_service.EmailService.send_template_email')
def test_send_awaiting_final_report_email_proponent(mock_send, db_session):
    incident = MineIncidentFactory()
    incident.send_awaiting_final_report_email(is_prop=True)
    mock_send.assert_called_once()
    args = mock_send.call_args
    assert incident.reported_by_email in args[0][1]


@patch('app.api.services.email_service.EmailService.send_template_email')
def test_send_awaiting_final_report_email_inspector(mock_send, db_session):
    incident = MineIncidentFactory()
    incident.send_awaiting_final_report_email(is_prop=False)
    mock_send.assert_called_once()


@patch('app.api.services.email_service.EmailService.send_template_email')
def test_send_final_report_received_email_proponent(mock_send, db_session):
    incident = MineIncidentFactory()
    incident.send_final_report_received_email(is_prop=True)
    mock_send.assert_called_once()


@patch('app.api.services.email_service.EmailService.send_template_email')
def test_send_final_report_received_email_inspector(mock_send, db_session):
    incident = MineIncidentFactory()
    incident.send_final_report_received_email(is_prop=False)
    mock_send.assert_called_once()
