import json
import uuid

from tests.factories import NoticeOfDepartureFactory, MineFactory, PermitFactory


class TestNodListResource:
    """GET /mines/{mine_guid}/notices-of-departure/{nod_guid}"""

    def test_get_nods_for_a_mine(self, test_client, db_session, auth_headers):
        """Should return a notice of departure and a 200 status code"""

        mine = MineFactory(minimal=True)
        nod = NoticeOfDepartureFactory()
        nod_guid = nod.nod_guid

        get_resp = test_client.get(
            f'/mines/{mine.mine_guid}/notices-of-departure/{nod_guid}',
            headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert get_data['nod_guid'] == str(nod_guid)
