import pytest

from app.api.parties.party.models.party import Party
from tests.factories import PartyFactory


# Party Model Class Methods
def test_party_model_find_by_person_guid(db_session):
    party_guid = PartyFactory(person=True).party_guid

    party = Party.find_by_party_guid(str(party_guid))
    assert party.party_guid == party_guid


def test_person_model_find_by_name(db_session):
    party = PartyFactory(person=True)

    found_party = Party.find_by_name(party.party_name, party.first_name)
    assert found_party.first_name == party.first_name
    assert found_party.party_name == party.party_name


def test_party_model_find_by_party_name(db_session):
    party = PartyFactory(company=True)

    party_org = Party.find_by_name(party.party_name)
    assert party_org.party_name == party.party_name


def test_party_model_validate_first_name():
    with pytest.raises(AssertionError) as e:
        Party(
            party_name='test_fail_party_name',
            first_name='e' * 101,
            party_type_code='PER',
            phone_no='123-123-1234',
            phone_ext='1234')
    assert 'Person first name must not exceed 100 characters.' in str(e.value)


def test_party_model_validate_party_name_not_provided():
    with pytest.raises(AssertionError) as e:
        Party(
            party_name='',
            first_name='fail_name',
            party_type_code='PER',
            phone_no='123-123-1234',
            phone_ext='1234')
    assert 'Party name is not provided.' in str(e.value)


def test_party_model_validate_party_name_exceeds_100_chars():
    with pytest.raises(AssertionError) as e:
        Party(
            party_name='p' * 101,
            first_name='test_first_name_fail',
            party_type_code='PER',
            phone_no='123-123-1234',
            phone_ext='1234')
    assert 'Party name must not exceed 100 characters.' in str(e.value)


def test_party_model_validate_phone_no_not_provided():
    with pytest.raises(AssertionError) as e:
        Party(
            party_name='party_name_pass',
            first_name='test_first_name_fail',
            party_type_code='PER',
            phone_no='',
            phone_ext='1234')
    assert 'Party phone number is not provided.' in str(e.value)


def test_party_model_validate_phone_no_invalid_format():
    with pytest.raises(AssertionError) as e:
        Party(
            party_name='party_name_pass',
            first_name='test_first_name_fail',
            party_type_code='PER',
            phone_no='12--123-1234',
            phone_ext='1234')
    assert 'Invalid phone number format, must be of XXX-XXX-XXXX.' in str(e.value)
