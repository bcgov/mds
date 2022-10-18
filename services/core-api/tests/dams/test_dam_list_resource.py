import json
import uuid

from tests.factories import MineTailingsStorageFacilityFactory, DamFactory


class TestDamListResource:
    """GET /dams"""

    def test_get_dams_for_a_tsf(self, test_client, db_session, auth_headers):
        """Should return the correct number of records and a 200 status code"""

        batch_size = 3
        tsf = MineTailingsStorageFacilityFactory()
        DamFactory.create_batch(size=batch_size, tsf=tsf)

        get_resp = test_client.get(
            f'/dams?mine_tailings_storage_facility_guid={tsf.mine_tailings_storage_facility_guid}',
            headers=auth_headers['full_auth_header'])

        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert len(get_data['records']) == batch_size
        assert get_data['total'] == batch_size

    def test_get_all_dams(self, test_client, db_session, auth_headers):
        """Should return the correct number of records and a 200 status code"""

        batch_size = 3
        DamFactory.create_batch(size=batch_size)

        get_resp = test_client.get(
            f'/dams',
            headers=auth_headers['full_auth_header'])

        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert len(get_data['records']) == batch_size
        assert get_data['total'] == batch_size

    def test_get_dams_non_existent_tsf_guid(self, test_client, db_session, auth_headers):
        """Should return a 200 and 0 records when the provided tsf guid does not exist"""

        batch_size = 3
        fake_guid = uuid.uuid4()
        DamFactory.create_batch(size=batch_size)

        get_resp = test_client.get(
            f'/dams?mine_tailings_storage_facility_guid={fake_guid}',
            headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())

        assert get_resp.status_code == 200
        assert len(get_data['records']) == 0