import pytest
import uuid

from tests.constants import TEST_PARTY_PER_GUID_1, TEST_MINE_GUID, TEST_MINE_NO, TEST_PERMIT_GUID_1, DUMMY_USER_KWARGS
from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointment
from app.extensions import db


@pytest.fixture(scope="function")
def setup_info(test_client):

    permittee = MinePartyAppointment(
        mine_party_appt_guid=uuid.uuid4(),
        mine_party_appt_type_code='PMT',
        party_guid=uuid.UUID(TEST_PARTY_PER_GUID_1),
        mine_guid=uuid.UUID(TEST_MINE_GUID),
        permit_guid=uuid.UUID(TEST_PERMIT_GUID_1),
        **DUMMY_USER_KWARGS)
    permittee.save()

    yield dict(permittee_guid=permittee.mine_party_appt_guid)

    db.session.delete(permittee)
    db.session.commit()


# Party Model Class Methods
def test_party_appt_model_find_by_party_guid(test_client, setup_info, auth_headers):
    mpas = MinePartyAppointment.find_by_party_guid(TEST_PARTY_PER_GUID_1)
    assert all(str(mpa.party_guid) == TEST_PARTY_PER_GUID_1 for mpa in mpas)


def test_party_appt_model_find_by_mine_guid(test_client, setup_info, auth_headers):
    mpas = MinePartyAppointment.find_by_mine_guid(TEST_MINE_GUID)
    assert all(str(mpa.mine_guid) == TEST_MINE_GUID for mpa in mpas)


def test_party_appt_model_find_by(test_client, setup_info, auth_headers):
    mine_party_appts = MinePartyAppointment.find_by()
    assert len(mine_party_appts) == MinePartyAppointment.query.count()


def test_mine_party_appt_to_csv(test_client, setup_info, auth_headers):
    record = MinePartyAppointment.query.first()
    csv = MinePartyAppointment.to_csv([record], ['processed_by', 'processed_on'])
    second_row = str(record.processed_by) + ',' + str(record.processed_on)
    assert csv == "processed_by,processed_on\n" + second_row
