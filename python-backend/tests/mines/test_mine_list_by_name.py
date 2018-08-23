import json
from ..constants import *


def test_get_mines_by_list(test_client, auth_headers):
    get_resp = test_client.get('/mines/names', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert get_data['mines'][0]['guid'] == TEST_MINE_GUID