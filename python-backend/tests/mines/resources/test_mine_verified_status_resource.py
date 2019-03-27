import json, pytest, datetime, uuid
from app.api.mines.mine.models.mine_verified_status import MineVerifiedStatus
from app.api.mines.mine.models.mine import Mine
from tests.constants import TEST_MINE_NO, TEST_MINE_GUID, TEST_TENURE_ID, TEST_REGION_CODE, DUMMY_USER_KWARGS
from app.extensions import db

from app.api.utils.include.user_info import User


@pytest.fixture(scope="function")
def setup_info(test_client):
    mines = []
    for x in range(1, 5):
        mines.append(
            Mine(
                mine_guid=uuid.uuid4(),
                mine_no=str(x * 6),
                mine_name=f"mine name {x}",
                mine_region=TEST_REGION_CODE,
                **DUMMY_USER_KWARGS))

    for i, mine in enumerate(mines):
        mine.verified_status = MineVerifiedStatus(
            healthy_ind=(i % 2 == 1),
            verifying_user='mds',
            verifying_timestamp=datetime.datetime.now(),
            update_user='mds',
            update_timestamp=datetime.datetime.now())

    [m.save() for m in mines]

    yield dict(mines=mines)

    for mine in mines:
        db.session.refresh(mine)
        db.session.refresh(mine.verified_status)
        db.session.delete(mine.verified_status)
        db.session.delete(mine)

    db.session.commit()


# GET
def test_get_all_mine_verified_status(test_client, auth_headers, setup_info):
    get_resp = test_client.get('/mines/verified-status', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200, str(get_resp.response)
    assert len(get_data['healthy']) == len(
        [x for x in setup_info['mines'] if x.verified_status.healthy_ind == True])
    assert len(get_data['unhealthy']) == len(
        [x for x in setup_info['mines'] if x.verified_status.healthy_ind == False])


def test_get_mine_verified_status_by_user(test_client, auth_headers, setup_info):
    get_resp = test_client.get(
        '/mines/verified-status?user_id=mds', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200, str(get_resp.response)
    assert len(get_data['healthy']) == len(
        [x for x in setup_info['mines'] if x.verified_status.healthy_ind == True]), str(get_data)
    assert len(get_data['unhealthy']) == len(
        [x for x in setup_info['mines'] if x.verified_status.healthy_ind == False]), str(get_data)
    assert all(a['verifying_user'] == 'mds' for a in get_data['healthy'])
    assert all(a['verifying_user'] == 'mds' for a in get_data['unhealthy'])


def test_set_mine_verified_status_verified(test_client, auth_headers, setup_info):
    mine = setup_info['mines'][0]
    assert mine.verified_status.healthy_ind == False

    data = {"healthy": True}
    put_resp = test_client.put(
        f"/mines/{str(mine.mine_guid)}/verified-status",
        data=data,
        headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_resp.status_code == 200
    assert put_data['healthy'] == True


def test_set_mine_verified_status_unverified(test_client, auth_headers, setup_info):
    mine = setup_info['mines'][1]
    assert mine.verified_status.healthy_ind == True

    data = {"healthy": False}
    put_resp = test_client.put(
        f"/mines/{str(mine.mine_guid)}/verified-status",
        data=data,
        headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_resp.status_code == 200, put_resp.response
    assert put_data['healthy'] == False, put_data
