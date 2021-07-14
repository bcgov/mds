import json

from tests.factories import ExplosivesPermitFactory, MinePartyAppointmentFactory, create_mine_and_permit


def test_get_explosives_permit_by_mine_guid(test_client, db_session, auth_headers):
    explosives_permit = ExplosivesPermitFactory()

    get_resp = test_client.get(
        f'/mines/{explosives_permit.mine_guid}/explosives-permits',
        headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())

    assert get_resp.status_code == 200, get_resp.response
    assert len(get_data['records']) == 1


def test_post_explosives_permit_application(test_client, db_session, auth_headers):
    mine, permit = create_mine_and_permit()
    mine_manager = MinePartyAppointmentFactory(mine=mine)
    permittee = MinePartyAppointmentFactory(mine=mine)
    data = {
        'originating_system':
        'Core',
        'permit_guid':
        str(permit.permit_guid),
        'mine_manager_mine_party_appt_id':
        mine_manager.mine_party_appt_id,
        'permittee_mine_party_appt_id':
        permittee.mine_party_appt_id,
        'application_date':
        '2021-07-12',
        'description':
        'Other Information.',
        'latitude':
        '54',
        'longitude':
        '40',
        'explosive_magazines': [{
            'type_no': '1',
            'tag_no': '1',
            'construction': '1',
            'quantity': '1',
            'latitude': '1',
            'longitude': '1',
            'distance_road': '1',
            'distance_dwelling': '1',
            'length': '1',
            'width': '1',
            'height': '1'
        }],
        'detonator_magazines': [{
            'type_no': '1',
            'tag_no': '1',
            'construction': '1',
            'quantity': '1',
            'longitude': '1',
            'latitude': '1',
            'detonator_type': '1',
            'distance_road': '1',
            'distance_dwelling': '1',
            'width': '1',
            'height': '1',
            'length': '1'
        }]
    }

    post_resp = test_client.post(
        f'/mines/{mine.mine_guid}/explosives-permits',
        json=data,
        headers=auth_headers['full_auth_header'])

    assert post_resp.status_code == 201
    assert len(mine.explosives_permits) == 1

    post_data = json.loads(post_resp.data.decode())
    assert post_data['mine_guid'] == str(mine.mine_guid)
    assert post_data['permit_guid'] == data['permit_guid']
    assert post_data['application_status'] == 'REC'
    assert post_data['application_number'] != None
    assert post_data['received_timestamp'] != None
    assert post_data['is_closed'] == False
    assert post_data['permit_number'] == None
    assert post_data['issue_date'] == None
    assert post_data['expiry_date'] == None
    assert len(post_data['explosive_magazines']) == len(data['explosive_magazines'])
    assert len(post_data['detonator_magazines']) == len(data['detonator_magazines'])


def test_post_explosives_permit_historical(test_client, db_session, auth_headers):
    mine, permit = create_mine_and_permit()
    mine_manager = MinePartyAppointmentFactory(mine=mine)
    permittee = MinePartyAppointmentFactory(mine=mine)
    data = {
        'originating_system':
        'MMS',
        'permit_guid':
        str(permit.permit_guid),
        'mine_manager_mine_party_appt_id':
        mine_manager.mine_party_appt_id,
        'permittee_mine_party_appt_id':
        permittee.mine_party_appt_id,
        'application_date':
        '2000-07-12',
        'description':
        'Other Information.',
        'latitude':
        '54',
        'longitude':
        '40',
        'explosive_magazines': [{
            'type_no': '1',
            'tag_no': '1',
            'construction': '1',
            'quantity': '1',
            'latitude': '1',
            'longitude': '1',
            'distance_road': '1',
            'distance_dwelling': '1',
            'length': '1',
            'width': '1',
            'height': '1'
        }],
        'detonator_magazines': [{
            'type_no': '1',
            'tag_no': '1',
            'construction': '1',
            'quantity': '1',
            'longitude': '1',
            'latitude': '1',
            'detonator_type': '1',
            'distance_road': '1',
            'distance_dwelling': '1',
            'width': '1',
            'height': '1',
            'length': '1'
        }],
        'permit_number':
        'BC-1042',
        'issue_date':
        '2001-07-12',
        'expiry_date':
        '2001-07-12',
    }

    post_resp = test_client.post(
        f'/mines/{mine.mine_guid}/explosives-permits',
        json=data,
        headers=auth_headers['full_auth_header'])

    assert post_resp.status_code == 201
    assert len(mine.explosives_permits) == 1

    post_data = json.loads(post_resp.data.decode())
    assert post_data['application_status'] == 'APP'
    assert post_data['mine_guid'] == str(mine.mine_guid)
    assert post_data['permit_guid'] == data['permit_guid']
    assert post_data['originating_system'] == data['originating_system']
    assert post_data['permit_number'] == data['permit_number']
    assert post_data['application_number'] == None
    assert post_data['received_timestamp'] == None
    assert len(post_data['explosive_magazines']) == len(data['explosive_magazines'])
    assert len(post_data['detonator_magazines']) == len(data['detonator_magazines'])
