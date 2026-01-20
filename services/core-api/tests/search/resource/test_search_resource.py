import json
import uuid
import pytest
from unittest.mock import patch

from tests.factories import MineFactory, PartyFactory
from app.api.utils.feature_flag import Feature


# Feature Flag Fixtures
# These fixtures ensure that all tests in this module use the V1 (original)
# search implementation instead of the V2 (Elasticsearch) implementation.
# This maintains test stability and validates that the legacy code path works correctly.

@pytest.fixture(autouse=True)
def disable_search_v2_flag():
    """Mock is_feature_enabled to always return False for search.py"""
    with patch('app.api.search.search.resources.search.is_feature_enabled') as mock_flag:
        mock_flag.return_value = False
        yield mock_flag


@pytest.fixture(autouse=True)
def disable_simple_search_v2_flag():
    """Mock is_feature_enabled to always return False for simple_search.py"""
    with patch('app.api.search.search.resources.simple_search.is_feature_enabled') as mock_flag:
        mock_flag.return_value = False
        yield mock_flag


# GET
def test_get_no_search_results(test_client, db_session, auth_headers):
    get_resp = test_client.get(
        f'/search?search_term=Abbo', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert get_data['search_terms'] == ['Abbo']
    # Verify no search results in any category
    non_empty_categories = [
        key for key, value in get_data['search_results'].items() if len(value) != 0
    ]
    assert len(non_empty_categories) == 0, \
        f"Expected no results, but found results in: {non_empty_categories}"


def test_search_party(test_client, db_session, auth_headers):
    party = PartyFactory(person=True)
    get_resp = test_client.get(
        f'/search?search_term={str(party.first_name)}', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    parties = get_data['search_results']['party']
    assert len(parties) == 1
    assert party.first_name in parties[0]['result']['name']
    assert uuid.UUID(parties[0]['result']['party_guid']) == party.party_guid
    # Verify all other search result categories are empty (only party should have results)
    empty_categories = [
        key for key, value in get_data['search_results'].items()
        if key != 'party' and len(value) == 0
    ]
    total_categories = len(get_data['search_results'])
    assert len(empty_categories) == total_categories - 1, \
        f"Expected {total_categories - 1} empty categories, got {len(empty_categories)}"
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