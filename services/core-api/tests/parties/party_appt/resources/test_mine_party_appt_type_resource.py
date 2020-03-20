import json

from app.api.parties.party_appt.models.mine_party_appt_type import MinePartyAppointmentType


# GET
def test_get_mine_party_appt_type(test_client, db_session, auth_headers):
    get_resp = test_client.get(
        '/parties/mines/relationship-types', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert len(get_data) == len(MinePartyAppointmentType.get_active())
