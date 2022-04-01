import json
import uuid

from tests.factories import NodFactory, MineFactory, PermitFactory


class TestGetNods:
    """GET /mines/{mine_guid}/permits/{permit_guid}/nods"""

    def test_get_nods_for_a_permit(self, test_client, db_session, auth_headers):
        """Should return the correct number of records and a 200 status code"""

        batch_size = 3
        mine = MineFactory(minimal=True)
        permit = PermitFactory()
        NodFactory.create_batch(size=batch_size, mine=mine, permit=permit)

        get_resp = test_client.get(
            f'/mines/{mine.mine_guid}/permits/{permit.permid_guid}/nods',
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
        NodFactory.create_batch(size=batch_size, mine=mine, permit=permit)

        get_resp = test_client.get(
            f'/mines/{mine.mine_guid}/permits/{fake_guid}/nods',
            headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        print(get_data)
        assert get_resp.status_code == 200
        assert len(get_data['records']) == 0


# class TestPostNod:
#     """POST /mines/{mine_guid}/permits/{permit_guid}/nods"""

#     def test_post_nod(self, test_client, db_session, auth_headers):
#         """Should return the newly created nod"""

#         nod = NodFactory()
#         data = {
#             'title': nod.nod_title,
#         }
#         print(data)
#         post_resp = test_client.post(
#             f'/mines/{nod.mine_guid}/permits/{nod.permit_guid}/nods',
#             headers=auth_headers['full_auth_header'],
#             json=data)
#         post_data = json.loads(post_resp.data.decode())
#         assert post_resp.status_code == 201, post_resp.response

#         assert post_data['title'] == data['nod_title']
#         assert nod.permit_guid == data['permit']
