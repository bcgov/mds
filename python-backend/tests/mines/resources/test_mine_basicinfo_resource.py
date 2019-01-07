import json, uuid
from tests.constants import TEST_MINE_GUID, DUMMY_USER_KWARGS
from app.api.mines.mine.models.mine_identity import MineIdentity


def test_get_mines_basic_info_empty(test_client, auth_headers):
    form_data = {'mine_guids': []}
    post_resp = test_client.post(
        '/mines/basicinfo', json=form_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200, str(post_resp.response)
    assert len(post_data) == 0


def test_get_mines_basic_info_single(test_client, auth_headers):
    form_data = {'mine_guids': [TEST_MINE_GUID]}
    post_resp = test_client.post(
        '/mines/basicinfo', json=form_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200, str(post_resp.response)
    assert len(post_data) == 1


def test_get_mines_basic_info_multiple(test_client, auth_headers):
    new_mine_guid = 'b6e1c212-aa7d-4f30-8c37-f7e3837be561'
    mine_identity2 = MineIdentity(mine_guid=uuid.UUID(new_mine_guid), **DUMMY_USER_KWARGS)
    mine_identity2.save()

    form_data = {'mine_guids': [TEST_MINE_GUID, new_mine_guid]}
    post_resp = test_client.post(
        '/mines/basicinfo', json=form_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200, str(post_resp.response)
    assert len(post_data) == 2