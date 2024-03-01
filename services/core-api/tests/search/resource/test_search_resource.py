import json
import uuid
import pytest

from tests.factories import MineFactory, MinePartyAppointmentFactory, PartyFactory


# GET
def test_get_no_search_results(test_client, db_session, auth_headers):
    get_resp = test_client.get(
        f'/search?search_term=Abbo', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert get_data['search_terms'] == ['Abbo']
    assert len(
        [key for key, value in get_data['search_results'].items() if len(value) is not 0]) == 0


def test_search_party(test_client, db_session, auth_headers):
    party = PartyFactory(person=True)
    get_resp = test_client.get(
        f'/search?search_term={str(party.first_name)}', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    parties = get_data['search_results']['party']
    assert len(parties) == 1
    assert party.first_name in parties[0]['result']['name']
    assert uuid.UUID(parties[0]['result']['party_guid']) == party.party_guid
    assert len([
        key for key, value in get_data['search_results'].items()
        if key is not 'party' and len(value) is 0
    ]) == 5
    assert get_resp.status_code == 200


def test_get_parties_and_mines(test_client, db_session, auth_headers):
    searchString = 'Abbot'
    mine = MineFactory(mine_name="Test")
    party = PartyFactory(person=True, first_name="Rod", party_name="Stewart")
    for x in range(3):
        PartyFactory(person=True, first_name='Abbot')
        MineFactory(mine_name='Abbot Mines')
    get_resp = test_client.get(
        f'/search?search_term={searchString}', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    mines = get_data['search_results']['mine']
    parties = get_data['search_results']['party']
    assert len(mines) == 3
    assert len(parties) == 3
    assert get_resp.status_code == 200


def test_simple_search_no_results(test_client, db_session, auth_headers):
    get_resp = test_client.get(
        f'/search/simple?search_term=Abbo', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert get_data['search_terms'] == ['Abbo']
    assert len(get_data['search_results']) == 0


def test_simple_search_parties_only(test_client, db_session, auth_headers):
    searchString = 'Abb'
    party = PartyFactory(person=True, first_name="Rod", party_name="Stewart")
    for x in range(3):
        PartyFactory(person=True, first_name='Abbot')
    get_resp = test_client.get(
        f'/search/simple?search_term={searchString}', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert len(get_data['search_results']) == 3
    assert get_resp.status_code == 200


def test_simple_search_parties_and_mines(test_client, db_session, auth_headers):
    searchString = 'Abbo'
    mine = MineFactory(mine_name="Test")
    party = PartyFactory(person=True, first_name="Rod", party_name="Stewart")
    for x in range(3):
        PartyFactory(person=True, first_name='Abbot')
        MineFactory(mine_name='Abbot Mines')
    get_resp = test_client.get(
        f'/search/simple?search_term={searchString}', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert len(get_data['search_results']) == 4
    assert get_resp.status_code == 200