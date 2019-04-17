import json

from tests.factories import PartyFactory


# GET
def test_get_persons(test_client, db_session, auth_headers):
    batch_size = 3
    parties = PartyFactory.create_batch(size=batch_size, person=True)

    get_resp = test_client.get('/parties', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert len(get_data['parties']) == batch_size
    assert all(
        str(party.party_guid) in map(lambda p: p['party_guid'], get_data['parties'])
        for party in parties)


def test_search_person_by_explicit(test_client, db_session, auth_headers):
    PartyFactory(person=True, first_name='a name')
    PartyFactory(person=True, first_name='OtherName')
    PartyFactory(person=True, first_name='Mr name')

    get_resp = test_client.get(
        '/parties?search=a name&type=per', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert len(get_data['parties']) == 1
    assert get_data['parties'][0]['first_name'] == 'a name'


def test_search_persons_by_implicit(test_client, db_session, auth_headers):
    PartyFactory(person=True, first_name='a name')
    PartyFactory(person=True, first_name='OtherName')
    PartyFactory(person=True, first_name='Mr name')

    get_resp = test_client.get('/parties?search=a name', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert len(get_data['parties']) == 1
    assert get_data['parties'][0]['first_name'] == 'a name'


def test_search_org_by_implicit(test_client, db_session, auth_headers):
    PartyFactory(company=True, party_name='a company')
    PartyFactory(company=True, party_name='CompanyInc')
    PartyFactory(company=True, party_name='Company & Company LTD')

    get_resp = test_client.get(
        '/parties?search=a company', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert len(get_data['parties']) == 1
    assert get_data['parties'][0]['party_name'] == 'a company'


def test_search_org_by_explicit(test_client, db_session, auth_headers):
    PartyFactory(company=True, party_name='a company')
    PartyFactory(company=True, party_name='CompanyInc')
    PartyFactory(company=True, party_name='Company & Company LTD')

    get_resp = test_client.get(
        '/parties?search=a company&type=org', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert len(get_data['parties']) == 1
    assert get_data['parties'][0]['party_name'] == 'a company'
