import json, uuid
from tests.constants import (TEST_MINE_NO, TEST_MINE_GUID, TEST_TENURE_ID, TEST_REGION_CODE)

from app.api.mines.mine.models.mineral_tenure_xref import MineralTenureXref

from tests.factories import MineFactory


# GET
def test_get_mine_not_found(test_client, db_session, auth_headers):
    get_resp = test_client.get(f'/mines/{uuid.uuid4()}', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_data == {'error': {'status': 404, 'message': 'Mine not found'}}
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
    assert get_data['guid'] == str(mine_guid)
    assert get_resp.status_code == 200


# POST
def test_post_mine_invalid_url(test_client, db_session, auth_headers):
    test_mine_data = {"mine_name": "test_create_mine"}
    post_resp = test_client.post(
        '/mines/some_mine_no', data=test_mine_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 400
    assert post_data == {
        'error': {
            'status': 400,
            'message': 'Error: Unexpected mine number in Url.'
        }
    }


def test_post_mine_no_name(test_client, db_session, auth_headers):
    test_mine_data = {}
    post_resp = test_client.post(
        '/mines', data=test_mine_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 400, post_resp.response
    assert 'mine name' in post_data['message'], post_data


def test_post_mine_name_exceed_chars(test_client, db_session, auth_headers):
    test_mine_data = {'mine_name': '6' * 61, 'latitude': '49.2827', 'longitude': '123.1207'}
    post_resp = test_client.post(
        '/mines', data=test_mine_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 400
    assert 'not exceed 60' in post_data['message']


def test_post_mine_name_only_success(test_client, db_session, auth_headers):
    test_mine_data = {"mine_name": "test_create_mine2", "mine_region": "SW"}
    post_resp = test_client.post(
        '/mines', data=test_mine_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200
    assert post_data['mine_name'] == test_mine_data['mine_name']


def test_post_mine_name_and_note(test_client, db_session, auth_headers):
    test_mine_data = {
        "mine_name": "test_create_mine_and_note",
        "mine_note": "This is a note",
        "mine_region": "SW"
    }
    post_resp = test_client.post(
        '/mines', data=test_mine_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200
    assert post_data['mine_name'] == test_mine_data['mine_name']
    assert post_data['mine_note'] == test_mine_data['mine_note']


def test_post_mine_name_and_coord(test_client, db_session, auth_headers):
    test_mine_data = {
        "mine_name": "test_create_mine",
        "latitude": "49.2827000",
        "longitude": "123.1207000",
        "mine_region": "SW"
    }
    post_resp = test_client.post(
        '/mines', data=test_mine_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200
    assert post_data['mine_name'] == test_mine_data['mine_name']
    assert post_data['latitude'] == test_mine_data['latitude']
    assert post_data['longitude'] == test_mine_data['longitude']


def test_post_mine_success_all(test_client, db_session, auth_headers):
    test_mine_data = {
        "mine_name": "test_create_mine_2",
        "latitude": "49.2827000",
        "longitude": "123.1207000",
        "mine_note": "This is a note",
        "mine_region": "SW"
    }
    post_resp = test_client.post(
        '/mines', data=test_mine_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200
    assert post_data['mine_name'] == test_mine_data['mine_name']
    assert post_data['latitude'] == test_mine_data['latitude']
    assert post_data['longitude'] == test_mine_data['longitude']
    assert post_data['mine_note'] == test_mine_data['mine_note']


def test_post_mine_redundant_name(test_client, db_session, auth_headers):
    mine_name = MineFactory().mine_name

    test_mine_data = {
        "mine_name": mine_name,
        "latitude": "44.2827000",
        "longitude": "126.1207000",
        "mine_note": "This is a new note",
        "mine_region": "SW"
    }
    post_resp = test_client.post(
        '/mines', data=test_mine_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 400


def test_post_mine_major_invalid_input(test_client, db_session, auth_headers):
    test_mine_data = {
        "mine_name": "test_create_mine_major",
        "latitude": "49.2827000",
        "longitude": "123.1207000",
        "mine_note": "This is a note",
        "major_mine_ind": "blah",
        "mine_region": "SW"
    }
    post_resp = test_client.post(
        '/mines', data=test_mine_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 400


def test_post_mine_major_true(test_client, db_session, auth_headers):
    test_mine_data = {
        "mine_name": "test_create_mine_major",
        "latitude": "49.2827000",
        "longitude": "123.1207000",
        "mine_note": "This is a note",
        "major_mine_ind": "true",
        "mine_region": "SW"
    }
    post_resp = test_client.post(
        '/mines', data=test_mine_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data['mine_name'] == test_mine_data['mine_name']
    assert post_data['latitude'] == test_mine_data['latitude']
    assert post_data['longitude'] == test_mine_data['longitude']
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
        "mine_region": "SW"
    }
    post_resp = test_client.post(
        '/mines', data=test_mine_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data['mine_name'] == test_mine_data['mine_name']
    assert post_data['latitude'] == test_mine_data['latitude']
    assert post_data['longitude'] == test_mine_data['longitude']
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
        '/mines', data=test_mine_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data['mine_name'] == test_mine_data['mine_name']
    assert post_data['latitude'] == test_mine_data['latitude']
    assert post_data['longitude'] == test_mine_data['longitude']
    assert post_data['mine_note'] == test_mine_data['mine_note']
    assert post_data['mine_region'] == test_mine_data['mine_region']
    assert post_resp.status_code == 200


#PUT
def test_put_mine_tenure_mine_not_found(test_client, db_session, auth_headers):
    test_tenure_data = {
        "tenure_number_id": "1234568",
        "latitude": "49.2828",
        "longitude": "123.1208"
    }
    put_resp = test_client.put(
        f'/mines/{uuid.uuid4()}', data=test_tenure_data, headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_resp.status_code == 404, put_resp.response
    assert 'not found' in put_data['message']


def test_put_mine_tenure_invalid_length(test_client, db_session, auth_headers):
    mine_no = MineFactory().mine_no

    test_tenure_data = {
        "tenure_number_id": "12345688",
        "latitude": "49.2828",
        "longitude": "123.1208"
    }
    put_resp = test_client.put(
        f'/mines/{mine_no}', data=test_tenure_data, headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_resp.status_code == 400
    assert '6 or 7 digits' in put_data['message']


def test_put_mine_tenure_already_exists(test_client, db_session, auth_headers):
    mine = MineFactory()
    tenure_id = '666666'
    MineralTenureXref(
        mineral_tenure_xref_guid=uuid.uuid4(), mine_guid=mine.mine_guid,
        tenure_number_id=tenure_id).save()

    test_tenure_data = {
        "tenure_number_id": tenure_id,
        "latitude": "49.2828",
        "longitude": "123.1208"
    }
    put_resp = test_client.put(
        f'/mines/{mine.mine_no}', data=test_tenure_data, headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_resp.status_code == 400
    assert 'already exists' in put_data['message']


def test_put_mine_tenure_by_mine_no(test_client, db_session, auth_headers):
    mine_no = MineFactory().mine_no

    test_tenure_data = {
        "tenure_number_id": "1234567",
        "latitude": "49.2828",
        "longitude": "123.1208",
        "mine_note": ""
    }
    put_resp = test_client.put(
        f'/mines/{mine_no}', data=test_tenure_data, headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_resp.status_code == 200
    assert test_tenure_data['tenure_number_id'] in [
        x['tenure_number_id'] for x in put_data['mineral_tenure_xref']
    ]


def test_put_mine_tenure_guid(test_client, db_session, auth_headers):
    mine_guid = MineFactory().mine_guid

    test_tenure_data = {
        "tenure_number_id": "1234599",
        "latitude": "49.2829",
        "longitude": "123.1209",
        "mine_note": ""
    }
    put_resp = test_client.put(
        f'/mines/{mine_guid}', data=test_tenure_data, headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_resp.status_code == 200
    assert test_tenure_data['tenure_number_id'] in [
        x['tenure_number_id'] for x in put_data['mineral_tenure_xref']
    ]


def test_put_mine_name(test_client, db_session, auth_headers):
    mine_guid = MineFactory().mine_guid

    test_tenure_data = {"mine_name": "mine_name", "mine_note": ""}
    put_resp = test_client.put(
        f'/mines/{mine_guid}', data=test_tenure_data, headers=auth_headers['full_auth_header'])
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
        f'/mines/{mine.mine_guid}', data=test_tenure_data, headers=auth_headers['full_auth_header'])
    assert put_resp.status_code == 400


def test_put_mine_major_true(test_client, db_session, auth_headers):
    mine_guid = MineFactory(major_mine_ind=False).mine_guid

    test_mine_data = {"major_mine_ind": "true", "mine_note": ""}
    put_resp = test_client.put(
        f'/mines/{mine_guid}', data=test_mine_data, headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_data['major_mine_ind'] == True
    assert put_resp.status_code == 200


def test_put_mine_major_false(test_client, db_session, auth_headers):
    mine_guid = MineFactory(major_mine_ind=True).mine_guid

    test_mine_data = {"major_mine_ind": "false", "mine_note": ""}
    put_resp = test_client.put(
        f'/mines/{mine_guid}', data=test_mine_data, headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_data['major_mine_ind'] == False
    assert put_resp.status_code == 200


def test_put_mine_note(test_client, db_session, auth_headers):
    mine_guid = MineFactory().mine_guid

    test_tenure_data = {"mine_note": "new_note"}
    put_resp = test_client.put(
        f'/mines/{mine_guid}', data=test_tenure_data, headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert test_tenure_data['mine_note'] == put_data['mine_note']
    assert put_resp.status_code == 200


def test_put_mine_mine_status(test_client, db_session, auth_headers):
    mine_guid = MineFactory().mine_guid

    test_mine_data = {"mine_status": "CLD, CM", "mine_note": ""}
    put_resp = test_client.put(
        f'/mines/{mine_guid}', data=test_mine_data, headers=auth_headers['full_auth_header'])
    assert put_resp.status_code == 200


def test_put_mine_region(test_client, db_session, auth_headers):
    mine_guid = MineFactory().mine_guid

    test_mine_data = {"mine_region": 'NE', "mine_note": ""}
    put_resp = test_client.put(
        f'/mines/{mine_guid}', data=test_mine_data, headers=auth_headers['full_auth_header'])
    assert put_resp.status_code == 200
    put_data = json.loads(put_resp.data.decode())
    assert put_data['region_code'] == test_mine_data['mine_region']
