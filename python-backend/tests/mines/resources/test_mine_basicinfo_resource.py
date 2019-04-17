import json, uuid

from app.api.mines.mine.models.mine import Mine
from tests.factories import MineFactory


def test_get_mines_basic_info_empty(test_client, db_session, auth_headers):
    MineFactory()

    form_data = {'mine_guids': []}
    post_resp = test_client.post(
        '/mines/basicinfo', json=form_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200, str(post_resp.response)
    assert len(post_data) == 0


def test_get_mines_basic_info_single(test_client, db_session, auth_headers):
    mine_guid = MineFactory().mine_guid
    MineFactory()

    form_data = {'mine_guids': [str(mine_guid)]}
    post_resp = test_client.post(
        '/mines/basicinfo', json=form_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200, str(post_resp.response)
    assert len(post_data) == 1


def test_get_mines_basic_info_multiple(test_client, db_session, auth_headers):
    mine1_guid = MineFactory().mine_guid
    mine2_guid = MineFactory().mine_guid
    MineFactory()

    form_data = {'mine_guids': [str(mine1_guid), str(mine2_guid)]}
    post_resp = test_client.post(
        '/mines/basicinfo', json=form_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200, str(post_resp.response)
    assert len(post_data) == 2