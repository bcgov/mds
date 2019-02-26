import json

def test_get_region_codes(test_client, auth_headers):
    get_resp = test_client.get('/parties/region_codes', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
