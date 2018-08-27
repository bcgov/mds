from tests.constants import TEST_FIRST_NAME, TEST_SURNAME, TEST_PERSON_GUID, TEST_MANAGER_GUID, TEST_MINE_GUID
from app.mines.models.person import Person


# Person Model Class Methods
def test_person_model_find_by_name(test_client, auth_headers):
    person = Person.find_by_name(TEST_FIRST_NAME, TEST_SURNAME)
    assert person.first_name == TEST_FIRST_NAME
    assert person.surname == TEST_SURNAME


def test_person_model_find_by_person_guid(test_client, auth_headers):
    person = Person.find_by_person_guid(TEST_PERSON_GUID)
    assert str(person.person_guid) == TEST_PERSON_GUID


def test_person_model_find_by_mgr_appointment(test_client, auth_headers):
    person = Person.find_by_mgr_appointment(TEST_MANAGER_GUID)
    assert str(person.mgr_appointment[0].mgr_appointment_guid) == TEST_MANAGER_GUID


def test_person_model_find_by_mine_guid(test_client, auth_headers):
    person = Person.find_by_mine_guid(TEST_MINE_GUID)
    assert str(person.mgr_appointment[0].mine_guid) == TEST_MINE_GUID
