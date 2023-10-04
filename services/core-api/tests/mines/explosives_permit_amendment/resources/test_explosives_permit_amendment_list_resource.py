from tests.factories import ExplosivesPermitAmendmentFactory, create_mine_and_permit, MinePartyAppointmentFactory, \
    ExplosivesPermitFactory
import json

def test_post_explosives_permit_amendment_application(test_client, db_session, auth_headers):
    mine, permit = create_mine_and_permit()
    mine_manager = MinePartyAppointmentFactory(mine=mine)
    permittee = MinePartyAppointmentFactory(mine=mine)
    explosives_permit = ExplosivesPermitFactory()
    data = {
        'explosives_permit_id': explosives_permit.explosives_permit_id,
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
        f'/mines/{mine.mine_guid}/explosives-permits-amendment',
        json=data,
        headers=auth_headers['full_auth_header'])

    assert post_resp.status_code == 201
    assert len(mine.explosives_permits_amendments) == 1

    post_data = json.loads(post_resp.data.decode())
    assert post_data['explosives_permit_id'] != None
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