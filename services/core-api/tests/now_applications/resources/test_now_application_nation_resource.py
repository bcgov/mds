import json
from unittest.mock import patch

from tests.now_application_factories import (
    NOWApplicationIdentityFactory,
    NOWApplicationNationFactory,
    NOWApplicationNationStatusFactory,
)


FEATURE_FLAG_PATCH = "app.api.now_applications.resources.now_application_nation_resource.is_feature_enabled"
JWT_MANAGER_PATCH = "app.api.utils.access_decorators.getJwtManager"

@patch(FEATURE_FLAG_PATCH)
def test_get_now_application_nations_success(
    mock_feature_flag, test_client, db_session, auth_headers
):
    mock_feature_flag.return_value = True

    now_application_identity = NOWApplicationIdentityFactory()
    nation = NOWApplicationNationFactory(
        now_application_guid=now_application_identity.now_application_guid
    )

    db_session.commit()

    get_resp = test_client.get(
        f"/now-applications/{now_application_identity.now_application_guid}/nation",
        headers=auth_headers["full_auth_header"],
    )
    get_data = json.loads(get_resp.data.decode())

    assert get_resp.status_code == 200
    assert len(get_data["records"]) == 1
    assert get_data["records"][0]["now_application_nation_guid"] == str(
        nation.now_application_nation_guid
    )


@patch(FEATURE_FLAG_PATCH)
def test_get_now_application_nations_application_not_found(
    mock_feature_flag, test_client, db_session, auth_headers
):
    mock_feature_flag.return_value = True

    get_resp = test_client.get(
        "/now-applications/11111111-1111-1111-1111-111111111111/nation",
        headers=auth_headers["full_auth_header"],
    )

    assert get_resp.status_code == 404

@patch(JWT_MANAGER_PATCH)
@patch(FEATURE_FLAG_PATCH)
def test_create_now_application_nation_success(
    mock_feature_flag, mock_get_jwt_manager, test_client, db_session, auth_headers
):
    mock_feature_flag.return_value = True
    mock_get_jwt_manager.return_value.requires_roles.return_value = lambda func: func

    now_application_identity = NOWApplicationIdentityFactory()
    status = NOWApplicationNationStatusFactory(
        description="Active",
        active_ind=True,
        display_order=1,
    )

    db_session.commit()

    payload = {
        "now_application_nation_status_code": status.now_application_nation_status_code,
        "consultation_started_by_client": False,
        "due_date": "2026-05-01T00:00:00",
        "contact_organization_name": "Test Nation",
        "organization_guid": "organization-guid-1",
        "consultation_area_name": "Test Consultation Area",
        "consultation_area_guid": "consultation-area-guid-1",
        "consultation_area_update_date": "2026-04-30T00:00:00",
    }

    post_resp = test_client.post(
        f"/now-applications/{now_application_identity.now_application_guid}/nation",
        data=json.dumps(payload),
        headers=auth_headers["full_auth_header"],
        content_type="application/json",
    )
    post_data = json.loads(post_resp.data.decode())

    assert post_resp.status_code == 201
    assert post_data["status"] == status.description
    assert post_data["contact_organization_name"] == "Test Nation"
    assert post_data["organization_guid"] == "organization-guid-1"
    assert post_data["consultation_area_name"] == "Test Consultation Area"
    assert post_data["consultation_area_guid"] == "consultation-area-guid-1"

@patch(JWT_MANAGER_PATCH)
@patch(FEATURE_FLAG_PATCH)
def test_delete_now_application_nation_success(
    mock_feature_flag, mock_get_jwt_manager, test_client, db_session, auth_headers
):
    mock_feature_flag.return_value = True
    mock_get_jwt_manager.return_value.requires_roles.return_value = lambda func: func

    now_application_identity = NOWApplicationIdentityFactory()
    nation = NOWApplicationNationFactory(
        now_application_guid=now_application_identity.now_application_guid
    )

    db_session.commit()

    delete_resp = test_client.delete(
        f"/now-applications/{now_application_identity.now_application_guid}/nation/{nation.now_application_nation_guid}",
        headers=auth_headers["full_auth_header"],
    )

    assert delete_resp.status_code == 204