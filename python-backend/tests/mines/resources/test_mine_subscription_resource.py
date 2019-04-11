import json
from tests.constants import (TEST_MINE_NAME, TEST_MINE_GUID)

#GET empty
def test_get_no_favorites(test_client, auth_headers):
    get_resp = test_client.get('/mines/subscribe', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_data == {'mines': []}
    assert get_resp.status_code == 200

#POST
def test_post_a_favorite(test_client, auth_headers):
    get_resp = test_client.post('/mines/' + TEST_MINE_GUID + '/subscribe', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_data == {"mine_guid": TEST_MINE_GUID}
    assert get_resp.status_code == 200

#GET one
def test_get_favorites(test_client, auth_headers):
    get_resp = test_client.get('/mines/subscribe', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_data["mines"][0]["mine_name"] == TEST_MINE_NAME
    assert get_resp.status_code == 200

#DELETE
def test_delete_a_favorite(test_client, auth_headers):
    get_resp = test_client.delete('/mines/' + TEST_MINE_GUID + '/subscribe', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_data == {"mine_guid": TEST_MINE_GUID}
    assert get_resp.status_code == 200
    #Test that delete was done correctly
    get_resp = test_client.get('/mines/subscribe', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_data == {'mines': []}
    assert get_resp.status_code == 200


