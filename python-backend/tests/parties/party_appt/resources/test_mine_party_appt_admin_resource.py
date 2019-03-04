import json, uuid, pytest
from unittest import mock
from tests.constants import TEST_MINE_NO, TEST_MINE_GUID, TEST_PARTY_PER_GUID_1, TEST_PERMIT_GUID_1, DUMMY_USER_KWARGS
from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointment
from app.extensions import db


class MockResponse:
    def __init__(self, json_data, status_code):
        self.json_data = json_data
        self.status_code = status_code

    def json(self):
        return self.json_data


@pytest.fixture(scope="function")
def setup_info(test_client):

    permittee = MinePartyAppointment(
        mine_party_appt_guid=uuid.uuid4(),
        mine_party_appt_type_code='PMT',
        party_guid=uuid.UUID(TEST_PARTY_PER_GUID_1),
        mine_guid=uuid.UUID(TEST_MINE_GUID),
        permit_guid=uuid.UUID(TEST_PERMIT_GUID_1),
        **DUMMY_USER_KWARGS)
    permittee.save()

    yield dict(permittee_guid=permittee.mine_party_appt_guid)

    db.session.delete(permittee)
    db.session.commit()


# GET
def test_get_mine_manager_history_csv_by_mine_no(test_client, setup_info, auth_headers):

    with mock.patch('requests.get') as mock_request:
        mock_request.return_value = MockResponse({'status': 200, 'guid': TEST_MINE_GUID}, 200)
        get_resp = test_client.get(
            '/parties/mines/manager-history/csv?mine_no=' + TEST_MINE_NO,
            headers=auth_headers['admin_only_auth_header'])
        assert get_resp.status_code == 200
