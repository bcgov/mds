import json

from tests.factories import PartyFactory, MinePartyAppointmentFactory, PartyOrgBookEntityFactory, create_mine_and_permit
from tests.now_application_factories import NOWApplicationFactory
from app.api.parties.party.models.party import Party

PARTY = {
    'first_name': 'John',
    'party_name': 'Smith',
    'phone_no': '123-456-7890',
    'phone_ext': '1',
    'email': 'email@email.com',
    'address': {
        'suite_no': '1234',
        'address_line_1': '1234 Foo Street',
        'address_line_2': '1234 Bar Blvd',
        'city': 'Baz Town',
        'sub_division_code': 'BC',
        'post_code': 'X0X0X0'
    },
    'party_type_code': 'PER'
}


def test_merge_success(test_client, db_session, auth_headers):
    batch_size = 5
    mpas = MinePartyAppointmentFactory.create_batch(
        size=batch_size, mine_party_appt_type_code='MMG')

    parties = [mpa.party for mpa in mpas]
    party_guids = [str(party.party_guid) for party in parties]
    party = PARTY
    payload = {'party_guids': party_guids, 'party': party}

    post_resp = test_client.post(
        '/parties/merge',
        data=json.dumps(payload),
        content_type='application/json',
        headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 200

    post_data = json.loads(post_resp.data.decode())

    merged_party_guid = post_data['party_guid']
    merged_party = Party.find_by_party_guid(merged_party_guid)
    assert merged_party

    for key in party.keys():
        if key == 'address':
            for key2 in party[key].keys():
                assert party[key][key2] == post_data[key][0][key2]
        else:
            assert party[key] == post_data[key]

    for party_guid in party_guids:
        party = Party.query.filter_by(party_guid=party_guid).one()
        assert party.deleted_ind
        assert str(party.merged_party_guid) == merged_party_guid
        for address in party.address:
            assert address.deleted_ind

    for npa in merged_party.now_party_appt:
        assert str(npa.party_guid) == merged_party_guid
        assert npa.merged_from_party_guid

    for mpa in merged_party.mine_party_appt:
        assert str(mpa.party_guid) == merged_party_guid
        assert mpa.merged_from_party_guid

    for bra in merged_party.business_role_appts:
        assert str(bra.party_guid) == merged_party_guid
        assert bra.merged_from_party_guid


def test_merge_failure_different_types(test_client, db_session, auth_headers):
    batch_size = 5
    parties = PartyFactory.create_batch(size=batch_size, person=True)

    party_guids = [str(party.party_guid) for party in parties]
    party = PARTY
    party['party_type_code'] = 'ORG'
    payload = {'party_guids': party_guids, 'party': party}

    post_resp = test_client.post(
        '/parties/merge',\
        data=json.dumps(payload),
        content_type='application/json',
        headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 400


def test_merge_failure_deleted_parties(test_client, db_session, auth_headers):
    batch_size = 5
    parties = PartyFactory.create_batch(size=batch_size, person=True)
    parties[0].delete()
    party_guids = [str(party.party_guid) for party in parties]
    party = PARTY
    payload = {'party_guids': party_guids, 'party': party}

    post_resp = test_client.post(
        '/parties/merge',
        data=json.dumps(payload),
        content_type='application/json',
        headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 404


def test_merge_failure_permittees(test_client, db_session, auth_headers):
    mine, permit = create_mine_and_permit()
    batch_size = 5
    parties = PartyFactory.create_batch(size=batch_size, person=True)
    for mpa in permit.permittee_appointments:
        parties.append(mpa.party)
    party_guids = [str(party.party_guid) for party in parties]
    party = PARTY
    payload = {'party_guids': party_guids, 'party': party}

    post_resp = test_client.post(
        '/parties/merge',
        data=json.dumps(payload),
        content_type='application/json',
        headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 400


def test_merge_failure_inspectors(test_client, db_session, auth_headers):
    batch_size = 5
    parties = PartyFactory.create_batch(size=batch_size, person=True)
    now_application = NOWApplicationFactory()
    parties.append(now_application.lead_inspector)
    party_guids = [str(party.party_guid) for party in parties]
    party = PARTY
    payload = {'party_guids': party_guids, 'party': party}

    post_resp = test_client.post(
        '/parties/merge',
        data=json.dumps(payload),
        content_type='application/json',
        headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 400


def test_merge_failure_signature(test_client, db_session, auth_headers):
    batch_size = 5
    parties = PartyFactory.create_batch(size=batch_size, person=True)
    parties[0].signature = 'data:image/png;base64,'
    party_guids = [str(party.party_guid) for party in parties]
    party = PARTY
    payload = {'party_guids': party_guids, 'party': party}

    post_resp = test_client.post(
        '/parties/merge',
        data=json.dumps(payload),
        content_type='application/json',
        headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 400


def test_merge_failure_orgbook_linked(test_client, db_session, auth_headers):
    batch_size = 5
    parties = PartyFactory.create_batch(size=batch_size, person=True)
    orgbook_entity = PartyOrgBookEntityFactory()
    parties.append(orgbook_entity.party)
    party_guids = [str(party.party_guid) for party in parties]
    party = PARTY
    payload = {'party_guids': party_guids, 'party': party}

    post_resp = test_client.post(
        '/parties/merge',
        data=json.dumps(payload),
        content_type='application/json',
        headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 400
