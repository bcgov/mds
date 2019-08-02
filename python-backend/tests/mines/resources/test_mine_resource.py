import json, uuid, pytest

from tests.factories import MineFactory


# GET
def test_get_mine_not_found(test_client, db_session, auth_headers):
    get_resp = test_client.get(f'/mines/{uuid.uuid4()}', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert 'Mine not found' in get_data['message']
    assert get_resp.status_code == 404


def test_get_mine_by_mine_no(test_client, db_session, auth_headers):
    mine_no = MineFactory().mine_no

    get_resp = test_client.get(f'/mines/{mine_no}', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_data['mine_no'] == mine_no
    assert get_resp.status_code == 200


def test_get_mine_by_mine_guid(test_client, db_session, auth_headers):
    mine_guid = MineFactory().mine_guid

    get_resp = test_client.get(f'/mines/{mine_guid}', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_data['mine_guid'] == str(mine_guid)
    assert get_resp.status_code == 200


# POST
def test_post_mine_invalid_url(test_client, db_session, auth_headers):
    test_mine_data = {"mine_name": "test_create_mine"}
    post_resp = test_client.post(
        '/mines/some_mine_no', json=test_mine_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 405


def test_post_mine_no_name(test_client, db_session, auth_headers):
    test_mine_data = {}
    post_resp = test_client.post(
        '/mines', json=test_mine_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 400, post_resp.response
    assert 'validation failed' in post_data['message'], post_data


def test_post_mine_name_exceed_chars(test_client, db_session, auth_headers):
    test_mine_data = {'mine_name': '6' * 61, "mine_status": "CLD,REC,LWT", "mine_region": "SW"}

    post_resp = test_client.post(
        '/mines', json=test_mine_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 400
    assert 'not exceed 60' in post_data['message']


def test_post_mine_name_only_success(test_client, db_session, auth_headers):
    test_mine_data = {"mine_name": "test_create_mine2", "mine_status": "CLD,REC,LWT", "mine_region": "SW"}
    post_resp = test_client.post(
        '/mines', json=test_mine_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200
    assert post_data['mine_name'] == test_mine_data['mine_name']


def test_post_mine_name_and_note(test_client, db_session, auth_headers):
    test_mine_data = {
        "mine_name": "test_create_mine_and_note",
        "mine_note": "This is a note",
        "mine_region": "SW",
        "mine_status": "CLD,REC,LWT",
    }
    post_resp = test_client.post(
        '/mines', json=test_mine_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200
    assert post_data['mine_name'] == test_mine_data['mine_name']
    assert post_data['mine_note'] == test_mine_data['mine_note']


def test_post_mine_name_and_coord(test_client, db_session, auth_headers):
    test_mine_data = {
        "mine_name": "test_create_mine",
        "latitude": "49.2827000",
        "longitude": "123.1207000",
        "mine_region": "SW",
        "mine_status": "CLD,REC,LWT",
    }
    post_resp = test_client.post(
        '/mines', json=test_mine_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200
    assert post_data['mine_name'] == test_mine_data['mine_name']
    assert post_data['mine_location']['latitude'] == test_mine_data['latitude']
    assert post_data['mine_location']['longitude'] == test_mine_data['longitude']


def test_post_mine_success_all(test_client, db_session, auth_headers):
    test_mine_data = {
        "mine_name": "test_create_mine_2",
        "latitude": "49.2827000",
        "longitude": "123.1207000",
        "mine_note": "This is a note",
        "mine_region": "SW",
        "mine_status": "CLD,REC,LWT",
        "union_ind": True,
        "ohsc_ind": False
    }
    post_resp = test_client.post(
        '/mines', json=test_mine_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200
    assert post_data['mine_name'] == test_mine_data['mine_name']
    assert post_data['mine_location']['latitude'] == test_mine_data['latitude']
    assert post_data['mine_location']['longitude'] == test_mine_data['longitude']
    assert post_data['mine_note'] == test_mine_data['mine_note']
    assert post_data['union_ind'] == test_mine_data['union_ind']
    assert post_data['ohsc_ind'] == test_mine_data['ohsc_ind']


def test_post_mine_redundant_name(test_client, db_session, auth_headers):
    mine_name = MineFactory().mine_name

    test_mine_data = {
        "mine_name": mine_name,
        "latitude": "44.2827000",
        "longitude": "126.1207000",
        "mine_note": "This is a new note",
        "mine_region": "SW",
        "mine_status": "CLD,REC,LWT",
    }
    post_resp = test_client.post(
        '/mines', json=test_mine_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 400


def test_post_mine_major_invalid_input(test_client, db_session, auth_headers):
    test_mine_data = {
        "mine_name": "test_create_mine_major",
        "latitude": "49.2827000",
        "longitude": "123.1207000",
        "mine_note": "This is a note",
        "major_mine_ind": "blah",
        "mine_region": "SW",
        "mine_status": "CLD,REC,LWT",
    }
    post_resp = test_client.post(
        '/mines', json=test_mine_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 400


def test_post_mine_major_true(test_client, db_session, auth_headers):
    test_mine_data = {
        "mine_name": "test_create_mine_major",
        "latitude": "49.2827000",
        "longitude": "123.1207000",
        "mine_note": "This is a note",
        "major_mine_ind": "true",
        "mine_region": "SW",
        "mine_status": "CLD,REC,LWT",
    }
    post_resp = test_client.post(
        '/mines', json=test_mine_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data['mine_name'] == test_mine_data['mine_name']
    assert post_data['mine_location']['latitude'] == test_mine_data['latitude']
    assert post_data['mine_location']['longitude'] == test_mine_data['longitude']
    assert post_data['mine_note'] == test_mine_data['mine_note']
    assert post_data['major_mine_ind'] == True
    assert post_resp.status_code == 200


def test_post_mine_major_false(test_client, db_session, auth_headers):
    test_mine_data = {
        "mine_name": "test_create_mine_major_2",
        "latitude": "49.2827000",
        "longitude": "123.1207000",
        "mine_note": "This is a note",
        "major_mine_ind": "false",
        "mine_region": "SW",
        "mine_status": "CLD,REC,LWT",
    }
    post_resp = test_client.post(
        '/mines', json=test_mine_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data['mine_name'] == test_mine_data['mine_name']
    assert post_data['mine_location']['latitude'] == test_mine_data['latitude']
    assert post_data['mine_location']['longitude'] == test_mine_data['longitude']
    assert post_data['mine_note'] == test_mine_data['mine_note']
    assert post_data['major_mine_ind'] == False
    assert post_resp.status_code == 200


def test_post_mine_mine_status(test_client, db_session, auth_headers):
    test_mine_data = {
        "mine_name": "test_create_mine_status",
        "latitude": "49.2827000",
        "longitude": "123.1207000",
        "mine_note": "This is a note",
        "mine_status": "CLD, CM",
        "mine_region": "SW"
    }
    post_resp = test_client.post(
        '/mines', json=test_mine_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data['mine_name'] == test_mine_data['mine_name']
    assert post_data['mine_location']['latitude'] == test_mine_data['latitude']
    assert post_data['mine_location']['longitude'] == test_mine_data['longitude']
    assert post_data['mine_note'] == test_mine_data['mine_note']
    assert post_data['mine_region'] == test_mine_data['mine_region']
    assert post_resp.status_code == 200


#PUT
def test_put_mine_name(test_client, db_session, auth_headers):
    mine_guid = MineFactory().mine_guid

    test_tenure_data = {"mine_name": "mine_name", "mine_note": ""}
    put_resp = test_client.put(
        f'/mines/{mine_guid}', json=test_tenure_data, headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_data['mine_name'] == test_tenure_data['mine_name']
    assert put_resp.status_code == 200


def test_put_redundant_mine_name(test_client, db_session, auth_headers):
    existing_name = MineFactory().mine_name
    mine = MineFactory()

    test_tenure_data = {
        "mine_name": existing_name,
    }
    put_resp = test_client.put(
        f'/mines/{mine.mine_guid}', json=test_tenure_data, headers=auth_headers['full_auth_header'])
    assert put_resp.status_code == 400


def test_put_mine_major_true(test_client, db_session, auth_headers):
    mine_guid = MineFactory(major_mine_ind=False).mine_guid

    test_mine_data = {"major_mine_ind": "true", "mine_note": ""}
    put_resp = test_client.put(
        f'/mines/{mine_guid}', json=test_mine_data, headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_data['major_mine_ind'] == True
    assert put_resp.status_code == 200


def test_put_mine_major_false(test_client, db_session, auth_headers):
    mine_guid = MineFactory(major_mine_ind=True).mine_guid

    test_mine_data = {"major_mine_ind": "false", "mine_note": ""}
    put_resp = test_client.put(
        f'/mines/{mine_guid}', json=test_mine_data, headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_data['major_mine_ind'] == False
    assert put_resp.status_code == 200


def test_put_mine_note(test_client, db_session, auth_headers):
    mine_guid = MineFactory().mine_guid

    test_tenure_data = {"mine_note": "new_note"}
    put_resp = test_client.put(
        f'/mines/{mine_guid}', json=test_tenure_data, headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert test_tenure_data['mine_note'] == put_data['mine_note']
    assert put_resp.status_code == 200


def test_put_mine_mine_status(test_client, db_session, auth_headers):
    mine_guid = MineFactory().mine_guid

    test_mine_data = {"mine_status": "CLD, CM", "mine_note": ""}
    put_resp = test_client.put(
        f'/mines/{mine_guid}', json=test_mine_data, headers=auth_headers['full_auth_header'])
    assert put_resp.status_code == 200


def test_put_mine_region(test_client, db_session, auth_headers):
    mine_guid = MineFactory().mine_guid

    test_mine_data = {"mine_region": 'NE', "mine_note": ""}
    put_resp = test_client.put(
        f'/mines/{mine_guid}', json=test_mine_data, headers=auth_headers['full_auth_header'])
    assert put_resp.status_code == 200
    put_data = json.loads(put_resp.data.decode())
    assert put_data['mine_region'] == test_mine_data['mine_region']
