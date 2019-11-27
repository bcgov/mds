import json


def test_get_region_by_region_guid(test_client, db_session, auth_headers):
    get_resp = test_client.get('/mines/region', headers=auth_headers['full_auth_header'])
    assert get_resp.status_code == 200
