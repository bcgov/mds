import json


def test_get_sub_division_codes(test_client, db_session, auth_headers):
    get_resp = test_client.get(
        '/parties/sub_division_codes', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
