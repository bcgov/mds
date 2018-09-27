from tests.constants import TEST_PERMIT_GUID_1


# GET Mine Location List Auth
def test_get_permit_no_auth(test_client):
    get_resp = test_client.get('/permits/' + TEST_PERMIT_GUID_1, headers={})
    assert get_resp.status_code == 401


def test_get_permit_view_only(test_client, auth_headers):
    get_resp = test_client.get('/permits/' + TEST_PERMIT_GUID_1, headers=auth_headers['view_only_auth_header'])
    assert get_resp.status_code == 200


def test_get_permit_full_auth(test_client, auth_headers):
    get_resp = test_client.get('/permits/' + TEST_PERMIT_GUID_1, headers=auth_headers['full_auth_header'])
    assert get_resp.status_code == 200
