import json, uuid
from tests.constants import TEST_MINE_NO
from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointment

# GET
def test_get_mine_manager_history_csv_by_mine_no_history_not_found(test_client, auth_headers):
    get_resp = test_client.get(
        '/mines/relationship-types/csv?mine_no=' + TEST_MINE_NO, headers=auth_headers['full_auth_header'])
    assert get_resp.status_code == 404
