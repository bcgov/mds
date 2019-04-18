import json

from tests.factories import PartyFactory


def test_get_empty_return(test_client, db_session, auth_headers):
    PartyFactory(person=True)

    get_resp = test_client.get(
        '/parties?first_name=IMAFAKE', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert len(get_data['records']) == 0

def test_filter_by_first_name_and_phone(test_client, db_session, auth_headers):
    wanted_party = PartyFactory(person=True)
    PartyFactory.create_batch(size=5, person=True)

    get_resp = test_client.get(
        f'/parties?first_name={wanted_party.first_name}&phone_no={wanted_party.phone_no}',
        headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert len(get_data['records']) == 1
    assert get_data['records'][0]['party_guid'] == str(wanted_party.party_guid)
