from unittest.mock import patch, MagicMock
import uuid

from tests.factories import MineFactory, MineTailingsStorageFacilityFactory, MinePartyAppointmentFactory
from app.api.mines.tailings.models.tailings import MineTailingsStorageFacility


def test_mine_tailings_find_by_tsf_guid(db_session):
    tsf_guid = MineTailingsStorageFacilityFactory().mine_tailings_storage_facility_guid

    tsf = MineTailingsStorageFacility.find_by_tsf_guid(str(tsf_guid))
    assert tsf.mine_tailings_storage_facility_guid == tsf_guid


def test_mine_tailings_find_by_mine_guid(db_session):
    batch_size = 2
    mine_guid = MineFactory(mine_tailings_storage_facilities=batch_size).mine_guid

    mine_tsfs = MineTailingsStorageFacility.find_by_mine_guid(str(mine_guid))
    assert len(mine_tsfs) == batch_size
    assert all(tsf.mine_guid == mine_guid for tsf in mine_tsfs)

def test_mine_tailings_save_draft(db_session):
    tsf = MineTailingsStorageFacilityFactory()
    tsf.save_draft()

    assert tsf.is_draft == True

def test_mine_tailings_submit(db_session):
    mine = MineFactory()
    tsf = MineTailingsStorageFacilityFactory(mine=mine)
    
    tsf.save_draft()

    eor = MinePartyAppointmentFactory(mine=mine, mine_party_appt_type_code='EOR', mine_tailings_storage_facility=tsf)
    qp = MinePartyAppointmentFactory(mine=mine, mine_party_appt_type_code='TQP', mine_tailings_storage_facility=tsf)
    
    eor.save_draft()
    qp.save_draft()

    assert eor.is_draft == True
    assert qp.is_draft == True

    tsf.submit()

    assert tsf.is_draft == False
    assert eor.is_draft == False
    assert qp.is_draft == False


@patch('app.api.email_tracking.email_status_tasks.send_email_task.apply_async')
@patch('app.api.ministry_contacts.models.distribution_list.DistributionList.find_by_name')
def test_send_email_tsf_update_with_distribution_list(mock_find_by_name, mock_apply_async, db_session):
    dl_mock = MagicMock()
    dl_mock.get_emails.return_value = ['tsf@example.com']
    dl_mock.distribution_list_guid = uuid.uuid4()
    mock_find_by_name.return_value = dl_mock

    tsf = MineTailingsStorageFacilityFactory()
    tsf.send_email_tsf_update()

    mock_apply_async.assert_called_once()
    call_kwargs = mock_apply_async.call_args[1]['kwargs']
    assert call_kwargs['distribution_list_guid'] == str(dl_mock.distribution_list_guid)
    assert call_kwargs['reference_table'] == 'mine_tailings_storage_facility'


@patch('app.api.email_tracking.email_status_tasks.send_email_task.apply_async')
@patch('app.api.ministry_contacts.models.distribution_list.DistributionList.find_by_name', return_value=None)
def test_send_email_tsf_update_no_distribution_list(mock_find_by_name, mock_apply_async, db_session):
    tsf = MineTailingsStorageFacilityFactory()
    tsf.send_email_tsf_update()

    mock_apply_async.assert_called_once()
    call_kwargs = mock_apply_async.call_args[1]['kwargs']
    assert call_kwargs['recipients'] == []
    assert call_kwargs['distribution_list_guid'] is None
