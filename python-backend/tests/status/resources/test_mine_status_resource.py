import json, uuid

from app.api.constants import MINE_STATUS_OPTIONS


# GET
def test_get_mine_status_option(test_client, db_session, auth_headers):
    get_resp = test_client.get('/mines/status', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_data == {'options': MINE_STATUS_OPTIONS}
    assert get_resp.status_code == 200


def test_get_mine_status_not_found(test_client, db_session, auth_headers):
    get_resp = test_client.get(
        '/mines/status/' + str(uuid.uuid4()), headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_data['error']['message'] == 'Mine Status not found'
    assert get_resp.status_code == 404
