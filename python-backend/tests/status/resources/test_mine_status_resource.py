import json, uuid


# GET
def test_get_mine_status_option(test_client, db_session, auth_headers):
    get_resp = test_client.get('/mines/status', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert len(get_data.get('records')) == 14
    assert get_resp.status_code == 200


def test_get_mine_status_not_found(test_client, db_session, auth_headers):
    get_resp = test_client.get(
        '/mines/status/' + str(uuid.uuid4()), headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_data['message'] == '404 Not Found: Mine Status not found'
    assert get_resp.status_code == 404
