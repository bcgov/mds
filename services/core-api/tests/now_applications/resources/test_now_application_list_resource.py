import json, pytest

from tests.now_application_factories import NOWApplicationIdentityFactory
from tests.factories import MineFactory


class TestApplicationResource:
    """GET /now-applications/"""
    def test_get_now_application_success(self, test_client, db_session, auth_headers):
        num_created = 3
        NOWApplicationIdentityFactory.create_batch(size=num_created)

        get_resp = test_client.get(f'/now-applications', headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())
        assert len(get_data['records']) == num_created

    def test_get_now_application_success_filter_by_guid(self, test_client, db_session,
                                                        auth_headers):
        num_created = 3
        NOWApplicationlist = NOWApplicationIdentityFactory.create_batch(size=num_created)

        get_resp = test_client.get(
            f'/now-applications?mine_guid={NOWApplicationlist[0].mine_guid}',
            headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())
        assert len(get_data['records']) == 1

    """POST /now-applications/"""
    def test_post_major_mine_now_application_success(self, test_client, db_session, auth_headers):
        mine = MineFactory(major_mine_ind=True)
        payload = {
            'mine_guid': mine.mine_guid,
            'permit_guid': mine.mine_permit[0].permit_guid,
            'notice_of_work_type_code': "COL",
            'submitted_date': "2020-01-04",
            'received_date': "2020-01-02"
        }

        post_resp = test_client.post(
            f'/now-applications', json=payload, headers=auth_headers['full_auth_header'])
        assert post_resp.status_code == 201, post_resp.response
