import json

from tests.factories import (NOWSubmissionFactory, MineFactory, NOWClientFactory,
                             NOWApplicationIdentityFactory)


class TestGetApplicationResource:
    """GET /now-submissions/applications/{application_guid}"""
    def test_get_now_submission_by_guid_success(self, test_client, db_session, auth_headers):
        """Should return the correct records with a 200 response code"""

        now_submission = NOWSubmissionFactory()
        identity = NOWApplicationIdentityFactory(now_submission=now_submission)
        get_resp = test_client.get(
            f'/now-submissions/applications/{identity.now_application_guid}',
            headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200, get_resp.response

        get_data = json.loads(get_resp.data.decode())
        assert get_data['now_application_guid'] is not None
        assert get_data['now_application_guid'] == str(identity.now_application_guid)

    def test_get_now_submission_by_guid_mine_name(self, test_client, db_session, auth_headers):
        """Should include the correct mine name"""

        mine = MineFactory()
        now_submission = NOWSubmissionFactory(mine=mine)
        identity = NOWApplicationIdentityFactory(now_submission=now_submission)
        get_resp = test_client.get(
            f'/now-submissions/applications/{identity.now_application_guid}',
            headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())
        assert get_data['mine_name'] is not None
        assert get_data['mine_name'] == mine.mine_name

    def test_get_now_submission_by_guid_applicant(self, test_client, db_session, auth_headers):
        """Should include the correct applicant"""

        applicant = NOWClientFactory()
        now_submission = NOWSubmissionFactory(applicant=applicant)
        identity = NOWApplicationIdentityFactory(now_submission=now_submission)
        get_resp = test_client.get(
            f'/now-submissions/applications/{identity.now_application_guid}',
            headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())
        assert get_data['applicant']['type'] is not None
        assert get_data['applicant']['type'] == applicant.type

    def test_get_now_submission_by_guid_submitter(self, test_client, db_session, auth_headers):
        """Should include the correct submitter"""

        submitter = NOWClientFactory()
        now_submission = NOWSubmissionFactory(submitter=submitter)
        identity = NOWApplicationIdentityFactory(now_submission=now_submission)
        get_resp = test_client.get(
            f'/now-submissions/applications/{identity.now_application_guid}',
            headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())
        assert get_data['submitter']['type'] is not None
        assert get_data['submitter']['type'] == submitter.type

    def test_get_now_submission_by_guid_documents(self, test_client, db_session, auth_headers):
        """Should include the correct documents"""

        now_submission = NOWSubmissionFactory()
        identity = NOWApplicationIdentityFactory(now_submission=now_submission)
        get_resp = test_client.get(
            f'/now-submissions/applications/{identity.now_application_guid}',
            headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())
        assert get_data['documents'][0]['filename'] is not None
        assert get_data['documents'][0]['filename'] in list(
            map(lambda x: x.filename, now_submission.documents))

    def test_get_now_submission_by_guid_contacts(self, test_client, db_session, auth_headers):
        """Should include the correct contacts"""

        now_submission = NOWSubmissionFactory()
        identity = NOWApplicationIdentityFactory(now_submission=now_submission)
        get_resp = test_client.get(
            f'/now-submissions/applications/{identity.now_application_guid}',
            headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())
        assert get_data['contacts'][0]['type'] is not None
        assert get_data['contacts'][0]['type'] in list(
            map(lambda x: x.type, now_submission.contacts))

    def test_get_now_submission_by_guid_existing_placer_activity(self, test_client, db_session,
                                                                 auth_headers):
        """Should include the correct existing_placer_activity"""

        now_submission = NOWSubmissionFactory()
        identity = NOWApplicationIdentityFactory(now_submission=now_submission)
        get_resp = test_client.get(
            f'/now-submissions/applications/{identity.now_application_guid}',
            headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())
        assert get_data['existing_placer_activity'][0]['type'] is not None
        assert get_data['existing_placer_activity'][0]['type'] in list(
            map(lambda x: x.type, now_submission.existing_placer_activity))

    def test_get_now_submission_by_guid_proposed_placer_activity(self, test_client, db_session,
                                                                 auth_headers):
        """Should include the correct proposed_placer_activity"""

        now_submission = NOWSubmissionFactory()
        identity = NOWApplicationIdentityFactory(now_submission=now_submission)
        get_resp = test_client.get(
            f'/now-submissions/applications/{identity.now_application_guid}',
            headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())
        assert get_data['proposed_placer_activity'][0]['type'] is not None
        assert get_data['proposed_placer_activity'][0]['type'] in list(
            map(lambda x: x.type, now_submission.proposed_placer_activity))

    def test_get_now_submission_by_guid_existing_settling_pond(self, test_client, db_session,
                                                               auth_headers):
        """Should include the correct existing_settling_pond"""

        now_submission = NOWSubmissionFactory()
        identity = NOWApplicationIdentityFactory(now_submission=now_submission)
        get_resp = test_client.get(
            f'/now-submissions/applications/{identity.now_application_guid}',
            headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())
        assert get_data['existing_settling_pond'][0]['pondid'] is not None
        assert get_data['existing_settling_pond'][0]['pondid'] in list(
            map(lambda x: x.pondid, now_submission.existing_settling_pond))

    def test_get_now_submission_by_guid_proposed_settling_pond(self, test_client, db_session,
                                                               auth_headers):
        """Should include the correct proposed_settling_pond"""

        now_submission = NOWSubmissionFactory()
        identity = NOWApplicationIdentityFactory(now_submission=now_submission)
        get_resp = test_client.get(
            f'/now-submissions/applications/{identity.now_application_guid}',
            headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())
        assert get_data['proposed_settling_pond'][0]['pondid'] is not None
        assert get_data['proposed_settling_pond'][0]['pondid'] in list(
            map(lambda x: x.pondid, now_submission.proposed_settling_pond))

    def test_get_now_submission_by_guid_sand_grv_qry_activity(self, test_client, db_session,
                                                              auth_headers):
        """Should include the correct sand_grv_qry_activity"""

        now_submission = NOWSubmissionFactory()
        identity = NOWApplicationIdentityFactory(now_submission=now_submission)
        get_resp = test_client.get(
            f'/now-submissions/applications/{identity.now_application_guid}',
            headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())
        assert get_data['sand_grv_qry_activity'][0]['type'] is not None
        assert get_data['sand_grv_qry_activity'][0]['type'] in list(
            map(lambda x: x.type, now_submission.sand_grv_qry_activity))

    def test_get_now_submission_by_guid_under_exp_new_activity(self, test_client, db_session,
                                                               auth_headers):
        """Should include the correct under_exp_new_activity"""

        now_submission = NOWSubmissionFactory()
        identity = NOWApplicationIdentityFactory(now_submission=now_submission)
        get_resp = test_client.get(
            f'/now-submissions/applications/{identity.now_application_guid}',
            headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())
        assert get_data['under_exp_new_activity'][0]['type'] is not None
        assert get_data['under_exp_new_activity'][0]['type'] in list(
            map(lambda x: x.type, now_submission.under_exp_new_activity))

    def test_get_now_submission_by_guid_under_exp_rehab_activity(self, test_client, db_session,
                                                                 auth_headers):
        """Should include the correct under_exp_rehab_activity"""

        now_submission = NOWSubmissionFactory()
        identity = NOWApplicationIdentityFactory(now_submission=now_submission)
        get_resp = test_client.get(
            f'/now-submissions/applications/{identity.now_application_guid}',
            headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())
        assert get_data['under_exp_rehab_activity'][0]['type'] is not None
        assert get_data['under_exp_rehab_activity'][0]['type'] in list(
            map(lambda x: x.type, now_submission.under_exp_rehab_activity))

    def test_get_now_submission_by_guid_under_exp_surface_activity(self, test_client, db_session,
                                                                   auth_headers):
        """Should include the correct under_exp_surface_activity"""

        now_submission = NOWSubmissionFactory()
        identity = NOWApplicationIdentityFactory(now_submission=now_submission)
        get_resp = test_client.get(
            f'/now-submissions/applications/{identity.now_application_guid}',
            headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())
        assert get_data['under_exp_surface_activity'][0]['type'] is not None
        assert get_data['under_exp_surface_activity'][0]['type'] in list(
            map(lambda x: x.type, now_submission.under_exp_surface_activity))

    def test_get_now_submission_by_guid_water_source_activity(self, test_client, db_session,
                                                              auth_headers):
        """Should include the correct water_source_activity"""

        now_submission = NOWSubmissionFactory()
        identity = NOWApplicationIdentityFactory(now_submission=now_submission)
        get_resp = test_client.get(
            f'/now-submissions/applications/{identity.now_application_guid}',
            headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())
        assert get_data['water_source_activity'][0]['type'] is not None
        assert get_data['water_source_activity'][0]['type'] in list(
            map(lambda x: x.type, now_submission.water_source_activity))
