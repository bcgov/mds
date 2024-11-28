import json
import uuid

from app.api.mines.permits.permit_conditions.models.permit_condition_category import (
    PermitConditionCategory,
)
from tests.factories import MineFactory, PermitConditionsFactory, create_mine_and_permit

PERMIT_CONDITION_CATEGORY_DATA = {
    'step': "A",
    'description': 'Test Category',
    'display_order': 1
}

def test_post_permit_condition_category_missing_step(test_client, db_session, auth_headers):
    """Should return 400 if step is missing from payload"""
    mine, permit = create_mine_and_permit()
    permit_amendment = permit.permit_amendments[0]
    data = {k: v for k, v in PERMIT_CONDITION_CATEGORY_DATA.items() if k != 'step'}

    post_resp = test_client.post(
        f'/mines/{mine.mine_guid}/permits/{permit.permit_guid}/amendments/{permit_amendment.permit_amendment_guid}/condition-categories',
        headers=auth_headers['full_auth_header'],
        json=data)

    assert post_resp.status_code == 400
    post_data = json.loads(post_resp.data.decode())
    assert 'step' in post_data['errors']

def test_post_permit_condition_category_missing_description(test_client, db_session, auth_headers):
    """Should return 400 if description is missing from payload"""
    mine, permit = create_mine_and_permit()
    permit_amendment = permit.permit_amendments[0]
    data = {k: v for k, v in PERMIT_CONDITION_CATEGORY_DATA.items() if k != 'description'}

    post_resp = test_client.post(
        f'/mines/{mine.mine_guid}/permits/{permit.permit_guid}/amendments/{permit_amendment.permit_amendment_guid}/condition-categories',
        headers=auth_headers['full_auth_header'],
        json=data)
    
    assert post_resp.status_code == 400
    post_data = json.loads(post_resp.data.decode())
    assert 'description' in post_data['errors']

def test_post_permit_condition_category_missing_display_order(test_client, db_session, auth_headers):
    """Should return 400 if display_order is missing from payload"""
    mine, permit = create_mine_and_permit()
    permit_amendment = permit.permit_amendments[0]
    data = {k: v for k, v in PERMIT_CONDITION_CATEGORY_DATA.items() if k != 'display_order'}

    post_resp = test_client.post(
        f'/mines/{mine.mine_guid}/permits/{permit.permit_guid}/amendments/{permit_amendment.permit_amendment_guid}/condition-categories',
        headers=auth_headers['full_auth_header'],
        json=data)
    
    assert post_resp.status_code == 400
    post_data = json.loads(post_resp.data.decode())
    assert 'display_order' in post_data['errors']

def test_post_permit_condition_category(test_client, db_session, auth_headers):
    """Should create a new permit condition category"""
    mine, permit = create_mine_and_permit()
    permit_amendment = permit.permit_amendments[0]

    post_resp = test_client.post(
        f'/mines/{mine.mine_guid}/permits/{permit.permit_guid}/amendments/{permit_amendment.permit_amendment_guid}/condition-categories',
        headers=auth_headers['full_auth_header'],
        json=PERMIT_CONDITION_CATEGORY_DATA)
    assert post_resp.status_code == 201
    post_data = json.loads(post_resp.data.decode())
    assert post_data['description'] == PERMIT_CONDITION_CATEGORY_DATA['description']
    assert post_data['step'] == PERMIT_CONDITION_CATEGORY_DATA['step']
    assert post_data['display_order'] == PERMIT_CONDITION_CATEGORY_DATA['display_order']

def test_post_permit_condition_category_mine_not_found(test_client, db_session, auth_headers):
    """Should return 400 if mine not found"""
    post_resp = test_client.post(
        f'/mines/{uuid.uuid4()}/permits/{uuid.uuid4()}/amendments/{uuid.uuid4()}/condition-categories',
        headers=auth_headers['full_auth_header'],
        json=PERMIT_CONDITION_CATEGORY_DATA)
    
    assert post_resp.status_code == 400
    post_data = json.loads(post_resp.data.decode())
    assert post_data['message'] == '400 Bad Request: Mine not found.'

def test_post_permit_condition_category_permit_not_found(test_client, db_session, auth_headers):
    """Should return 400 if permit not found"""
    mine = MineFactory()
    
    post_resp = test_client.post(
        f'/mines/{mine.mine_guid}/permits/{uuid.uuid4()}/amendments/{uuid.uuid4()}/condition-categories',
        headers=auth_headers['full_auth_header'],
        json=PERMIT_CONDITION_CATEGORY_DATA)
    
    assert post_resp.status_code == 400
    post_data = json.loads(post_resp.data.decode())
    assert post_data['message'] == '400 Bad Request: Permit not found.'

def test_post_permit_condition_category_permit_amendment_not_found(test_client, db_session, auth_headers):
    """Should return 400 if permit amendment not found"""
    mine, permit = create_mine_and_permit()
    
    post_resp = test_client.post(
        f'/mines/{mine.mine_guid}/permits/{permit.permit_guid}/amendments/{uuid.uuid4()}/condition-categories',
        headers=auth_headers['full_auth_header'],
        json=PERMIT_CONDITION_CATEGORY_DATA)
    
    assert post_resp.status_code == 400
    post_data = json.loads(post_resp.data.decode())
    assert post_data['message'] == '400 Bad Request: Permit Amendment not found.'

def test_post_permit_condition_category_mine_amendment_permit_mismatch(test_client, db_session, auth_headers):
    """Should return 400 if mine and  don't match"""

    mine, permit = create_mine_and_permit()
    other_mine, other_permit = create_mine_and_permit()
    post_resp = test_client.post(
        f'/mines/{mine.mine_guid}/permits/{other_permit.permit_guid}/amendments/{uuid.uuid4()}/condition-categories',
        headers=auth_headers['full_auth_header'],
        json=PERMIT_CONDITION_CATEGORY_DATA)
    
    assert post_resp.status_code == 400
    post_data = json.loads(post_resp.data.decode())
    assert post_data['message'] == '400 Bad Request: Permit mine_guid and supplied mine_guid mismatch.'

def test_delete_permit_condition_category(test_client, db_session, auth_headers):
    """Should delete a permit condition category"""
    mine, permit = create_mine_and_permit()
    permit_amendment = permit.permit_amendments[0]

    code = str(uuid.uuid4())
    PermitConditionCategory.create(
        condition_category_code=code,
        step='a',
        description='Test category',
        display_order=1,
        permit_amendment_id=permit_amendment.permit_amendment_id,
    )

    categories = PermitConditionCategory.find_by_permit_amendment_id(permit_amendment.permit_amendment_id)

    # Delete the category
    delete_resp = test_client.delete(
        f'/mines/{mine.mine_guid}/permits/{permit.permit_guid}/amendments/{permit_amendment.permit_amendment_guid}/condition-categories/{code}',
        headers=auth_headers['full_auth_header'])

    assert delete_resp.status_code == 204

    after_categories = PermitConditionCategory.find_by_permit_amendment_id(permit_amendment.permit_amendment_id)

    assert len(after_categories) == len(categories) - 1

def test_delete_permit_condition_category_with_conditions(test_client, db_session, auth_headers):
    """Should return 400 if category has conditions"""
    mine, permit = create_mine_and_permit() 
    permit_amendment = permit.permit_amendments[0]

    # Create category
    code = str(uuid.uuid4())
    PermitConditionCategory.create(
        condition_category_code=code,
        step='a',
        description='Test category',
        display_order=1,
        permit_amendment_id=permit_amendment.permit_amendment_id,
    )
    
    PermitConditionsFactory(condition_category_code=code, permit_amendment=permit_amendment)
    # Try to delete category
    delete_resp = test_client.delete(
        f'/mines/{mine.mine_guid}/permits/{permit.permit_guid}/amendments/{permit_amendment.permit_amendment_guid}/condition-categories/{code}',
        headers=auth_headers['full_auth_header'])

    assert delete_resp.status_code == 400
    delete_data = json.loads(delete_resp.data.decode())
    assert delete_data['message'] == '400 Bad Request: Cannot delete a category that has conditions associated with it'


def test_delete_permit_condition_category_not_associated(test_client, db_session, auth_headers):
    """Should return 400 if category is not associated with permit amendment"""
    mine, permit = create_mine_and_permit() 
    permit_amendment = permit.permit_amendments[0]

    # Create category
    code = str(uuid.uuid4())
    PermitConditionCategory.create(
        condition_category_code=code,
        step='a',
        description='Test category',
        display_order=1,
        permit_amendment_id=None
    )
    
    PermitConditionsFactory(condition_category_code=code, permit_amendment=permit_amendment)
    # Try to delete category
    delete_resp = test_client.delete(
        f'/mines/{mine.mine_guid}/permits/{permit.permit_guid}/amendments/{permit_amendment.permit_amendment_guid}/condition-categories/{code}',
        headers=auth_headers['full_auth_header'])

    assert delete_resp.status_code == 400
    delete_data = json.loads(delete_resp.data.decode())
    assert delete_data['message'] == '400 Bad Request: Permit category is not associated with this permit amendment.'

def test_delete_permit_condition_category_not_found(test_client, db_session, auth_headers):
    """Should return 400 if category not found"""
    mine, permit = create_mine_and_permit()
    permit_amendment = permit.permit_amendments[0]

    delete_resp = test_client.delete(
        f'/mines/{mine.mine_guid}/permits/{permit.permit_guid}/amendments/{permit_amendment.permit_amendment_guid}/condition-categories/{uuid.uuid4()}',
        headers=auth_headers['full_auth_header'])

    assert delete_resp.status_code == 400
    delete_data = json.loads(delete_resp.data.decode())
    assert delete_data['message'] == '400 Bad Request: Permit Condition Category not found.'

def test_put_permit_condition_category(test_client, db_session, auth_headers):
    """Should update an existing permit condition category"""
    mine, permit = create_mine_and_permit()
    permit_amendment = permit.permit_amendments[0]

    # Create initial category
    code = str(uuid.uuid4())
    category = PermitConditionCategory.create(
        condition_category_code=code,
        step='a',
        description='Initial category',
        display_order=1,
        permit_amendment_id=permit_amendment.permit_amendment_id,
    )

    update_data = {
        'step': 'b',
        'description': 'Updated category',
        'display_order': 1
    }

    put_resp = test_client.put(
        f'/mines/{mine.mine_guid}/permits/{permit.permit_guid}/amendments/{permit_amendment.permit_amendment_guid}/condition-categories/{code}',
        headers=auth_headers['full_auth_header'],
        json=update_data)
    
    assert put_resp.status_code == 200
    put_data = put_resp.json
    assert put_data['step'] == update_data['step']
    assert put_data['description'] == update_data['description']
    assert put_data['display_order'] == update_data['display_order']


def test_put_permit_condition_category_not_found(test_client, db_session, auth_headers):
    """Should return 400 if category not found"""
    mine, permit = create_mine_and_permit()
    permit_amendment = permit.permit_amendments[0]

    update_data = {
        'step': 'b',
        'description': 'Updated category',
        'display_order': 1
    }

    put_resp = test_client.put(
        f'/mines/{mine.mine_guid}/permits/{permit.permit_guid}/amendments/{permit_amendment.permit_amendment_guid}/condition-categories/{uuid.uuid4()}',
        headers=auth_headers['full_auth_header'],
        json=update_data)
    
    assert put_resp.status_code == 400
    put_data = put_resp.json
    assert 'Permit Condition Category not found' in put_data['message']

def test_put_permit_condition_category_mine_amendment_permit_mismatch(test_client, db_session, auth_headers):
    """Should return 400 if mine and permit don't match"""
    mine, permit = create_mine_and_permit()
    other_mine, other_permit = create_mine_and_permit()
    permit_amendment = permit.permit_amendments[0]

    # Create initial category
    code = str(uuid.uuid4())
    PermitConditionCategory.create(
        condition_category_code=code,
        step='a',
        description='Initial category',
        display_order=1,
        permit_amendment_id=permit_amendment.permit_amendment_id,
    )

    update_data = {
        'step': 'b',
        'description': 'Updated category',
        'display_order': 1
    }

    put_resp = test_client.put(
        f'/mines/{mine.mine_guid}/permits/{other_permit.permit_guid}/amendments/{permit_amendment.permit_amendment_guid}/condition-categories/{code}',
        headers=auth_headers['full_auth_header'],
        json=update_data)
    
    assert put_resp.status_code == 400
    put_data = put_resp.json
    assert 'Permit mine_guid and supplied mine_guid mismatch' in put_data['message']

def test_put_permit_condition_category_reorder(test_client, db_session, auth_headers):
    """Should update display order and reorder categories"""
    mine, permit = create_mine_and_permit()
    permit_amendment = permit.permit_amendments[0]

    # Create initial categories
    category1 = PermitConditionCategory.create(
        condition_category_code='Category 1',
        step='a',
        description='Category 1',
        display_order=0,
        permit_amendment_id=permit_amendment.permit_amendment_id,
    )
    category2 = PermitConditionCategory.create(
        condition_category_code='Category 2',
        step='b',
        description='Category 2',
        display_order=1,
        permit_amendment_id=permit_amendment.permit_amendment_id,
    )
    category3 = PermitConditionCategory.create(
        condition_category_code='Category 3',
        step='c',
        description='Category 3',
        display_order=2,
        permit_amendment_id=permit_amendment.permit_amendment_id,
    )

    update_data = {
        'step': 'b',
        'description': 'Updated Category 2',
        'display_order': 0  # Move to the first position
    }

    put_resp = test_client.put(
        f'/mines/{mine.mine_guid}/permits/{permit.permit_guid}/amendments/{permit_amendment.permit_amendment_guid}/condition-categories/{category2.condition_category_code}',
        headers=auth_headers['full_auth_header'],
        json=update_data)
    
    assert put_resp.status_code == 200
    put_data = put_resp.json
    assert put_data['step'] == update_data['step']
    assert put_data['description'] == update_data['description']
    assert put_data['display_order'] == update_data['display_order']

    db_session.flush()

    # Verify the reordering
    categories = PermitConditionCategory.find_by_permit_amendment_id(permit_amendment.permit_amendment_id)
    categories = sorted(categories, key=lambda x: x.display_order)
    assert categories[0].condition_category_code == category2.condition_category_code
    assert categories[1].condition_category_code == category1.condition_category_code
    assert categories[2].condition_category_code == category3.condition_category_code

def test_put_permit_condition_category_invalid_display_order_greater(test_client, db_session, auth_headers):
    """Should return 400 if display_order is greater than the number of categories"""
    mine, permit = create_mine_and_permit()
    permit_amendment = permit.permit_amendments[0]

    # Create initial category
    category = PermitConditionCategory.create(
        condition_category_code=str(uuid.uuid4()),
        step='a',
        description='Initial category',
        display_order=1,
        permit_amendment_id=permit_amendment.permit_amendment_id,
    )

    update_data = {
        'step': 'b',
        'description': 'Updated category',
        'display_order': 5  # Invalid display order
    }

    put_resp = test_client.put(
        f'/mines/{mine.mine_guid}/permits/{permit.permit_guid}/amendments/{permit_amendment.permit_amendment_guid}/condition-categories/{category.condition_category_code}',
        headers=auth_headers['full_auth_header'],
        json=update_data)
    
    assert put_resp.status_code == 400
    put_data = put_resp.json
    assert 'Display order cannot be greater than the number of categories' in put_data['message']

def test_put_permit_condition_category_invalid_display_order_negative(test_client, db_session, auth_headers):
    """Should return 400 if display_order is negative"""
    mine, permit = create_mine_and_permit()
    permit_amendment = permit.permit_amendments[0]

    # Create initial category
    category = PermitConditionCategory.create(
        condition_category_code=str(uuid.uuid4()),
        step='a',
        description='Initial category',
        display_order=1,
        permit_amendment_id=permit_amendment.permit_amendment_id,
    )

    update_data = {
        'step': 'b',
        'description': 'Updated category',
        'display_order': -1  # Invalid display order
    }

    put_resp = test_client.put(
        f'/mines/{mine.mine_guid}/permits/{permit.permit_guid}/amendments/{permit_amendment.permit_amendment_guid}/condition-categories/{category.condition_category_code}',
        headers=auth_headers['full_auth_header'],
        json=update_data)
    
    assert put_resp.status_code == 400
    put_data = put_resp.json
    assert 'Display order must be >= 0' in put_data['message']