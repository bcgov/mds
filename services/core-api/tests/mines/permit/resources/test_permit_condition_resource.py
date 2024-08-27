import json, pytest, uuid
from datetime import datetime, timedelta
from dateutil import parser
from app.api.mines.permits.permit_conditions.models.permit_conditions import PermitConditions
from app.api.mines.response_models import PermitCondition

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

    response_json = put_resp.json
    assert "permit_condition_guid" in response_json
    permit_condition_guid = response_json["permit_condition_guid"]

    # Fetch the updated condition using the class method
    updated_condition = PermitConditions.find_by_permit_condition_guid(permit_condition_guid)

    # Access the versioning table
    version_records = list(updated_condition.versions)

    # Ensure there are version records
    assert len(version_records) == 1

    # Get the latest version record
    latest_version = version_records[len(version_records) - 1]

    # Assert the latest version has the updated values
    assert latest_version.condition == data['condition']

    assert latest_version.permit_amendment_id == data['permit_amendment_id']
    assert latest_version.condition_category_code == data['condition_category_code']
    assert latest_version.condition_type_code == data['condition_type_code']

    data_b = {
        "permit_condition_guid": condition.permit_condition_guid,
        "permit_amendment_id": condition.permit_amendment_id,
        "condition_category_code": condition.condition_category_code,
        "condition_type_code": condition.condition_type_code,
        "condition": "version 2",
        "display_order": "3",
    }

    put_resp_b = test_client.put(
        f'/mines/{permit_amendment.mine_guid}/permits/{permit_amendment.permit_guid}/amendments/{permit_amendment.permit_amendment_guid}/conditions/{condition.permit_condition_guid}',
        headers=auth_headers['full_auth_header'],
        json=data_b)

    assert put_resp_b.status_code == 200

    version_records = list(updated_condition.versions)

    # Ensure there are now 2 version records
    assert len(version_records) == 2

    latest_version = version_records[len(version_records) - 1]
    assert latest_version.condition == data_b['condition']
