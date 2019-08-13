import json

from tests.factories import (NOWApplicationFactory,
                             MineFactory,
                             NOWClientFactory)


class TestGetApplicationResource:
    """GET /now-submissions/application/{application_guid}"""

    def test_get_now_application_by_guid_success(self, test_client, db_session, auth_headers):
        """Should return the correct records with a 200 response code"""

        application = NOWApplicationFactory()
        get_resp = test_client.get(
            f'/now-submissions/applications/{application.application_guid}', headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert get_data['application_guid'] == str(application.application_guid)

    def test_get_now_application_by_guid_mine_name(self, test_client, db_session, auth_headers):
        """Should include the correct mine name"""

        mine = MineFactory()
        application = NOWApplicationFactory(mine=mine)
        get_resp = test_client.get(
            f'/now-submissions/applications/{application.application_guid}', headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert get_data['mine_name'] == mine.mine_name

    def test_get_now_application_by_guid_applicant(self, test_client, db_session, auth_headers):
        """Should include the correct applicant"""

        applicant = NOWClientFactory()
        application = NOWApplicationFactory(applicant=applicant)
        get_resp = test_client.get(
            f'/now-submissions/applications/{application.application_guid}', headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert get_data['applicant']['type'] == applicant.type

    def test_get_now_application_by_guid_submitter(self, test_client, db_session, auth_headers):
        """Should include the correct submitter"""

        submitter = NOWClientFactory()
        application = NOWApplicationFactory(submitter=submitter)
        get_resp = test_client.get(
            f'/now-submissions/applications/{application.application_guid}', headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert get_data['submitter']['type'] == submitter.type

    def test_get_now_application_by_guid_contacts(self, test_client, db_session, auth_headers):
        """Should include the correct contacts"""

        application = NOWApplicationFactory()
        get_resp = test_client.get(
            f'/now-submissions/applications/{application.application_guid}', headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert get_data['contacts'][0]['type'] in list(map(lambda x: x.type, application.contacts))

    def test_get_now_application_by_guid_existing_placer_activity(self, test_client, db_session, auth_headers):
        """Should include the correct existing_placer_activity"""

        application = NOWApplicationFactory()
        get_resp = test_client.get(
            f'/now-submissions/applications/{application.application_guid}', headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert get_data['existing_placer_activity'][0]['type'] in list(map(lambda x: x.type, application.existing_placer_activity))
