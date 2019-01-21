import json, uuid
from unittest import mock
from tests.constants import TEST_MINE_NO, TEST_MINE_GUID
from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointment

class MockResponse:
    def __init__(self, json_data, status_code):
        self.json_data = json_data
        self.status_code = status_code

    def json(self):
        return self.json_data

# GET
def test_get_mine_manager_history_csv_by_mine_no(test_client, auth_headers):

    with mock.patch('requests.get') as mock_request:
        mock_request.return_value = MockResponse({
            'status': 200,
            'guid': TEST_MINE_GUID
        }, 200)
        get_resp = test_client.get(
            '/parties/mines/manager-history/csv?mine_no=' + TEST_MINE_NO, headers=auth_headers['admin_only_auth_header'])
        assert get_resp.status_code == 200
