import json

from tests.factories import MineFactory


def test_get_mines_by_list(test_client, db_session, auth_headers):
    mine = MineFactory()

    get_resp = test_client.get('/mines/search', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    context = {
        'mine_guid': str(mine.mine_guid),
        'mine_name': mine.mine_name,
        'mine_no': mine.mine_no,
        'latitude': str(mine.latitude),
        'longitude': str(mine.longitude),
        'mine_location_description': mine.mine_location_description,
    }
    assert get_resp.status_code == 200
    assert get_data['mines'][0] == context


def test_get_mines_by_list_search_by_name(test_client, db_session, auth_headers):
    mine = MineFactory()

    get_resp = test_client.get(
        f'/mines/search?name={mine.mine_name}', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    context = {
        'mine_guid': str(mine.mine_guid),
        'mine_name': mine.mine_name,
        'mine_no': mine.mine_no,
        'latitude': str(mine.latitude),
        'longitude': str(mine.longitude),
        'mine_location_description': mine.mine_location_description,
    }
    assert get_resp.status_code == 200
    assert get_data['mines'][0] == context


def test_get_mines_by_list_search_term_name(test_client, db_session, auth_headers):
    mine = MineFactory()

    get_resp = test_client.get(
        f'/mines/search?term={mine.mine_name}', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    context = {
        'mine_guid': str(mine.mine_guid),
        'mine_name': mine.mine_name,
        'mine_no': mine.mine_no,
        'latitude': str(mine.latitude),
        'longitude': str(mine.longitude),
        'mine_location_description': mine.mine_location_description,
    }
    assert get_resp.status_code == 200
    assert get_data['mines'][0] == context


def test_get_mines_by_list_search_by_mine_no(test_client, db_session, auth_headers):
    mine = MineFactory()

    get_resp = test_client.get(
        f'/mines/search?term={mine.mine_no}', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    context = {
        'mine_guid': str(mine.mine_guid),
        'mine_name': mine.mine_name,
        'mine_no': mine.mine_no,
        'latitude': str(mine.latitude),
        'longitude': str(mine.longitude),
        'mine_location_description': mine.mine_location_description,
    }
    assert get_resp.status_code == 200
    assert get_data['mines'][0] == context


def test_get_mines_by_list_search_by_permit_no(test_client, db_session, auth_headers):
    mine = MineFactory(mine_permit=1)

    get_resp = test_client.get(
        f'/mines/search?term={mine.mine_permit[0].permit_no}',
        headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    context = {
        'mine_guid': str(mine.mine_guid),
        'mine_name': mine.mine_name,
        'mine_no': mine.mine_no,
        'latitude': str(mine.latitude),
        'longitude': str(mine.longitude),
        'mine_location_description': mine.mine_location_description,
    }
    assert get_resp.status_code == 200
    assert get_data['mines'][0] == context
