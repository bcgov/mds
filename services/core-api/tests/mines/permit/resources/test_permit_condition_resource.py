import json, pytest, uuid
from datetime import datetime, timedelta
from dateutil import parser
from app.api.mines.permits.permit_conditions.models.permit_conditions import PermitConditions


from tests.factories import create_mine_and_permit

# POST
def test_get_permit_conditions_by_permit_amendment_by_guid(test_client, db_session, auth_headers):
    mine, permit = create_mine_and_permit()
    permit_amendment = permit.permit_amendments[0]

    data = {
        "permit_condition": {
            "condition": "test",
            "condition_category_code": "GEC",
            "parent_permit_condition_id": None,
            "display_order": 3,
            "condition_type_code": "LIS"
        }
    }
    post_resp = test_client.post(
        f'/mines/{permit_amendment.mine_guid}/permits/{permit_amendment.permit_guid}/amendments/{permit_amendment.permit_amendment_guid}/conditions',
        headers=auth_headers['full_auth_header'],
        json=data)
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 201, post_resp.response
    assert str(post_data['permit_amendment_id']) == str(permit_amendment.permit_amendment_id)

# DELETE
def test_delete_permit_condition(test_client, db_session, auth_headers):
    mine, permit = create_mine_and_permit()
    permit_amendment = permit.permit_amendments[0]
    condition = permit_amendment.conditions[0]

    delete_resp = test_client.delete(
        f'/mines/{permit_amendment.mine_guid}/permits/{permit_amendment.permit_guid}/amendments/{permit_amendment.permit_amendment_guid}/conditions/{condition.permit_condition_guid}',
        headers=auth_headers['full_auth_header'])

    # the API returned success
    assert delete_resp.status_code == 204
    # the first condition should now be deleted
    assert permit_amendment.conditions[0].permit_condition_guid != condition.permit_condition_guid
    # deleted items should be filtered out
    assert permit_amendment.conditions[0].deleted_ind != True


# PUT
def test_put_permit_condition(test_client, db_session, auth_headers):
    mine, permit = create_mine_and_permit()
    permit_amendment = permit.permit_amendments[0]
    condition = permit_amendment.conditions[0]

    data = {
            "permit_condition_guid": condition.permit_condition_guid,
            "permit_amendment_id": condition.permit_amendment_id,
            "condition_category_code": condition.condition_category_code,
            "condition_type_code": condition.condition_type_code,
            "condition": "edited",
            "display_order": "2",
        }

    put_resp = test_client.put(
        f'/mines/{permit_amendment.mine_guid}/permits/{permit_amendment.permit_guid}/amendments/{permit_amendment.permit_amendment_guid}/conditions/{condition.permit_condition_guid}',
        headers=auth_headers['full_auth_header'],
        json=data)

    # the API returned success
    assert put_resp.status_code == 200
