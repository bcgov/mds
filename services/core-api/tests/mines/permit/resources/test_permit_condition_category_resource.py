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

def test_get_permit_condition_categories_with_limit(test_client, db_session, auth_headers):
    """Test getting permit condition categories with a limit."""
    
    # Call the endpoint with limit parameter
    get_resp = test_client.get(
        '/mines/permits/condition-category-codes?limit=2',
        headers=auth_headers['full_auth_header'])
    
    # Check response code
    assert get_resp.status_code == 200

    # Check response format
    get_data = get_resp.json
    assert 'records' in get_data
    
    # Verify the number of records returned is equal to the limit
    assert len(get_data['records']) == 2

def test_get_permit_condition_categories_with_query(test_client, db_session, auth_headers):
    """Test getting permit condition categories with a query."""
    
    # Call the endpoint with query parameter
    get_resp = test_client.get(
        '/mines/permits/condition-category-codes?query=General',
        headers=auth_headers['full_auth_header'])
    
    # Check response code
    assert get_resp.status_code == 200

    # Check response format
    get_data = get_resp.json
    assert 'records' in get_data
    
    # Verify records are returned
    assert len(get_data['records']) > 0
    
    # Check that the returned records match the query
    for record in get_data['records']:
        assert 'General' in record['description']

def test_get_permit_condition_categories_with_exclude(test_client, db_session, auth_headers):
    """Test getting permit condition categories with exclude parameter."""
    
    # Call the endpoint with exclude parameter
    get_resp = test_client.get(
        '/mines/permits/condition-category-codes?exclude=GEC',
        headers=auth_headers['full_auth_header'])
    
    # Check response code
    assert get_resp.status_code == 200

    # Check response format
    get_data = get_resp.json
    assert 'records' in get_data
    
    # Verify records are returned
    assert len(get_data['records']) > 0
    
    # Check that the excluded code is not in the returned records
    for record in get_data['records']:
        assert record['condition_category_code'] != 'GEC'

def test_create_and_search_permit_condition_category(test_client, db_session, auth_headers):
    """Test creating a new permit condition category and searching for it."""
    
    mine, permit = create_mine_and_permit()

    permit_amendment = permit.permit_amendments[0]

    new_cat = PermitConditionCategory.create(
        condition_category_code='abc1234567',
        step='B',
        description='New Test Category',
        display_order=5,
        permit_amendment_id=permit_amendment.permit_amendment_id
    )

    # Search for the newly added category
    search_resp = test_client.get(
        f'/mines/permits/condition-category-codes?query=New%20Test%20Cat',
        headers=auth_headers['full_auth_header'])
    
    assert search_resp.status_code == 200
    search_data = search_resp.json
    assert 'records' in search_data
    assert len(search_data['records']) > 0

    # Verify the newly added category is in the search results
    found = False
    for record in search_data['records']:
        if record['condition_category_code'] == new_cat.condition_category_code:
            found = True
            assert record['description'] == new_cat.description
            assert record['display_order'] == new_cat.display_order
            assert record['step'] == new_cat.step
            break
    
    assert found

def test_get_permit_condition_categories_with_duplicate_descriptions(test_client, db_session, auth_headers):
    """Test getting permit condition categories when duplicate descriptions exist."""
    
    # Create two categories with the same description
    PermitConditionCategory.create(
        condition_category_code='DUP1',
        step='A',
        description='Duplicate Description',
        display_order=1,
        permit_amendment_id=None
    )

    PermitConditionCategory.create(
        condition_category_code='DUP2',
        step='B',
        description='Duplicate Description',
        display_order=2,
        permit_amendment_id=None
    )

    # Call the endpoint
    get_resp = test_client.get(
        '/mines/permits/condition-category-codes?query=Duplicate%20Description',
        headers=auth_headers['full_auth_header'])
    
    # Check response code
    assert get_resp.status_code == 200

    # Check response format
    get_data = get_resp.json
    assert 'records' in get_data
    
    # Verify records are returned
    assert len(get_data['records']) > 0
    
    # Check that only one of the duplicate descriptions is returned
    descriptions = [record['description'] for record in get_data['records']]
    assert descriptions.count('Duplicate Description') == 1

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

    nr = fetch_categories()

    assert len(nr) == len(records) + 1

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
