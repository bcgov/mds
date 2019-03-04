import pytest
import uuid

from tests.constants import TEST_PARTY_PER_GUID_1, TEST_MINE_GUID, TEST_PERMIT_GUID_1, DUMMY_USER_KWARGS
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

    yield dict(permittee_guid=str(permittee.mine_party_appt_guid))

    db.session.delete(permittee)
    db.session.commit()


# Permit Model Class Methods
def test_permittee_model_find_by_permit_guid(test_client, setup_info, auth_headers):
    permittee = MinePartyAppointment.find_by_mine_party_appt_guid(setup_info.get('permittee_guid'))
    assert str(permittee.mine_party_appt_guid) == setup_info.get('permittee_guid')
