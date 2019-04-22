import json, uuid, pytest
from unittest import mock

from tests.factories import MineFactory, MinePartyAppointmentFactory


class MockResponse:
    def __init__(self, json_data, status_code):
        self.json_data = json_data
        self.status_code = status_code

    def json(self):
        return self.json_data


# GET
def test_get_mine_manager_history_csv_by_mine_no(test_client, db_session, auth_headers):
    mine = MineFactory()
    MinePartyAppointmentFactory(mine=mine, mine_party_appt_type_code='MMG')

    with mock.patch('requests.get') as mock_request:
        mock_request.return_value = MockResponse({'status': 200, 'guid': str(mine.mine_guid)}, 200)
        get_resp = test_client.get(
            f'/parties/mines/manager-history/csv?mine_no={mine.mine_no}',
            headers=auth_headers['admin_only_auth_header'])
        assert get_resp.status_code == 200
