import json

from tests.factories import (NOWSubmissionFactory, MineFactory, NOWClientFactory)


class TestGetApplicationResource:
    """GET /now-submissions/applications/{application_guid}"""

    def test_get_now_submission_by_guid_success(self, test_client, db_session, auth_headers):
        """Should return the correct records with a 200 response code"""

        application = NOWSubmissionFactory()
        get_resp = test_client.get(f'/now-submissions/applications/{application.application_guid}',
                                   headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert get_data['application_guid'] is not None
        assert get_data['application_guid'] == str(application.application_guid)

    def test_get_now_submission_by_guid_mine_name(self, test_client, db_session, auth_headers):
        """Should include the correct mine name"""

        mine = MineFactory()
        application = NOWSubmissionFactory(mine=mine)
        get_resp = test_client.get(f'/now-submissions/applications/{application.application_guid}',
                                   headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert get_data['mine_name'] is not None
        assert get_data['mine_name'] == mine.mine_name

    def test_get_now_submission_by_guid_applicant(self, test_client, db_session, auth_headers):
        """Should include the correct applicant"""

        applicant = NOWClientFactory()
        application = NOWSubmissionFactory(applicant=applicant)
        get_resp = test_client.get(f'/now-submissions/applications/{application.application_guid}',
                                   headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert get_data['applicant']['type'] is not None
        assert get_data['applicant']['type'] == applicant.type

    def test_get_now_submission_by_guid_submitter(self, test_client, db_session, auth_headers):
        """Should include the correct submitter"""

        submitter = NOWClientFactory()
        application = NOWSubmissionFactory(submitter=submitter)
        get_resp = test_client.get(f'/now-submissions/applications/{application.application_guid}',
                                   headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert get_data['submitter']['type'] is not None
        assert get_data['submitter']['type'] == submitter.type

    def test_get_now_submission_by_guid_documents(self, test_client, db_session, auth_headers):
        """Should include the correct documents"""

        application = NOWSubmissionFactory()
        get_resp = test_client.get(f'/now-submissions/applications/{application.application_guid}',
                                   headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert get_data['documents'][0]['filename'] is not None
        assert get_data['documents'][0]['filename'] in list(
            map(lambda x: x.filename, application.documents))

    def test_get_now_submission_by_guid_contacts(self, test_client, db_session, auth_headers):
        """Should include the correct contacts"""

        application = NOWSubmissionFactory()
        get_resp = test_client.get(f'/now-submissions/applications/{application.application_guid}',
                                   headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert get_data['contacts'][0]['type'] is not None
        assert get_data['contacts'][0]['type'] in list(map(lambda x: x.type, application.contacts))

    def test_get_now_submission_by_guid_existing_placer_activity(self, test_client, db_session,
                                                                 auth_headers):
        """Should include the correct existing_placer_activity"""

        application = NOWSubmissionFactory()
        get_resp = test_client.get(f'/now-submissions/applications/{application.application_guid}',
                                   headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert get_data['existing_placer_activity'][0]['type'] is not None
        assert get_data['existing_placer_activity'][0]['type'] in list(
            map(lambda x: x.type, application.existing_placer_activity))

    def test_get_now_submission_by_guid_proposed_placer_activity(self, test_client, db_session,
                                                                 auth_headers):
        """Should include the correct proposed_placer_activity"""

        application = NOWSubmissionFactory()
        get_resp = test_client.get(f'/now-submissions/applications/{application.application_guid}',
                                   headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert get_data['proposed_placer_activity'][0]['type'] is not None
        assert get_data['proposed_placer_activity'][0]['type'] in list(
            map(lambda x: x.type, application.proposed_placer_activity))

    def test_get_now_submission_by_guid_existing_settling_pond(self, test_client, db_session,
                                                               auth_headers):
        """Should include the correct existing_settling_pond"""

        application = NOWSubmissionFactory()
        get_resp = test_client.get(f'/now-submissions/applications/{application.application_guid}',
                                   headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert get_data['existing_settling_pond'][0]['pondid'] is not None
        assert get_data['existing_settling_pond'][0]['pondid'] in list(
            map(lambda x: x.pondid, application.existing_settling_pond))

    def test_get_now_submission_by_guid_proposed_settling_pond(self, test_client, db_session,
                                                               auth_headers):
        """Should include the correct proposed_settling_pond"""

        application = NOWSubmissionFactory()
        get_resp = test_client.get(f'/now-submissions/applications/{application.application_guid}',
                                   headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert get_data['proposed_settling_pond'][0]['pondid'] is not None
        assert get_data['proposed_settling_pond'][0]['pondid'] in list(
            map(lambda x: x.pondid, application.proposed_settling_pond))

    def test_get_now_submission_by_guid_sand_grv_qry_activity(self, test_client, db_session,
                                                              auth_headers):
        """Should include the correct sand_grv_qry_activity"""

        application = NOWSubmissionFactory()
        get_resp = test_client.get(f'/now-submissions/applications/{application.application_guid}',
                                   headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert get_data['sand_grv_qry_activity'][0]['type'] is not None
        assert get_data['sand_grv_qry_activity'][0]['type'] in list(
            map(lambda x: x.type, application.sand_grv_qry_activity))

    def test_get_now_submission_by_guid_under_exp_new_activity(self, test_client, db_session,
                                                               auth_headers):
        """Should include the correct under_exp_new_activity"""

        application = NOWSubmissionFactory()
        get_resp = test_client.get(f'/now-submissions/applications/{application.application_guid}',
                                   headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert get_data['under_exp_new_activity'][0]['type'] is not None
        assert get_data['under_exp_new_activity'][0]['type'] in list(
            map(lambda x: x.type, application.under_exp_new_activity))

    def test_get_now_submission_by_guid_under_exp_rehab_activity(self, test_client, db_session,
                                                                 auth_headers):
        """Should include the correct under_exp_rehab_activity"""

        application = NOWSubmissionFactory()
        get_resp = test_client.get(f'/now-submissions/applications/{application.application_guid}',
                                   headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert get_data['under_exp_rehab_activity'][0]['type'] is not None
        assert get_data['under_exp_rehab_activity'][0]['type'] in list(
            map(lambda x: x.type, application.under_exp_rehab_activity))

    def test_get_now_submission_by_guid_under_exp_surface_activity(self, test_client, db_session,
                                                                   auth_headers):
        """Should include the correct under_exp_surface_activity"""

        application = NOWSubmissionFactory()
        get_resp = test_client.get(f'/now-submissions/applications/{application.application_guid}',
                                   headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert get_data['under_exp_surface_activity'][0]['type'] is not None
        assert get_data['under_exp_surface_activity'][0]['type'] in list(
            map(lambda x: x.type, application.under_exp_surface_activity))

    def test_get_now_submission_by_guid_water_source_activity(self, test_client, db_session,
                                                              auth_headers):
        """Should include the correct water_source_activity"""

        application = NOWSubmissionFactory()
        get_resp = test_client.get(f'/now-submissions/applications/{application.application_guid}',
                                   headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert get_data['water_source_activity'][0]['type'] is not None
        assert get_data['water_source_activity'][0]['type'] in list(
            map(lambda x: x.type, application.water_source_activity))
