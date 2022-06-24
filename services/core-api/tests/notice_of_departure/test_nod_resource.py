import json
import uuid

from tests.factories import NoticeOfDepartureFactory, MineFactory, PermitFactory


class TestNodListResource:
    """GET/PATCH /notices-of-departure/{nod_guid}"""

    def test_get_a_nod(self, test_client, db_session, auth_headers):
        """Should return a notice of departure and a 200 status code"""

        mine = MineFactory(minimal=True)
        nod = NoticeOfDepartureFactory()
        nod_guid = nod.nod_guid

        get_resp = test_client.get(
            f'/notices-of-departure/{nod_guid}', headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert get_data['nod_guid'] == str(nod_guid)

    def update_a_nod(self, test_client, db_session, auth_headers):
        """ Should return updated NOD and a 200 status"""

        mine = MineFactory(minimal=True)
        nod = NoticeOfDepartureFactory(mine=mine)
        nod_guid = nod.nod_guid
        title = nod.nod_title

        update_nod = nod
        update_nod.nod_title = "Update title"

        get_resp = test_client.patch(
            f'/notices-of-departure/{nod_guid}',
            headers=auth_headers['full_auth_header'],
            data=json.dumps(update_nod))
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert get_data['nod_guid'] == str(nod_guid)
        assert get_data['nod_title'] == update_nod.nod_title
        assert get_data['nod_title'] != title