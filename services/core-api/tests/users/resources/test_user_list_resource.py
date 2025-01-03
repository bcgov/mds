import pytest
import json

from tests.factories import UserFactory


def test_get_users_list_with_search_term(test_client, db_session, auth_headers):
    """Test retrieving a list of users matching a search term."""
    # Create a batch of users
    UserFactory.create_batch(size=3)

    # Create a specific user we want to match with the search term
    user_to_match = UserFactory(given_name="SpecificName", family_name="Match")

    # Send a GET request with the search term
    search_term = "SpecificName"
    get_resp = test_client.get(f'/users?search_term={search_term}', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())

    # Assert the status code and results
    assert get_resp.status_code == 200, get_resp.response
    assert len(get_data) == 1
    assert get_data[0]['given_name'] == user_to_match.given_name
    assert get_data[0]['family_name'] == user_to_match.family_name
    assert get_data[0]['email'] == user_to_match.email


def test_get_users_list_no_results_found(test_client, db_session, auth_headers):
    """Test retrieving an empty list when no users match the search term."""
    # Create a batch of users
    UserFactory.create_batch(size=5)

    # Send a GET request with a search term that doesn't match any users
    search_term = "NonMatchingSearch"
    get_resp = test_client.get(f'/users?search_term={search_term}', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())

    # Assert the status code and empty results
    assert get_resp.status_code == 200, get_resp.response
    assert len(get_data) == 0