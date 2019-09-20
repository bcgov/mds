import json, uuid, pytest

from tests.factories import MineFactory


# POST
def test_post_mine_type_success(test_client, db_session, auth_headers):
    mine_guid = MineFactory(mine_type=None).mine_guid

    test_data = {'mine_tenure_type_code': 'MIN'}
    post_resp = test_client.post(f'/mines/{mine_guid}/mine-types',
                                 json=test_data,
                                 headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200, post_resp.response
    assert post_data['mine_type_guid'] != None
    assert post_data['mine_tenure_type_code'] == test_data['mine_tenure_type_code']


def test_post_mine_type_missing_mine_tenure_type_code(test_client, db_session, auth_headers):
    mine_guid = MineFactory(mine_type=None).mine_guid

    test_data = {}
    post_resp = test_client.post(f'/mines/{mine_guid}/mine-types',
                                 json=test_data,
                                 headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 400


@pytest.mark.skip(reason='Foreign Key constraint not enforced in scoped session')
def test_post_mine_type_invalid_mine_tenure_type_code(test_client, db_session, auth_headers):
    mine_guid = MineFactory().mine_guid

    test_data = {'mine_tenure_type_code': 'zzz'}
    post_resp = test_client.post(f'/mines/{mine_guid}/mine-types',
                                 json=test_data,
                                 headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 400


def test_post_mine_type_duplicate(test_client, db_session, auth_headers):
    mine_guid = MineFactory(mine_type=None).mine_guid

    test_data = {'mine_tenure_type_code': 'MIN'}
    post_resp1 = test_client.post(f'/mines/{mine_guid}/mine-types',
                                  json=test_data,
                                  headers=auth_headers['full_auth_header'])
    post_data1 = json.loads(post_resp1.data.decode())
    assert post_resp1.status_code == 200
    assert post_data1['mine_type_guid'] != None
    assert post_data1['mine_guid'] == str(mine_guid)

    post_resp2 = test_client.post(f'/mines/{mine_guid}/mine-types',
                                  json=test_data,
                                  headers=auth_headers['full_auth_header'])
    post_data2 = json.loads(post_resp2.data.decode())
    assert post_resp2.status_code == 400


# DELETE
def test_delete_mine_type_success(test_client, db_session, auth_headers):
    mine = MineFactory()
    type_guid = mine.mine_type[0].mine_type_guid

    delete_resp = test_client.delete(f'/mines/{mine.mine_guid}/mine-types/{type_guid}',
                                     headers=auth_headers['full_auth_header'])
    assert delete_resp.status_code == 204


def test_delete_mine_type_invalid_mine_type_guid(test_client, db_session, auth_headers):
    mine = MineFactory()
    delete_resp = test_client.delete(f'/mines/{mine.mine_guid}/mine-types/{uuid.uuid4()}',
                                     headers=auth_headers['full_auth_header'])
    assert delete_resp.status_code == 404
