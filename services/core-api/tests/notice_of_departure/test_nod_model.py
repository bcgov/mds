import uuid
from unittest.mock import patch, MagicMock

from tests.factories import NoticeOfDepartureFactory


@patch('app.api.email_tracking.email_status_tasks.send_email_task.apply_async')
@patch('app.api.ministry_contacts.models.distribution_list.DistributionList.find_by_name')
def test_nod_submission_email_with_distribution_list(mock_find_by_name, mock_apply_async, db_session):
    dl_mock = MagicMock()
    dl_mock.get_emails.return_value = ['nod@example.com']
    dl_mock.distribution_list_guid = uuid.uuid4()
    mock_find_by_name.return_value = dl_mock

    nod = NoticeOfDepartureFactory()
    nod.nod_submission_email()

    mock_apply_async.assert_called_once()
    call_kwargs = mock_apply_async.call_args[1]['kwargs']
    assert call_kwargs['distribution_list_guid'] == str(dl_mock.distribution_list_guid)
    assert call_kwargs['reference_table'] == 'notice_of_departure'
    assert call_kwargs['reference_email_type'] == 'nod_submission'


@patch('app.api.email_tracking.email_status_tasks.send_email_task.apply_async')
@patch('app.api.ministry_contacts.models.distribution_list.DistributionList.find_by_name', return_value=None)
def test_nod_submission_email_no_distribution_list(mock_find_by_name, mock_apply_async, db_session):
    nod = NoticeOfDepartureFactory()
    nod.nod_submission_email()

    mock_apply_async.assert_called_once()
    call_kwargs = mock_apply_async.call_args[1]['kwargs']
    assert call_kwargs['recipients'] == []
    assert call_kwargs['distribution_list_guid'] is None
