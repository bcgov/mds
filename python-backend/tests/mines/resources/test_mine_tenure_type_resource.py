import json

from tests.constants import (
        TEST_MINE_TENURE_TYPE_ID_1,
        TEST_MINE_TENURE_TYPE_NAME_1,
        TEST_MINE_TENURE_TYPE_ID_2,
        TEST_MINE_TENURE_TYPE_NAME_2
        )


def test_get_all_mine_tenure_types(test_client, auth_headers):
    get_resp = test_client.get('/mines/mine_tenure_types', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    all_options = [
        {
            'value': TEST_MINE_TENURE_TYPE_ID_1,
            'label': TEST_MINE_TENURE_TYPE_NAME_1
        },
        {
            'value': TEST_MINE_TENURE_TYPE_ID_2,
            'label': TEST_MINE_TENURE_TYPE_NAME_2
        }
    ]
    assert get_resp.status_code == 200
    assert get_data == { 'options': all_options }
