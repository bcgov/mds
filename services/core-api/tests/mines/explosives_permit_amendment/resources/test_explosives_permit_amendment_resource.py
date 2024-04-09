import json

from tests.factories import ExplosivesPermitAmendmentFactory
from flask_restx import marshal
from app.api.mines.explosives_permit.response_models import EXPLOSIVES_PERMIT_AMENDMENT_MODEL


def test_get_explosives_permit_amendment_by_explosives_permit_amendment_guid(test_client, db_session, auth_headers):
    explosives_permit_amendment = ExplosivesPermitAmendmentFactory()

    get_resp = test_client.get(
        f'/mines/{explosives_permit_amendment.mine_guid}/explosives-permits-amendment/{explosives_permit_amendment.explosives_permit_amendment_guid}',
        headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())

    assert get_resp.status_code == 200
    assert get_data['explosives_permit_amendment_guid'] == str(explosives_permit_amendment.explosives_permit_amendment_guid)


def test_put_explosives_permit_amendment_basic(test_client, db_session, auth_headers):

    explosives_permit_amendment = ExplosivesPermitAmendmentFactory()
    data = marshal(explosives_permit_amendment, EXPLOSIVES_PERMIT_AMENDMENT_MODEL)

    data['application_date'] = '2021-07-12'
    data['description'] = 'Test'

    put_resp = test_client.put(
        f'/mines/{explosives_permit_amendment.mine_guid}/explosives-permits-amendment/{explosives_permit_amendment.explosives_permit_amendment_guid}',
        headers=auth_headers['full_auth_header'],
        json=data)
    put_data = json.loads(put_resp.data.decode())

    assert put_resp.status_code == 200, put_resp.response

    assert put_data['application_status'] == data['application_status']
    assert put_data['application_date'] == data['application_date']
    assert put_data['description'] == data['description']


def test_put_explosives_permit_amendment_close(test_client, db_session, auth_headers):

    explosives_permit_amendment = ExplosivesPermitAmendmentFactory()
    data = marshal(explosives_permit_amendment, EXPLOSIVES_PERMIT_AMENDMENT_MODEL)

    data['is_closed'] = True
    data['closed_reason'] = 'Test'

    put_resp = test_client.put(
        f'/mines/{explosives_permit_amendment.mine_guid}/explosives-permits-amendment/{explosives_permit_amendment.explosives_permit_amendment_guid}',
        headers=auth_headers['full_auth_header'],
        json=data)
    put_data = json.loads(put_resp.data.decode())

    assert put_resp.status_code == 200, put_resp.response

    assert put_data['application_status'] == data['application_status']
    assert put_data['is_closed'] == data['is_closed']
    assert put_data['closed_reason'] == data['closed_reason']
    assert put_data['closed_timestamp'] != None


def test_put_explosives_permit_amendment_reject(test_client, db_session, auth_headers):

    explosives_permit_amendment = ExplosivesPermitAmendmentFactory()
    data = marshal(explosives_permit_amendment, EXPLOSIVES_PERMIT_AMENDMENT_MODEL)

    data['application_status'] = 'REJ'
    data['decision_reason'] = 'Test'

    put_resp = test_client.put(
        f'/mines/{explosives_permit_amendment.mine_guid}/explosives-permits-amendment/{explosives_permit_amendment.explosives_permit_amendment_guid}',
        headers=auth_headers['full_auth_header'],
        json=data)
    put_data = json.loads(put_resp.data.decode())

    assert put_resp.status_code == 200, put_resp.response

    assert put_data['application_status'] == data['application_status']
    assert put_data['decision_reason'] == data['decision_reason']
    assert put_data['decision_timestamp'] != None


def test_delete_explosives_permit_amendment(test_client, db_session, auth_headers):

    explosives_permit_amendment = ExplosivesPermitAmendmentFactory()

    delete_resp = test_client.delete(
        f'/mines/{explosives_permit_amendment.mine_guid}/explosives-permits-amendment/{explosives_permit_amendment.explosives_permit_amendment_guid}',
        headers=auth_headers['full_auth_header'])

    assert delete_resp.status_code == 204
