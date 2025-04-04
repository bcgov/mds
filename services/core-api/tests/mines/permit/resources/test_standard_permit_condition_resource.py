import json
import uuid

from flask import current_app
from app.api.mines.permits.permit_conditions.models.standard_permit_conditions import StandardPermitConditions
from tests.factories import StandardPermitConditionsFactory

NOTICE_OF_WORK_TYPE ='SAG'

STD_PERMIT_CONDITIONS_DATA = {
    'notice_of_work_type': NOTICE_OF_WORK_TYPE,
    'condition_category_code': 'HSC',
    "parent_permit_condition_id": None,
    "top_level_parent_permit_condition_id": None,
    'condition_type_code': 'LIS',
    'condition': 'test',
    'display_order': 1}


def test_get_standard_permit_not_found(test_client, db_session, auth_headers):
    notice_of_work_type = 'TEST'
    get_resp = test_client.get(
        f'/mines/permits/standard-conditions/{notice_of_work_type}',
        headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert 'No standard permit conditions found' in get_data['message']
    assert get_resp.status_code == 404


def test_get_standard_permit_by_notice_of_work_type(test_client, db_session, auth_headers):
    standard_permit_condition = StandardPermitConditionsFactory()
    notice_of_work_type= standard_permit_condition.notice_of_work_type

    get_resp = test_client.get(
        f'/mines/permits/standard-conditions/{notice_of_work_type}',
        headers=auth_headers['full_auth_header'])
    
    assert get_resp.status_code == 200


def test_post_standard_permit_conditions(test_client, db_session, auth_headers):
    data = {
        "standard_permit_condition": STD_PERMIT_CONDITIONS_DATA
    }

    post_resp = test_client.post(
        f'/mines/permits/standard-conditions/{NOTICE_OF_WORK_TYPE}',
        headers=auth_headers['full_auth_header'],
        json=data)

    assert post_resp.status_code == 201, post_resp.response
    

def test_put_standard_permit(test_client, db_session, auth_headers):
    standard_permit_condition = StandardPermitConditionsFactory()

    put_resp = test_client.put(
        f'/mines/permits/standard-conditions/{standard_permit_condition.standard_permit_condition_guid}',
        headers=auth_headers['full_auth_header'],
        json=STD_PERMIT_CONDITIONS_DATA)

    assert put_resp.status_code == 200


def test_put_standard_permit(test_client, db_session, auth_headers):
    standard_permit_condition = StandardPermitConditionsFactory()

    put_resp = test_client.put(
        f'/mines/permits/standard-conditions/{uuid.uuid4()}',
        headers=auth_headers['full_auth_header'],
        json=STD_PERMIT_CONDITIONS_DATA)

    assert put_resp.status_code == 200


def test_delete_standard_permit(test_client, db_session, auth_headers):
    standard_permit_condition = StandardPermitConditionsFactory()

    del_resp = test_client.delete(
        f'/mines/permits/standard-conditions/{standard_permit_condition.standard_permit_condition_guid}',
        headers=auth_headers['full_auth_header'])

    assert del_resp.status_code == 204



def test_delete_not_found_standard_permit(test_client, db_session, auth_headers):
    standard_permit_guid = uuid.uuid4()

    del_resp = test_client.delete(
        f'/mines/permits/standard-conditions/{standard_permit_guid}',
        headers=auth_headers['full_auth_header'])

    del_data = json.loads(del_resp.data.decode())

    assert 'No standard permit condition found with that guid.' in del_data['message']
    assert del_resp.status_code == 400
