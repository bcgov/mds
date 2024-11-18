import json
import uuid
from datetime import datetime, timedelta

import pytest
from app.api.mines.permits.permit_conditions.models.permit_condition_category import (
    PermitConditionCategory,
)
from app.api.mines.permits.permit_conditions.models.permit_conditions import (
    PermitConditions,
)
from app.api.mines.response_models import PermitCondition
from dateutil import parser
from tests.factories import PermitAmendmentFactory, create_mine_and_permit


# POST
def test_get_permit_conditions_by_permit_amendment_by_guid(test_client, db_session, auth_headers):
    mine, permit = create_mine_and_permit()
    permit_amendment = permit.permit_amendments[0]

    data = {
        "condition_category_code": "GEC",
        "condition_type_code": "LIS",
        "step": "A",
        "display_order": 4,
        "description": "TEST"
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

def test_get_permit_condition_categories(test_client, db_session, auth_headers):
    """Test getting all permit condition categories."""
    
    # Call the endpoint
    get_resp = test_client.get(
        '/mines/permits/condition-category-codes',
        headers=auth_headers['full_auth_header'])
    
    # Check response code
    assert get_resp.status_code == 200

    # Check response format
    get_data = get_resp.json
    assert 'records' in get_data
    
    # Verify records are returned
    assert len(get_data['records']) > 0
    
    # Check record structure
    first_record = get_data['records'][0]
    assert first_record['condition_category_code'] == 'GEC'
    assert first_record['description'] == 'General Conditions'
    assert first_record['display_order'] == 10
    assert first_record['step'] == 'A.'

def test_create_permit_condition_excludes_permit_amendment_specific_categories(test_client, db_session, auth_headers):
    """Test getting all permit condition categories."""
    
    def fetch_categories():
        # Call the endpoint
        get_resp = test_client.get(
            '/mines/permits/condition-category-codes',
            headers=auth_headers['full_auth_header'])
        
        assert get_resp.status_code == 200
        return get_resp.json['records']
    
    records = fetch_categories()
    assert len(records) > 0
    # Create new category and verify that it gets returned when
    # no permit amendment is specified
    PermitConditionCategory.create(
        condition_category_code='NEW',
        step='A',
        description='Test Category',
        display_order=1,
        permit_amendment_id=None
    )

    new_records = fetch_categories()

    assert len(new_records) == len(records) + 1

    # Create new category and verify that it does not get returned when
    # a permit amendment is specified
    mine, permit = create_mine_and_permit()

    permit_amendment = permit.permit_amendments[0]

    PermitConditionCategory.create(
        condition_category_code='ANOTHER',
        step='A',
        description='Test Category',
        display_order=1,
        permit_amendment_id=permit_amendment.permit_amendment_id
    )

    new_records = fetch_categories()

    assert len(new_records) == len(records) + 1
