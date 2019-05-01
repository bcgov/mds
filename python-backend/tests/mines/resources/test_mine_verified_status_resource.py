import json, pytest, datetime, uuid
from app.api.mines.mine.models.mine_verified_status import MineVerifiedStatus
from app.api.mines.mine.models.mine import Mine

from app.api.utils.include.user_info import User

from tests.factories import MineFactory


# GET
def test_get_all_mine_verified_status(test_client, db_session, auth_headers):
    healthy_count = 2
    MineFactory.create_batch(size=healthy_count, verified_status__healthy_ind=True)
    unhealthy_count = 2
    MineFactory.create_batch(size=unhealthy_count, verified_status__healthy_ind=False)

    get_resp = test_client.get('/mines/verified-status', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200, str(get_resp.response)
    assert len(get_data) == healthy_count + unhealthy_count, str(get_data)


def test_get_mine_verified_status_by_user(test_client, db_session, auth_headers):
    healthy_count = 2
    MineFactory.create_batch(
        size=healthy_count,
        verified_status__verifying_user='mds',
        verified_status__healthy_ind=True)
    unhealthy_count = 2
    MineFactory.create_batch(
        size=unhealthy_count,
        verified_status__verifying_user='mds',
        verified_status__healthy_ind=False)

    get_resp = test_client.get(
        '/mines/verified-status?user_id=mds', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200, str(get_resp.response)
    assert len([x for x in get_data if x['healthy_ind'] == True]) == healthy_count, str(get_data)
    assert len([x for x in get_data if x['healthy_ind'] == False]) == unhealthy_count, str(get_data)
    assert all(a['verifying_user'] == 'mds' for a in get_data)


def test_set_mine_verified_status_verified(test_client, db_session, auth_headers):
    mine_guid = MineFactory(verified_status__healthy_ind=False).mine_guid

    data = {"healthy": True}
    put_resp = test_client.put(
        f"/mines/{mine_guid}/verified-status", json=data, headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_resp.status_code == 200, put_resp.response
    assert put_data['healthy_ind'] == True


def test_set_mine_verified_status_unverified(test_client, db_session, auth_headers):
    mine_guid = MineFactory(verified_status__healthy_ind=True).mine_guid

    data = {"healthy": False}
    put_resp = test_client.put(
        f"/mines/{mine_guid}/verified-status", json=data, headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_resp.status_code == 200, put_resp.response
    assert put_data['healthy_ind'] == False, put_data
