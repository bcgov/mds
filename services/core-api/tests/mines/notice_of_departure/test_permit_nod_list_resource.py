import json
import uuid

from tests.factories import NoticeOfDepartureFactory, MineFactory, PermitFactory


class TestPermitNodListResource:
    """GET /mines/{mine_guid}/permits/{permit_guid}/notice-of-departures"""

    def test_get_nods_for_a_permit(self, test_client, db_session, auth_headers):
        """Should return the correct number of records and a 200 status code"""

        batch_size = 3
        mine = MineFactory(minimal=True)
        permit = PermitFactory()
        NoticeOfDepartureFactory.create_batch(size=batch_size, mine=mine, permit=permit)

        get_resp = test_client.get(
            f'/mines/{mine.mine_guid}/permits/{permit.permit_guid}/notice-of-departures',
            headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert len(get_data['records']) == batch_size

    def test_get_nods_non_existent_permit_guid(self, test_client, db_session, auth_headers):
        """Should return a 404 when the provided mine guid does not exist"""

        batch_size = 3
        mine = MineFactory(minimal=True)
        permit = PermitFactory()
        fake_guid = uuid.uuid4()
        NoticeOfDepartureFactory.create_batch(size=batch_size, mine=mine, permit=permit)

        get_resp = test_client.get(
            f'/mines/{mine.mine_guid}/permits/{fake_guid}/notice-of-departures',
            headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())

        assert get_resp.status_code == 200
        assert len(get_data['records']) == 0
