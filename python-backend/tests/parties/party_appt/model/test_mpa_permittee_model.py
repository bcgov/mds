from tests.constants import TEST_PERMITTEE_GUID
from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointment


# Permit Model Class Methods
def test_permittee_model_find_by_permit_guid(test_client, auth_headers):
    permittee = MinePartyAppointment.find_by_mine_party_appt_guid(TEST_PERMITTEE_GUID)
    assert str(permittee.mine_party_appt_guid) == TEST_PERMITTEE_GUID
