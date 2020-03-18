import json

from tests.factories import BondFactory, MineFactory, PermitFactory, PartyFactory
from app.api.now_applications.resources.now_application_list_resource import PAGE_DEFAULT, PER_PAGE_DEFAULT

BOND_POST_DATA = {
    'bond': {
        'amount': 15.56,
        'bond_type_code': 'CAS',
        'bond_status_code': 'ACT',
        'reference_number': '#test'
    }
}


class TestBondsResource:
    """GET /bonds"""
    def test_get_all_bonds_on_mine(self, test_client, db_session, auth_headers):
        """Should return the correct records with a 200 response code"""

        batch_size = 5
        mine = MineFactory(minimal=True)
        permits = PermitFactory.create_batch(size=batch_size, mine=mine)
        bonds = [bond for permit in permits for bond in permit.bonds]

        get_resp = test_client.get(
            f'/bonds?mine_guid={mine.mine_guid}', headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())

        assert len(get_data['records']) == len(bonds)
        assert all(
            str(bond.bond_guid) in map(lambda x: x['bond_guid'], get_data['records'])
            for bond in bonds)

    def test_get_all_bonds_on_mine_no_mine_guid(self, test_client, db_session, auth_headers):
        """Should return the error with a 400 response code"""

        get_resp = test_client.get('/bonds?mine_guid=', headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 400, get_resp.response
        get_data = json.loads(get_resp.data.decode())
        assert get_data['message'] is not None

    def test_get_all_bonds_on_mine_no_permits(self, test_client, db_session, auth_headers):
        """Should return empty list"""

        mine = MineFactory(minimal=True)
        get_resp = test_client.get(
            f'/bonds?mine_guid={mine.mine_guid}', headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())
        assert len(get_data['records']) == 0

    """POST BONDS"""
    def test_post_a_bond(self, test_client, db_session, auth_headers):
        """Should return the created bond with a 201 response code"""

        mine = MineFactory(minimal=True)
        party1 = PartyFactory(person=True)
        permit = PermitFactory(mine=mine)
        BOND_POST_DATA['bond']['payer_party_guid'] = party1.party_guid
        BOND_POST_DATA['permit_guid'] = permit.permit_guid

        post_resp = test_client.post(
            '/bonds', json=BOND_POST_DATA, headers=auth_headers['full_auth_header'])
        assert post_resp.status_code == 201, post_resp.response
        post_data = json.loads(post_resp.data.decode())
        assert post_data['permit_guid'] == permit.permit_guid
        assert post_data['payer_party_guid'] == party1.party_guid

    # def test_get_application_list_pagination(self, test_client, db_session, auth_headers):
    #     """Should return paginated records"""

    #     batch_size = PER_PAGE_DEFAULT + 1
    #     NOWApplicationIdentityFactory.create_batch(size=batch_size)

    #     get_resp = test_client.get('/now-applications', headers=auth_headers['full_auth_header'])
    #     assert get_resp.status_code == 200, get_resp.response
    #     get_data = json.loads(get_resp.data.decode())

    #     assert len(get_data['records']) == PER_PAGE_DEFAULT
    #     assert get_data['current_page'] == PAGE_DEFAULT
    #     assert get_data['total'] == batch_size

    # def test_get_now_application_list_filter_by_status(self, test_client, db_session, auth_headers):
    #     """Should return the records filtered by status"""

    #     now_submission_1 = NOWSubmissionFactory(status='Approved')
    #     identity_1 = NOWApplicationIdentityFactory(now_submission=now_submission_1)
    #     now_submission_2 = NOWSubmissionFactory(status='Received')
    #     identity_2 = NOWApplicationIdentityFactory(now_submission=now_submission_2)
    #     now_submission_3 = NOWSubmissionFactory(status='Rejected')
    #     identity_3 = NOWApplicationIdentityFactory(now_submission=now_submission_3)
    #     now_submission_4 = NOWSubmissionFactory(status='Rejected')
    #     identity_4 = NOWApplicationIdentityFactory(now_submission=now_submission_4)

    #     get_resp = test_client.get(
    #         f'now-applications?now_application_status_description=Approved&now_application_status_description=Received',
    #         headers=auth_headers['full_auth_header'])
    #     assert get_resp.status_code == 200, get_resp.response
    #     get_data = json.loads(get_resp.data.decode())

    #     assert len(get_data['records']) == 2
    #     assert all(
    #         str(submission.now_application_guid) in map(lambda x: x['now_application_guid'],
    #                                                     get_data['records'])
    #         for submission in [now_submission_1, now_submission_2])
    #     assert all(
    #         str(submission.now_application_guid) not in map(lambda x: x['now_application_guid'],
    #                                                         get_data['records'])
    #         for submission in [now_submission_3, now_submission_4])

    # def test_get_now_application_list_filter_by_noticeofworktype(self, test_client, db_session,
    #                                                              auth_headers):
    #     """Should return the records filtered by noticeofworktype"""

    #     now_submission_1 = NOWSubmissionFactory(noticeofworktype='dog')
    #     identity_1 = NOWApplicationIdentityFactory(
    #         now_submission=now_submission_1, submission_only=True)
    #     now_submission_2 = NOWSubmissionFactory(noticeofworktype='dog')
    #     identity_2 = NOWApplicationIdentityFactory(
    #         now_submission=now_submission_2, submission_only=True)
    #     now_submission_3 = NOWSubmissionFactory(noticeofworktype='cat')
    #     identity_3 = NOWApplicationIdentityFactory(
    #         now_submission=now_submission_3, submission_only=True)
    #     now_submission_4 = NOWSubmissionFactory(noticeofworktype='parrot')
    #     identity_4 = NOWApplicationIdentityFactory(
    #         now_submission=now_submission_4, submission_only=True)

    #     get_resp = test_client.get(
    #         f'now-applications?notice_of_work_type_description=dog',
    #         headers=auth_headers['full_auth_header'])
    #     assert get_resp.status_code == 200, get_resp.response
    #     get_data = json.loads(get_resp.data.decode())

    #     assert len(get_data['records']) == 2
    #     assert all(
    #         str(submission.now_application_guid) in map(lambda x: x['now_application_guid'],
    #                                                     get_data['records'])
    #         for submission in [now_submission_1, now_submission_2])
    #     assert all(
    #         str(submission.now_application_guid) not in map(lambda x: x['now_application_guid'],
    #                                                         get_data['records'])
    #         for submission in [now_submission_3, now_submission_4])

    # def test_get_now_application_list_filter_by_mine_region(self, test_client, db_session,
    #                                                         auth_headers):
    #     """Should return the records filtered by mine_region"""

    #     mine = MineFactory(mine_region='SE')
    #     mine2 = MineFactory(mine_region='NW')
    #     now_submission_1 = NOWSubmissionFactory(mine=mine)
    #     identity_1 = NOWApplicationIdentityFactory(now_submission=now_submission_1, mine=mine)
    #     now_submission_2 = NOWSubmissionFactory(mine=mine)
    #     identity_2 = NOWApplicationIdentityFactory(now_submission=now_submission_2, mine=mine)
    #     now_submission_3 = NOWSubmissionFactory(mine=mine2)
    #     identity_3 = NOWApplicationIdentityFactory(now_submission=now_submission_3, mine=mine2)
    #     now_submission_4 = NOWSubmissionFactory(mine=mine2)
    #     identity_4 = NOWApplicationIdentityFactory(now_submission=now_submission_4, mine=mine2)

    #     get_resp = test_client.get(
    #         f'now-applications?mine_region={mine.mine_region}',
    #         headers=auth_headers['full_auth_header'])
    #     assert get_resp.status_code == 200, get_resp.response
    #     get_data = json.loads(get_resp.data.decode())

    #     assert len(get_data['records']) == 2
    #     assert all(
    #         str(submission.now_application_guid) in map(lambda x: x['now_application_guid'],
    #                                                     get_data['records'])
    #         for submission in [now_submission_1, now_submission_2])
    #     assert all(
    #         str(submission.now_application_guid) not in map(lambda x: x['now_application_guid'],
    #                                                         get_data['records'])
    #         for submission in [now_submission_3, now_submission_4])

    # def test_get_now_application_list_filter_by_multiple_filters(self, test_client, db_session,
    #                                                              auth_headers):
    #     """Should return the records filtered by status, noticeofworktype, and tracking email"""

    #     now_submission_1 = NOWSubmissionFactory(status='Rejected', noticeofworktype='dog')
    #     identity_1 = NOWApplicationIdentityFactory(
    #         now_submission=now_submission_1, submission_only=True)
    #     now_submission_2 = NOWSubmissionFactory(status='Received', noticeofworktype='cat')
    #     identity_2 = NOWApplicationIdentityFactory(
    #         now_submission=now_submission_2, submission_only=True)
    #     now_submission_3 = NOWSubmissionFactory(status='Rejected', noticeofworktype='dog')
    #     identity_3 = NOWApplicationIdentityFactory(
    #         now_submission=now_submission_3, submission_only=True)
    #     now_submission_4 = NOWSubmissionFactory(status='Approved', noticeofworktype='cat')
    #     identity_4 = NOWApplicationIdentityFactory(
    #         now_submission=now_submission_4, submission_only=True)

    #     get_resp = test_client.get(
    #         f'now-applications?now_application_status_description=Approved&now_application_status_description=Rejected&notice_of_work_type_description=dog',
    #         headers=auth_headers['full_auth_header'])
    #     assert get_resp.status_code == 200, get_resp.response
    #     get_data = json.loads(get_resp.data.decode())
    #     assert len(get_data['records']) == 2
    #     assert all(
    #         str(submission.now_application_guid) in map(lambda x: x['now_application_guid'],
    #                                                     get_data['records'])
    #         for submission in [now_submission_1, now_submission_3])
    #     assert all(
    #         str(submission.now_application_guid) not in map(lambda x: x['now_application_guid'],
    #                                                         get_data['records'])
    #         for submission in [now_submission_2, now_submission_4])

    # def test_post_now_application_happy_path(self, test_client, db_session, auth_headers):
    #     """Should return a new NoW Application"""

    #     mine = MineFactory()
    #     NOW_APPLICATION_DATA['minenumber'] = mine.mine_no

    #     post_resp = test_client.post(
    #         '/now-submissions/applications',
    #         json=NOW_APPLICATION_DATA,
    #         headers=auth_headers['nros_vfcbc_auth_header'])
    #     post_data = json.loads(post_resp.data.decode())

    #     assert post_resp.status_code == 201, post_resp.response
    #     assert post_data['messageid'] == NOW_APPLICATION_DATA['messageid']
    #     assert post_data['application_guid'] is not None
    #     assert post_data['mine_guid'] == str(mine.mine_guid)

    # def test_post_now_application_messageid_in_use(self, test_client, db_session, auth_headers):
    #     """Should return a 400 messageid in use"""

    #     mine = MineFactory()
    #     application = NOWSubmissionFactory(mine=mine)
    #     NOW_APPLICATION_DATA['minenumber'] = mine.mine_no
    #     NOW_APPLICATION_DATA['messageid'] = application.messageid

    #     post_resp = test_client.post(
    #         '/now-submissions/applications',
    #         json=NOW_APPLICATION_DATA,
    #         headers=auth_headers['nros_vfcbc_auth_header'])

    #     assert post_resp.status_code == 400, post_resp.response

    # def test_post_now_application_no_mine_found(self, test_client, db_session, auth_headers):
    #     """Should return a 400 messageid in use"""

    #     NOW_APPLICATION_DATA['minenumber'] = '1234567'

    #     post_resp = test_client.post(
    #         '/now-submissions/applications',
    #         json=NOW_APPLICATION_DATA,
    #         headers=auth_headers['nros_vfcbc_auth_header'])

    #     assert post_resp.status_code == 400, post_resp.response
