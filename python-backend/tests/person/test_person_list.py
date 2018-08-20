import json
from ..constants import *


# GET
def test_get_persons(test_client, auth_headers):
    get_resp = test_client.get('/persons', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert get_data['persons'][0]['person_guid'] == TEST_PERSON_GUID
