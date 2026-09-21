import json
from unittest.mock import patch

from tests.now_application_factories import (
    NOWApplicationIdentityFactory,
    NOWApplicationNationFactory,
    NOWApplicationNationEventCodeFactory,
)

JWT_MANAGER_PATCH = "app.api.utils.access_decorators.getJwtManager"
FEATURE_FLAG_PATCH = "app.api.now_applications.resources.now_application_nation_event_resource.is_feature_enabled"

@patch(JWT_MANAGER_PATCH)
@patch(FEATURE_FLAG_PATCH)
def test_create_now_application_nation_event_success(
    mock_feature_flag,
    mock_get_jwt_manager,
    test_client,
    db_session,
    auth_headers,
):
    mock_feature_flag.return_value = True
    mock_get_jwt_manager.return_value.requires_roles.return_value = lambda func: func

    now_application_identity = NOWApplicationIdentityFactory()
    now_application_nation = NOWApplicationNationFactory(
        now_application_guid=now_application_identity.now_application_guid
    )
    event_code = NOWApplicationNationEventCodeFactory(
        description="Information sent",
        active_ind=True,
        display_order=10,
    )

    db_session.commit()

    payload = {
        "now_application_nation_event_code": event_code.now_application_nation_event_code,
        "event_from": "Proponent",
        "event_to": "Nation",
        "start_date": "2026-04-30T00:00:00",
        "end_date": "2026-05-01T00:00:00",
    }

    post_resp = test_client.post(
        f"/now-applications/{now_application_identity.now_application_guid}/nation/{now_application_nation.now_application_nation_guid}/event",
        json=payload,
        headers=auth_headers["full_auth_header"],
    )

    assert post_resp.status_code == 201

    post_data = json.loads(post_resp.data.decode())

    assert post_data["event_name"] == "Information sent"
    assert post_data["event_from"] == "Proponent"
    assert post_data["event_to"] == "Nation"

@patch(JWT_MANAGER_PATCH)
@patch(FEATURE_FLAG_PATCH)
def test_create_now_application_nation_event_nation_not_found(
    mock_feature_flag,
    mock_get_jwt_manager,
    test_client,
    db_session,
    auth_headers,
):
    mock_feature_flag.return_value = True
    mock_get_jwt_manager.return_value.requires_roles.return_value = lambda func: func

    now_application_identity = NOWApplicationIdentityFactory()
    NOWApplicationNationEventCodeFactory(
        description="Information sent",
        active_ind=True,
        display_order=10,
    )

    payload = {
        "now_application_nation_event_code": "INS",
        "event_from": "MDS",
        "event_to": "Nation",
        "start_date": "2026-04-30T00:00:00",
    }

    post_resp = test_client.post(
        f"/now-applications/{now_application_identity.now_application_guid}/nation/11111111-1111-1111-1111-111111111111/event",
        json=payload,
        headers=auth_headers["full_auth_header"],
    )

    assert post_resp.status_code == 404

@patch(JWT_MANAGER_PATCH)
@patch(FEATURE_FLAG_PATCH)
def test_create_now_application_nation_event_invalid_event_code(
    mock_feature_flag,
    mock_get_jwt_manager,
    test_client,
    db_session,
    auth_headers,
):
    mock_feature_flag.return_value = True
    mock_get_jwt_manager.return_value.requires_roles.return_value = lambda func: func

    now_application_identity = NOWApplicationIdentityFactory()
    now_application_nation = NOWApplicationNationFactory(
        now_application_guid=now_application_identity.now_application_guid
    )

    payload = {
        "now_application_nation_event_code": "BAD",
        "event_from": "Proponent",
        "event_to": "Nation",
        "start_date": "2026-04-30T00:00:00",
    }

    post_resp = test_client.post(
        f"/now-applications/{now_application_identity.now_application_guid}/nation/{now_application_nation.now_application_nation_guid}/event",
        json=payload,
        headers=auth_headers["full_auth_header"],
    )

    assert post_resp.status_code == 400