from datetime import datetime
import json

from tests.constants import TEST_PERMITTEE_GUID, TEST_MINE_GUID, TEST_PERMIT_GUID_1, TEST_PERSON_3_GUID


# GET
def test_get_permittee_not_found(test_client, auth_headers):
    get_resp = test_client.get('/permittees/' + TEST_MINE_GUID, headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_data == {
        'error': {
            'status': 404,
            'message': 'Permittee not found'
        }
    }
    assert get_resp.status_code == 404


def test_get_permittee(test_client, auth_headers):
    get_resp = test_client.get('/permittees/' + TEST_PERMITTEE_GUID, headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_data['permittee_guid'] == TEST_PERMITTEE_GUID
    assert get_resp.status_code == 200


# POST
def test_post_permittee(test_client, auth_headers):
    data = {
        'party_guid': TEST_PERSON_3_GUID,
        'permittee_guid': TEST_PERMITTEE_GUID,
        'permit_guid': TEST_PERMIT_GUID_1,
        'effective_date': datetime.today().strftime("%Y-%m-%d")
    }
    get_resp = test_client.post('/permittees', data=data, headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_data['party_guid'] == TEST_PERSON_3_GUID
    assert get_resp.status_code == 200
