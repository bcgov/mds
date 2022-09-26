import pytest

from app.api.parties.party.models.party import Party, MAX_NAME_LENGTH
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
            first_name='e' * (MAX_NAME_LENGTH + 1),
            party_type_code='PER',
            phone_no='123-123-1234',
            phone_ext='1234',
            phone_no_sec='123-123-1234',
            phone_sec_ext='1234',
            phone_no_ter='123-123-1234',
            phone_ter_ext='1234')
    assert f'First name must not exceed {MAX_NAME_LENGTH} characters.' in str(e.value)


def test_party_model_validate_party_name_not_provided():
    with pytest.raises(AssertionError) as e:
        Party(
            party_name='',
            first_name='fail_name',
            party_type_code='PER',
            phone_no='123-123-1234',
            phone_ext='1234',
            phone_no_sec='123-123-1234',
            phone_sec_ext='1234',
            phone_no_ter='123-123-1234',
            phone_ter_ext='1234')
    assert 'Party name is not provided.' in str(e.value)


def test_party_model_validate_party_name_exceeds_char_limit():
    with pytest.raises(AssertionError) as e:
        Party(
            party_name='p' * (MAX_NAME_LENGTH + 1),
            first_name='test_first_name_fail',
            party_type_code='PER',
            phone_no='123-123-1234',
            phone_ext='1234',
            phone_no_sec='123-123-1234',
            phone_sec_ext='1234',
            phone_no_ter='123-123-1234',
            phone_ter_ext='1234')
    assert f'Party name must not exceed {MAX_NAME_LENGTH} characters.' in str(e.value)

def test_party_model_validate_organization_is_person(db_session):
    organization = str(PartyFactory(person=True).party_guid)
   
    with pytest.raises(AssertionError) as e:
        Party(
            party_name='fail_party_name',
            first_name='fail_name',
            party_type_code='PER',
            phone_no='123-123-1234',
            phone_ext='1234',
            phone_no_sec='123-123-1234',
            phone_sec_ext='1234',
            phone_no_ter='123-123-1234',
            phone_ter_ext='1234',
            organization_guid=organization
        )

    assert 'Cannot associate Person as Organization' in str(e.value)

def test_party_model_validate_associating_organization_to_organization(db_session):
    organization = str(PartyFactory(company=True).party_guid)
   
    with pytest.raises(AssertionError) as e:
        Party(
            party_name='fail_party_name',
            first_name='fail_name',
            party_type_code='ORG',
            phone_no='123-123-1234',
            phone_ext='1234',
            phone_no_sec='123-123-1234',
            phone_sec_ext='1234',
            phone_no_ter='123-123-1234',
            phone_ter_ext='1234',
            organization_guid=organization
        )

    assert 'Cannot associate organization with another organization' in str(e.value)
