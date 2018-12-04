import json

from tests.constants import (
        TEST_MINE_TENURE_TYPE_IDS,
        TEST_MINE_TENURE_TYPE_NAMES,
        )


def test_get_all_mine_tenure_types(test_client, auth_headers):
    get_resp = test_client.get('/mines/mine_tenure_types', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    all_options = list(map(
        lambda x: { 'value': x[0], 'label': x[1] },
        zip(TEST_MINE_TENURE_TYPE_IDS, TEST_MINE_TENURE_TYPE_NAMES)
    ))

    assert get_resp.status_code == 200
    assert get_data == { 'options': all_options }
