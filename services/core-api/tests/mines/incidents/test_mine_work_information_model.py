import uuid
from unittest.mock import patch, MagicMock

from app.api.mines.work_information.models.mine_work_information import MineWorkInformation
from app.api.ministry_contacts.models.distribution_list import DistributionListNames
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


@patch('app.api.services.email_service.EmailService.send_email_async')
def test_send_work_status_update_email(mock_send_async, db_session):
    mine = MagicMock()
    mine.mine_name = 'Test Mine'
    mine.mine_no = 'M-001'
    mine.mine_guid = uuid.uuid4()
    mine.region.regional_contact_office.email = 'region@example.com'

    work_info = MineWorkInformation(mine_work_information_guid=uuid.uuid4(), mine_guid=mine.mine_guid)
    work_info.mine = mine

    work_info.send_work_status_update_email()

    mock_send_async.assert_called_once()
    call = mock_send_async.call_args
    assert call.kwargs['distribution_list'] == DistributionListNames.NOTICE_TO_START_STOP_WORK
    assert 'region@example.com' in call.kwargs['recipients']
    assert call.kwargs['reference_table'] == 'mine_work_information'
    assert call.kwargs['reference_email_type'] == 'work_status_update'
