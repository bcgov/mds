import json, pytest, uuid
from datetime import datetime, timedelta
from dateutil import parser
from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointment

from tests.factories import PermitFactory, PermitAmendmentFactory, PartyFactory, MinePartyAppointmentFactory, create_mine_and_permit


# POST
def test_get_permit_conditions_by_permit_amendment_by_guid(
        test_client, db_session, auth_headers):
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
    assert str(post_data['permit_amendment_id']) == str(
        permit_amendment.permit_amendment_id)
