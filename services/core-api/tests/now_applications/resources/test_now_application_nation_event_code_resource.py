import json
from unittest.mock import patch

from tests.now_application_factories import NOWApplicationNationEventCodeFactory

@patch("app.api.now_applications.resources.now_application_nation_event_code_resource.is_feature_enabled")
def test_get_now_application_nation_event_codes_success(
    mock_feature_flag,
    test_client,
    db_session,
    auth_headers,
):
    mock_feature_flag.return_value = True

    inactive_code = NOWApplicationNationEventCodeFactory(
        description="Test inactive code",
        active_ind=False,
        display_order=901,
    )
    active_code_1 = NOWApplicationNationEventCodeFactory(
        description="Test active code 1",
        active_ind=True,
        display_order=902,
    )
    active_code_2 = NOWApplicationNationEventCodeFactory(
        description="Test active code 2",
        active_ind=True,
        display_order=903,
    )

    get_resp = test_client.get(
        "/now-applications/nation-event-codes",
        headers=auth_headers["full_auth_header"],
    )
    get_data = json.loads(get_resp.data.decode())

    assert get_resp.status_code == 200

    codes = [record["now_application_nation_event_code"] for record in get_data["records"]]

    assert inactive_code.now_application_nation_event_code not in codes
    assert active_code_1.now_application_nation_event_code in codes
    assert active_code_2.now_application_nation_event_code in codes