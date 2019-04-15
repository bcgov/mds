import json

from tests.constants import TEST_PARTY_PER_FIRST_NAME_1,TEST_PARTY_PER_PHONE_1,TEST_PARTY_PER_EMAIL_1


def test_get_empty_return(test_client, auth_headers):
    get_resp = test_client.get('/parties?first_name=IMAFAKE', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert len(get_data['records']) == 0
    assert get_resp.status_code == 200


def test_filter_by_first_name_and_phone(test_client, auth_headers):
    get_resp = test_client.get('/parties?first_name=' + TEST_PARTY_PER_FIRST_NAME_1+"&phone_no="+ TEST_PARTY_PER_PHONE_1, headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    print(get_data)
    assert get_data['records'][0]['email'] == TEST_PARTY_PER_EMAIL_1
    assert get_resp.status_code == 200
