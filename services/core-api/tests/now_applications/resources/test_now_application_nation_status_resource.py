from unittest.mock import patch

from tests.now_application_factories import NOWApplicationNationStatusFactory


FEATURE_FLAG_PATCH = "app.api.now_applications.resources.now_application_nation_status_resource.is_feature_enabled"


@patch(FEATURE_FLAG_PATCH)
def test_get_now_application_nation_status_success(
    mock_feature_flag,
    test_client,
    db_session,
    auth_headers,
):
    mock_feature_flag.return_value = True

    NOWApplicationNationStatusFactory(
        description="Inactive",
        active_ind=False,
        display_order=1,
    )
    active_status_1 = NOWApplicationNationStatusFactory(
        description="Active",
        active_ind=True,
        display_order=10,
    )
    active_status_2 = NOWApplicationNationStatusFactory(
        description="Closed",
        active_ind=True,
        display_order=20,
    )

    db_session.commit()

    get_resp = test_client.get(
        "/now-applications/nation-statuses",
        headers=auth_headers["full_auth_header"],
    )

    assert get_resp.status_code == 200

    data = get_resp.json["records"]
    returned_codes = [s["now_application_nation_status_code"] for s in data]

    assert active_status_1.now_application_nation_status_code in returned_codes
    assert active_status_2.now_application_nation_status_code in returned_codes

    inactive_codes = [s["now_application_nation_status_code"] for s in data if s["description"] == "Inactive"]
    assert inactive_codes == []