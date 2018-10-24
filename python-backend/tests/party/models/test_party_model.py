import pytest

from tests.constants import TEST_PARTY_PER_FIRST_NAME_1, TEST_PARTY_PER_PARTY_NAME_1, TEST_PARTY_PER_GUID_1, TEST_MANAGER_GUID, TEST_MINE_GUID, TEST_PARTY_ORG_NAME
from app.api.party.models.party import Party


# Party Model Class Methods
def test_party_model_find_by_person_guid(test_client, auth_headers):
    party = Party.find_by_party_guid(TEST_PARTY_PER_GUID_1)
    assert str(party.party_guid) == TEST_PARTY_PER_GUID_1


def test_party_model_find_by_mgr_appointment(test_client, auth_headers):
    party = Party.find_by_mgr_appointment(TEST_MANAGER_GUID)
    assert str(party.mgr_appointment[0].mgr_appointment_guid) == TEST_MANAGER_GUID


def test_party_model_find_by_mine_guid(test_client, auth_headers):
    party = Party.find_by_mine_guid(TEST_MINE_GUID)
    assert str(party.mgr_appointment[0].mine_guid) == TEST_MINE_GUID


def test_person_model_find_by_name(test_client, auth_headers):
    party = Party.find_by_name(TEST_PARTY_PER_FIRST_NAME_1, TEST_PARTY_PER_PARTY_NAME_1)
    assert party.first_name == TEST_PARTY_PER_FIRST_NAME_1
    assert party.party_name == TEST_PARTY_PER_PARTY_NAME_1


def test_person_model_find_by_party_name(test_client, auth_headers):
    party_org = Party.find_by_party_name(TEST_PARTY_ORG_NAME)
    assert party_org.party_name == TEST_PARTY_ORG_NAME


def test_party_model_validate_first_name(test_client, auth_headers):
    with pytest.raises(AssertionError) as e:
        Party(
            party_name='test_fail_party_name',
            first_name=''.join(['{}'.format(x) for x in range(100)]),
            party_type_code='PER',
            phone_no='123-123-1234',
            phone_ext='1234'
        )
    assert 'Person first name must not exceed 100 characters.' in str(e.value)


def test_party_model_validate_party_name_not_provided(test_client, auth_headers):
    with pytest.raises(AssertionError) as e:
        Party(
            party_name='',
            first_name='fail_name',
            party_type_code='PER',
            phone_no='123-123-1234',
            phone_ext='1234'
        )
    assert 'Party name is not provided.' in str(e.value)


def test_party_model_validate_party_name_exceeds_100_chars(test_client, auth_headers):
    with pytest.raises(AssertionError) as e:
        Party(
            party_name=''.join(['{}'.format(x) for x in range(100)]),
            first_name='test_first_name_fail',
            party_type_code='PER',
            phone_no='123-123-1234',
            phone_ext='1234'
        )
    assert 'Party name must not exceed 100 characters.' in str(e.value)


def test_party_model_validate_phone_no_not_provided(test_client, auth_headers):
    with pytest.raises(AssertionError) as e:
        Party(
            party_name='party_name_pass',
            first_name='test_first_name_fail',
            party_type_code='PER',
            phone_no='',
            phone_ext='1234'
        )
    assert 'Party phone number is not provided.' in str(e.value)


def test_party_model_validate_phone_no_invalid_format(test_client, auth_headers):
    with pytest.raises(AssertionError) as e:
        Party(
            party_name='party_name_pass',
            first_name='test_first_name_fail',
            party_type_code='PER',
            phone_no='12--123-1234',
            phone_ext='1234'
        )
    assert 'Invalid phone number format, must be of XXX-XXX-XXXX.' in str(e.value)
