import uuid
from unittest.mock import patch, MagicMock

from app.api.mines.work_information.models.mine_work_information import MineWorkInformation
from tests.factories import MineFactory


def _make_work_info(mine=None):
    if mine is None:
        mine = MineFactory()
    work_info = MineWorkInformation(
        mine_work_information_guid=uuid.uuid4(),
        mine_guid=mine.mine_guid,
        work_start_date=None,
        work_stop_date=None,
    )
    work_info.mine = mine
    return work_info


@patch('app.api.email_tracking.email_status_tasks.send_email_task.apply_async')
@patch('app.api.ministry_contacts.models.distribution_list.DistributionList.find_by_name')
def test_send_work_status_update_email_with_distribution_list(mock_find_by_name, mock_apply_async, db_session):
    dl_mock = MagicMock()
    dl_mock.get_emails.return_value = ['work@example.com']
    dl_mock.distribution_list_guid = uuid.uuid4()
    mock_find_by_name.return_value = dl_mock

    mine = MagicMock()
    mine.mine_name = 'Test Mine'
    mine.mine_no = 'M-001'
    mine.mine_guid = uuid.uuid4()
    mine.region.regional_contact_office.email = 'region@example.com'

    work_info = MineWorkInformation(mine_work_information_guid=uuid.uuid4(), mine_guid=mine.mine_guid)
    work_info.mine = mine

    work_info.send_work_status_update_email()

    mock_apply_async.assert_called_once()
    call_kwargs = mock_apply_async.call_args[1]['kwargs']
    assert call_kwargs['distribution_list_guid'] == str(dl_mock.distribution_list_guid)
    assert call_kwargs['reference_table'] == 'mine_work_information'


@patch('app.api.email_tracking.email_status_tasks.send_email_task.apply_async')
@patch('app.api.ministry_contacts.models.distribution_list.DistributionList.find_by_name', return_value=None)
def test_send_work_status_update_email_no_distribution_list(mock_find_by_name, mock_apply_async, db_session):
    mine = MagicMock()
    mine.mine_name = 'Test Mine'
    mine.mine_no = 'M-001'
    mine.mine_guid = uuid.uuid4()
    mine.region.regional_contact_office.email = 'region@example.com'

    work_info = MineWorkInformation(mine_work_information_guid=uuid.uuid4(), mine_guid=mine.mine_guid)
    work_info.mine = mine

    work_info.send_work_status_update_email()

    mock_apply_async.assert_called_once()
    call_kwargs = mock_apply_async.call_args[1]['kwargs']
    assert call_kwargs['distribution_list_guid'] is None
    assert 'region@example.com' in call_kwargs['recipients']
