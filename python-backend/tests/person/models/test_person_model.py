from tests.constants import TEST_FIRST_NAME, TEST_SURNAME, TEST_PERSON_GUID, TEST_MANAGER_GUID, TEST_MINE_GUID
from app.mines.models.party import Party


# Person Model Class Methods
def test_person_model_find_by_name(test_client, auth_headers):
    party = Party.find_by_name(TEST_FIRST_NAME, TEST_SURNAME)
    assert party.first_name == TEST_FIRST_NAME
    assert party.party_name == TEST_SURNAME


def test_person_model_find_by_person_guid(test_client, auth_headers):
    party = Party.find_by_party_guid(TEST_PERSON_GUID)
    assert str(party.party_guid) == TEST_PERSON_GUID


def test_person_model_find_by_mgr_appointment(test_client, auth_headers):
    party = Party.find_by_mgr_appointment(TEST_MANAGER_GUID)
    assert str(party.mgr_appointment[0].mgr_appointment_guid) == TEST_MANAGER_GUID


def test_person_model_find_by_mine_guid(test_client, auth_headers):
    party = Party.find_by_mine_guid(TEST_MINE_GUID)
    assert str(party.mgr_appointment[0].mine_guid) == TEST_MINE_GUID
