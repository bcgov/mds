import json, pytest

from tests.now_application_factories import NOWApplicationIdentityFactory
from tests.factories import MineFactory


class TestApplicationResource:
    """GET /now-applications/"""
    def test_get_now_application_success(self, test_client, db_session, auth_headers):
        num_created = 3
        NOWApplicationIdentityFactory.create_batch(size=num_created, application_type_code='ADA')

        get_resp = test_client.get(f'/now-applications', headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())
        assert len(get_data['records']) == num_created

    def test_get_ada_application_success_filter_by_guid(self, test_client, db_session,
                                                        auth_headers):
        num_created = 3
        NOWApplicationlist = NOWApplicationIdentityFactory.create_batch(
            size=num_created, application_type_code='ADA')

        get_resp = test_client.get(
            f'/now-applications?mine_guid={NOWApplicationlist[0].mine_guid}',
            headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())
        assert len(get_data['records']) == 1

    """POST /now-applications/"""

    def test_post_administrative_amendment_application_success(self, test_client, db_session,
                                                               auth_headers):
        mine = MineFactory(mine_permit_amendments=1)
        permit = mine.mine_permit[0]
        permit_amendment = permit.permit_amendments[0]

        payload = {
            'mine_guid': mine.mine_guid,
            'permit_id': permit.permit_id,
            'permit_amendment_guid': permit_amendment.permit_amendment_guid,
            'received_date': "2021-01-01",
            'application_reason_codes': ['EXT', 'CHP', 'MYA'],
            'application_source_type_code': "PRI"
        }

        post_resp = test_client.post(
            f'/now-applications/administrative-amendments',
            json=payload,
            headers=auth_headers['full_auth_header'])
        assert post_resp.status_code == 201, post_resp.response