import json

from tests.constants import (
        TEST_MINE_DISTURBANCE_CODES,
        TEST_MINE_DISTURBANCE_DESCRIPTIONS
        )


def test_get_all_mine_disturbance_types(test_client, auth_headers):
    get_resp = test_client.get('/mines/disturbance_codes', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    all_options = list(map(
        lambda x: { 'mine_disturbance_code': x[0], 'description': x[1] },
        zip(TEST_MINE_DISTURBANCE_CODES, TEST_MINE_DISTURBANCE_DESCRIPTIONS)
    ))

    assert get_resp.status_code == 200
    assert get_data == { 'options': all_options }
