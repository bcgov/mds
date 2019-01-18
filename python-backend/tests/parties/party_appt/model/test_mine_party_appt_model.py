import pytest

from tests.constants import TEST_PARTY_PER_GUID_1, TEST_MINE_GUID, TEST_MINE_NO
from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointment


# Party Model Class Methods
def test_party_appt_model_find_by_party_guid(test_client, auth_headers):
    mpas = MinePartyAppointment.find_by_party_guid(TEST_PARTY_PER_GUID_1)
    assert all(str(mpa.party_guid) == TEST_PARTY_PER_GUID_1 for mpa in mpas)


def test_party_appt_model_find_by_mine_guid(test_client, auth_headers):
    mpas = MinePartyAppointment.find_by_mine_guid(TEST_MINE_GUID)
    assert all(str(mpa.mine_guid) == TEST_MINE_GUID for mpa in mpas)


def test_party_appt_model_find_by(test_client, auth_headers):
    mine_party_appts = MinePartyAppointment.find_by()
    assert len(mine_party_appts) == MinePartyAppointment.query.count()

def test_mine_party_appt_find_manager_history_by_mine_no(test_client, auth_headers):
    history = MinePartyAppointment.find_manager_history_by_mine_no(TEST_MINE_NO)
    filters = {'mine_guid': TEST_MINE_GUID, 'mine_party_appt_type_code': 'MMG'}
    assert len(history) == MinePartyAppointment.query.filter_by(**filters).count()

def test_mine_party_appt_to_csv(test_client, auth_headers):
    record =  MinePartyAppointment.query.first()
    csv = MinePartyAppointment.to_csv([record], ['processed_by', 'processed_on'])
    second_row = str(record.processed_by)+','+str(record.processed_on)
    assert csv == "processed_by,processed_on\n" + second_row
