import json
import uuid

from app.api.mines.permits.permit_conditions.models.permit_condition_category import (
    PermitConditionCategory,
)
from tests.factories import UserFactory, create_mine_and_permit

ASSIGN_USER_DATA = {
    "assigned_review_user": str(uuid.uuid4()),
    "condition_category_code": "test_category_code",
}


def test_post_assign_user_to_permit_condition_category_success(test_client, db_session, auth_headers):
    """Should successfully assign a user to a permit condition category."""
    mine, permit = create_mine_and_permit()
    permit_amendment = permit.permit_amendments[0]
    user = UserFactory(sub=ASSIGN_USER_DATA['assigned_review_user'])
    PermitConditionCategory.create(
        condition_category_code=ASSIGN_USER_DATA['condition_category_code'],
        step='a',
        description='Test category',
        display_order=1,
        permit_amendment_id=permit_amendment.permit_amendment_id,
    )

    post_resp = test_client.post(
        '/mines/permits/condition-category/assign-review-user',
        headers=auth_headers['full_auth_header'],
        json=ASSIGN_USER_DATA,
    )
    assert post_resp.status_code == 200
    post_data = json.loads(post_resp.data.decode())

    assert post_data["condition_category_code"] == ASSIGN_USER_DATA['condition_category_code']
    assert post_data["assigned_review_user"]["sub"] == user.sub


def test_post_assign_user_to_permit_condition_category_missing_user(test_client, db_session, auth_headers):
    """Should return 400 if assigned_review_user is missing."""
    mine, permit = create_mine_and_permit()
    permit_amendment = permit.permit_amendments[0]
    PermitConditionCategory.create(
        condition_category_code=ASSIGN_USER_DATA['condition_category_code'],
        step='a',
        description='Test category',
        display_order=1,
        permit_amendment_id=permit_amendment.permit_amendment_id,
    )
    data = {k: v for k, v in ASSIGN_USER_DATA.items() if k != 'assigned_review_user'}

    post_resp = test_client.post(
        '/mines/permits/condition-category/assign-review-user',
        headers=auth_headers['full_auth_header'],
        json=data,
    )

    assert post_resp.status_code == 400
    post_data = json.loads(post_resp.data.decode())
    assert post_data["message"] == "Input payload validation failed"


def test_post_assign_user_to_permit_condition_category_missing_category(test_client, db_session, auth_headers):
    """Should return 400 if condition_category_code is missing."""
    user = UserFactory(sub=ASSIGN_USER_DATA['assigned_review_user'])
    data = {k: v for k, v in ASSIGN_USER_DATA.items() if k != 'condition_category_code'}

    post_resp = test_client.post(
        '/mines/permits/condition-category/assign-review-user',
        headers=auth_headers['full_auth_header'],
        json=data,
    )

    assert post_resp.status_code == 400
    post_data = json.loads(post_resp.data.decode())
    assert post_data["message"] == "Input payload validation failed"


def test_put_unassign_user_from_permit_condition_category_success(test_client, db_session, auth_headers):
    """Should successfully unassign a user from a permit condition category."""
    mine, permit = create_mine_and_permit()
    permit_amendment = permit.permit_amendments[0]
    PermitConditionCategory.create(
        condition_category_code=ASSIGN_USER_DATA['condition_category_code'],
        step='a',
        description='Test category',
        display_order=1,
        permit_amendment_id=permit_amendment.permit_amendment_id,
    )

    put_resp = test_client.put(
        '/mines/permits/condition-category/assign-review-user',
        headers=auth_headers['full_auth_header'],
        json={"condition_category_code": ASSIGN_USER_DATA['condition_category_code']},
    )
    assert put_resp.status_code == 200
    put_data = json.loads(put_resp.data.decode())

    assert put_data["condition_category_code"] == ASSIGN_USER_DATA['condition_category_code']
    assert put_data["assigned_review_user"]["sub"] is None


def test_put_unassign_user_from_permit_condition_category_missing_category(test_client, db_session, auth_headers):
    """Should return 400 if condition_category_code is missing."""
    data = {}

    put_resp = test_client.put(
        '/mines/permits/condition-category/assign-review-user',
        headers=auth_headers['full_auth_header'],
        json=data,
    )
    assert put_resp.status_code == 400
    put_data = json.loads(put_resp.data.decode())
    assert put_data["message"] == "Input payload validation failed"


def test_put_unassign_user_from_permit_condition_category_not_found(test_client, db_session, auth_headers):
    """Should return 404 if the condition_category_code doesn't exist."""
    put_resp = test_client.put(
        '/mines/permits/condition-category/assign-review-user',
        headers=auth_headers['full_auth_header'],
        json={"condition_category_code": "nonexistent_category_code"},
    )
    assert put_resp.status_code == 404
    post_data = json.loads(put_resp.data.decode())
    assert "404 Not Found: PermitConditionCategory not found" in post_data["message"]