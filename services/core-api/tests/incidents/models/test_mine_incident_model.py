import uuid
from unittest.mock import patch, MagicMock

from tests.factories import MineIncidentFactory


@patch('app.api.email_tracking.email_status_tasks.send_template_email_task.apply_async')
@patch('app.api.ministry_contacts.models.distribution_list.DistributionList.find_by_name')
def test_send_incidents_email_with_distribution_list(mock_find_by_name, mock_apply_async, db_session):
    dl_mock = MagicMock()
    dl_mock.get_emails.return_value = ['incidents@example.com']
    dl_mock.distribution_list_guid = uuid.uuid4()
    mock_find_by_name.return_value = dl_mock

    incident = MineIncidentFactory()
    incident.send_incidents_email()

    assert mock_apply_async.call_count == 2
    first_call_kwargs = mock_apply_async.call_args_list[0][1]['kwargs']
    assert first_call_kwargs['distribution_list_guid'] == str(dl_mock.distribution_list_guid)
    assert first_call_kwargs['reference_table'] == 'mine_incident'
    assert first_call_kwargs['reference_email_type'] == 'incident_notification'


@patch('app.api.email_tracking.email_status_tasks.send_template_email_task.apply_async')
@patch('app.api.ministry_contacts.models.distribution_list.DistributionList.find_by_name', return_value=None)
def test_send_incidents_email_no_distribution_list(mock_find_by_name, mock_apply_async, db_session):
    incident = MineIncidentFactory()
    incident.send_incidents_email()

    assert mock_apply_async.call_count == 2
    first_call_kwargs = mock_apply_async.call_args_list[0][1]['kwargs']
    assert first_call_kwargs['recipients'] == []
    assert first_call_kwargs['distribution_list_guid'] is None


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
