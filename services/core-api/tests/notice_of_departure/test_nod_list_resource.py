import json
import uuid

from tests.factories import NoticeOfDepartureFactory, MineFactory, PermitFactory


class TestNodListResource:
    """GET /notices-of-departure"""

    def test_get_nods_for_a_mine(self, test_client, db_session, auth_headers):
        """Should return the correct number of records and a 200 status code"""

        batch_size = 3
        mine = MineFactory(minimal=True)
        NoticeOfDepartureFactory.create_batch(size=batch_size, mine=mine)
        another_mine = MineFactory(minimal=True)
        NoticeOfDepartureFactory.create_batch(size=batch_size, mine=another_mine)

        get_resp = test_client.get(
            f'/notices-of-departure?mine_guid={mine.mine_guid}',
            headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert len(get_data['records']) == batch_size
        assert get_data['total'] == batch_size

    def test_get_nods_for_a_permit(self, test_client, db_session, auth_headers):
        """Should return the correct number of records and a 200 status code"""

        batch_size = 3
        mine = MineFactory(minimal=True)
        permit = PermitFactory()
        NoticeOfDepartureFactory.create_batch(size=batch_size, mine=mine, permit=permit)
        another_permit = PermitFactory()
        NoticeOfDepartureFactory.create_batch(size=batch_size, mine=mine, permit=another_permit)

        get_resp = test_client.get(
            f'/notices-of-departure?permit_guid={permit.permit_guid}',
            headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert len(get_data['records']) == batch_size
        assert get_data['total'] == batch_size

    def test_get_nods_non_existent_mine_guid(self, test_client, db_session, auth_headers):
        """Should return a 404 when the provided mine guid does not exist"""

        batch_size = 3
        fake_guid = uuid.uuid4()
        NoticeOfDepartureFactory.create_batch(size=batch_size)

        get_resp = test_client.get(
            f'/notices-of-departure?mine_guid={fake_guid}',
            headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())

        assert get_resp.status_code == 200
        assert len(get_data['records']) == 0
        assert get_data['total'] == 0
