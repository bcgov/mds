import json

from tests.factories import ExplosivesPermitFactory
from flask_restplus import marshal
from app.api.mines.explosives_permit.response_models import EXPLOSIVES_PERMIT_MODEL


def test_get_explosives_permit_by_explosives_permit_guid(test_client, db_session, auth_headers):
    explosives_permit = ExplosivesPermitFactory()

    get_resp = test_client.get(
        f'/mines/{explosives_permit.mine_guid}/explosives-permits/{explosives_permit.explosives_permit_guid}',
        headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())

    assert get_resp.status_code == 200
    assert get_data['explosives_permit_guid'] == str(explosives_permit.explosives_permit_guid)


def test_put_explosives_permit(test_client, db_session, auth_headers):

    explosives_permit = ExplosivesPermitFactory()
    data = marshal(explosives_permit, EXPLOSIVES_PERMIT_MODEL)

    data['application_date'] = '2021-07-12'
    data['description'] = 'Test'

    put_resp = test_client.put(
        f'/mines/{explosives_permit.mine_guid}/explosives-permits/{explosives_permit.explosives_permit_guid}',
        headers=auth_headers['full_auth_header'],
        json=data)
    put_data = json.loads(put_resp.data.decode())

    assert put_resp.status_code == 200, put_resp.response
    assert put_data['permit_guid'] == str(data['permit_guid'])
    assert put_data['issuing_inspector_party_guid'] == str(data['issuing_inspector_party_guid'])
    assert put_data['mine_manager_mine_party_appt_id'] == data['mine_manager_mine_party_appt_id']
    assert put_data['permittee_mine_party_appt_id'] == data['permittee_mine_party_appt_id']
    assert put_data['application_status'] == data['application_status']
    assert put_data['application_date'] == data['application_date']
    assert put_data['is_closed'] == data['is_closed']
    assert put_data['closed_reason'] == data['closed_reason']
    assert len(put_data['explosive_magazines']) == len(data['explosive_magazines'])
    assert len(put_data['detonator_magazines']) == len(data['detonator_magazines'])
    assert len(put_data['documents']) == len(data['documents'])


def test_delete_explosives_permit(test_client, db_session, auth_headers):

    explosives_permit = ExplosivesPermitFactory()

    delete_resp = test_client.delete(
        f'/mines/{explosives_permit.mine_guid}/explosives-permits/{explosives_permit.explosives_permit_guid}',
        headers=auth_headers['full_auth_header'])

    assert delete_resp.status_code == 204
