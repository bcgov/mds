import json, pytest

from tests.factories import NOWSubmissionFactory, MineFactory, NOWApplicationIdentityFactory
from app.api.now_applications.resources.now_application_list_resource import PAGE_DEFAULT, PER_PAGE_DEFAULT

NOW_APPLICATION_DATA = {
    "messageid":
    1111111111,
    "originating_system":
    "1",
    "trackingnumber":
    0,
    "applicationtype":
    "str",
    "status":
    "Under Review",
    "submitteddate":
    "2020-02-27T19:14:23.368Z",
    "receiveddate":
    "2020-02-27T19:14:23.368Z",
    "applicantclientid":
    5,
    "submitterclientid":
    5,
    "noticeofworktype":
    "Coal",
    "typeofpermit":
    "I would like to apply for a Multi-Year permit",
    "typeofapplication":
    "str",
    "latitude":
    0,
    "longitude":
    0,
    "nameofproperty":
    "test",
    "tenurenumbers":
    "str",
    "crowngrantlotnumbers":
    "str",
    "sitedirections":
    "str",
    "firstaidequipmentonsite":
    "str",
    "firstaidcertlevel":
    "str",
    "descexplorationprogram":
    "str",
    "proposedstartdate":
    "2020-02-27T19:14:23.368Z",
    "proposedenddate":
    "2020-02-27T19:14:23.368Z",
    "yearroundseasonal":
    "str",
    "landcommunitywatershed":
    "Yes",
    "landprivate":
    "str",
    "landlegaldesc":
    "str",
    "archsitesaffected":
    "Yes",
    "sandgravelquarryoperations":
    "str",
    "storeexplosivesonsite":
    "Yes",
    "bcexplosivespermitissued":
    "Yes",
    "bcexplosivespermitnumber":
    "str",
    "bcexplosivespermitexpiry":
    "2020-02-27T19:14:23.368Z",
    "campdisturbedarea":
    0,
    "camptimbervolume":
    0,
    "bldgdisturbedarea":
    0,
    "bldgtimbervolume":
    0,
    "stgedisturbedarea":
    0,
    "stgetimbervolume":
    0,
    "fuellubstoreonsite":
    "Yes",
    "fuellubstored":
    0,
    "fuellubstoremethodbulk":
    "str",
    "fuellubstoremethodbarrel":
    "str",
    "cbsfreclamation":
    "str",
    "cbsfreclamationcost":
    0,
    "mechtrenchingreclamation":
    "str",
    "mechtrenchingreclamationcost":
    0,
    "expsurfacedrillreclamation":
    "str",
    "expsurfacedrillreclcorestorage":
    "str",
    "expsurfacedrillreclamationcost":
    0,
    "expaccessreclamation":
    "str",
    "expaccessreclamationcost":
    0,
    "surfacebulksampleprocmethods":
    "str",
    "surfacebulksamplereclamation":
    "str",
    "surfacebulksamplereclsephandl":
    "str",
    "surfacebulksamplerecldrainmiti":
    "str",
    "surfacebulksamplereclcost":
    0,
    "underexptotalore":
    0,
    "underexptotaloreunits":
    "Degrees",
    "underexptotalwaste":
    0,
    "underexptotalwasteunits":
    "tonnes",
    "underexpreclamation":
    "str",
    "underexpreclamationcost":
    0,
    "placerundergroundoperations":
    "Yes",
    "placerhandoperations":
    "Yes",
    "placerreclamationarea":
    0,
    "placerreclamation":
    "str",
    "placerreclamationcost":
    0,
    "sandgrvqrydepthoverburden":
    0,
    "sandgrvqrydepthtopsoil":
    0,
    "sandgrvqrystabilizemeasures":
    "str",
    "sandgrvqrywithinaglandres":
    "No",
    "sandgrvqryalrpermitnumber":
    "str",
    "sandgrvqrylocalgovsoilrembylaw":
    "Yes",
    "sandgrvqryofficialcommplan":
    "str",
    "sandgrvqrylandusezoning":
    "str",
    "sandgrvqryendlanduse":
    "str",
    "sandgrvqrytotalmineres":
    0,
    "sandgrvqrytotalmineresunits":
    "tonnes",
    "sandgrvqryannualextrest":
    0,
    "sandgrvqryannualextrestunits":
    "m3",
    "sandgrvqryreclamation":
    "str",
    "sandgrvqryreclamationbackfill":
    "str",
    "sandgrvqryreclamationcost":
    0,
    "sandgrvqrygrdwtravgdepth":
    0,
    "sandgrvqrygrdwtrexistingareas":
    "Yes",
    "sandgrvqrygrdwtrtestpits":
    "Yes",
    "sandgrvqrygrdwtrtestwells":
    "Yes",
    "sandgrvqrygrdwtrother":
    "str",
    "sandgrvqrygrdwtrmeasprotect":
    "str",
    "sandgrvqryimpactdistres":
    0,
    "sandgrvqryimpactdistwater":
    0,
    "sandgrvqryimpactnoise":
    "str",
    "sandgrvqryimpactprvtaccess":
    "str",
    "sandgrvqryimpactprevtdust":
    "str",
    "sandgrvqryimpactminvisual":
    "str",
    "cutlinesexplgridtotallinekms":
    0,
    "cutlinesexplgridtimbervolume":
    0,
    "cutlinesreclamation":
    "str",
    "cutlinesreclamationcost":
    0,
    "pondswastewatertreatfacility":
    "str",
    "freeusepermit":
    "str",
    "licencetocut":
    "str",
    "timbertotalvolume":
    0,
    "campbuildstgetotaldistarea":
    0,
    "mechtrenchingtotaldistarea":
    0,
    "expsurfacedrilltotaldistarea":
    0,
    "expaccesstotaldistarea":
    0,
    "surfacebulksampletotaldistarea":
    0,
    "placertotaldistarea":
    0,
    "underexptotaldistarea":
    0,
    "sandgrvqrytotaldistarea":
    0,
    "pondstotaldistarea":
    0,
    "reclcostsubtotal":
    0,
    "reclcostexist":
    0,
    "reclcostrecl":
    0,
    "reclcosttotal":
    0,
    "reclareasubtotal":
    0,
    "reclareaexist":
    0,
    "reclarearecl":
    0,
    "reclareatotal":
    0,
    "anyotherinformation":
    "str",
    "vfcbcapplicationurl":
    "str",
    "messagecreateddate":
    "2020-02-27T19:14:23.368Z",
    "processed":
    "s",
    "processeddate":
    "2020-02-27T19:14:23.368Z",
    "cutlinesexplgriddisturbedarea":
    0,
    "pondsrecycled":
    "No",
    "pondsexfiltratedtoground":
    "Yes",
    "pondsdischargedtoenv":
    "Yes",
    "pondsreclamation":
    "str",
    "pondsreclamationcost":
    0,
    "sandgrvqrytotalexistdistarea":
    0,
    "nrsosapplicationid":
    "str",
    "isblastselect":
    "str",
    "istimberselect":
    "str",
    "applicant": {
        "clientid": 5,
        "type": "str",
        "org_legalname": "test",
        "org_doingbusinessas": "str",
        "ind_firstname": "str",
        "ind_lastname": "str",
        "ind_middlename": "str",
        "ind_phonenumber": "str",
        "dayphonenumber": "str",
        "dayphonenumberext": "str",
        "faxnumber": "str",
        "email": "str",
        "org_bcfedincorpnumber": "str",
        "org_bcregnumber": "str",
        "org_societynumber": "str",
        "org_hstregnumber": "str",
        "org_contactname": "str",
        "mailingaddressline1": "str",
        "mailingaddressline2": "str",
        "mailingaddresscity": "str",
        "mailingaddressprovstate": "str",
        "mailingaddresscountry": "str",
        "mailingaddresspostalzip": "str"
    },
    "submitter": {
        "clientid": 5,
        "type": "str",
        "org_legalname": "str",
        "org_doingbusinessas": "str",
        "ind_firstname": "str",
        "ind_lastname": "str",
        "ind_middlename": "str",
        "ind_phonenumber": "str",
        "dayphonenumber": "str",
        "dayphonenumberext": "str",
        "faxnumber": "str",
        "email": "test@test.com",
        "org_bcfedincorpnumber": "str",
        "org_bcregnumber": "str",
        "org_societynumber": "str",
        "org_hstregnumber": "str",
        "org_contactname": "str",
        "mailingaddressline1": "str",
        "mailingaddressline2": "str",
        "mailingaddresscity": "str",
        "mailingaddressprovstate": "str",
        "mailingaddresscountry": "str",
        "mailingaddresspostalzip": "str"
    },
    "documents": [{
        "documenturl": "str",
        "filename": "str",
        "documenttype": "str",
        "description": "str"
    }],
    "contacts": [{
        "type": "str",
        "org_legalname": "str",
        "org_doingbusinessas": "str",
        "ind_firstname": "str",
        "ind_lastname": "str",
        "ind_middlename": "str",
        "ind_phonenumber": "str",
        "dayphonenumber": "str",
        "dayphonenumberext": "str",
        "faxnumber": "str",
        "email": "str",
        "org_bcfedincorpnumber": "str",
        "org_bcregnumber": "str",
        "org_societynumber": "str",
        "org_hstregnumber": "str",
        "org_contactname": "str",
        "mailingaddressline1": "str",
        "contacttype": "Mine manager",
        "contactcertificationtype": "str",
        "contactcertificationid": "str",
        "mailingaddressline2": "str",
        "mailingaddresscity": "str",
        "mailingaddressprovstate": "str",
        "mailingaddresscountry": "str",
        "mailingaddresspostalzip": "str",
        "seq_no": 0
    }],
    "existing_placer_activity": [{
        "placeractivityid": 5678,
        "type": "str",
        "quantity": 0,
        "depth": 0,
        "length": 0,
        "width": 0,
        "disturbedarea": 0,
        "timbervolume": 0
    }],
    "existing_settling_pond": [{
        "settlingpondid": 5678,
        "pondid": "string",
        "watersource": "str",
        "width": 0,
        "length": 0,
        "depth": 0,
        "constructionmethod": "str",
        "disturbedarea": 0,
        "timbervolume": 0
    }],
    "exp_access_activity": [{
        "type": "testing",
        "disturbedarea": 0,
        "timbervolume": 0
    }],
    "exp_surface_drill_activity": [{
        "type": "str",
        "numberofsites": 0,
        "disturbedarea": 0,
        "timbervolume": 0
    }],
    "proposed_placer_activity": [{
        "placeractivityid": 1234,
        "type": "str",
        "quantity": 0,
        "depth": 0,
        "length": 0,
        "width": 0,
        "disturbedarea": 0,
        "timbervolume": 0
    }],
    "proposed_settling_pond": [{
        "settlingpondid": 1234,
        "pondid": "string",
        "watersource": "str",
        "width": 0,
        "length": 0,
        "depth": 0,
        "constructionmethod": "str",
        "disturbedarea": 0,
        "timbervolume": 0
    }, {
        "settlingpondid": 8908,
        "pondid": "string",
        "watersource": "str",
        "width": 1,
        "length": 1,
        "depth": 1,
        "constructionmethod": "str",
        "disturbedarea": 1,
        "timbervolume": 1
    }],
    "surface_bulk_sample_activity": [{
        "type": "str",
        "disturbedarea": 0,
        "timbervolume": 0
    }],
    "sand_grv_qry_activity": [{
        "type": "str",
        "disturbedarea": 0,
        "timbervolume": 0
    }],
    "under_exp_new_activity": [{
        "type": "str",
        "incline": 0,
        "inclineunits": "m3",
        "quantity": 0,
        "length": 0,
        "width": 0,
        "height": 0,
        "seq_no": 0
    }, {
        "type": "str",
        "incline": 0,
        "inclineunits": "tonnes",
        "quantity": 0,
        "length": 0,
        "width": 0,
        "height": 0,
        "seq_no": 0
    }],
    "under_exp_rehab_activity": [{
        "type": "str",
        "incline": 0,
        "inclineunits": "tonnes",
        "quantity": 0,
        "length": 0,
        "width": 0,
        "height": 0,
        "seq_no": 0
    }],
    "under_exp_surface_activity": [{
        "type": "str",
        "quantity": 0,
        "disturbedarea": 0,
        "timbervolume": 0
    }],
    "water_source_activity": [{
        "sourcewatersupply": "str",
        "type": "str",
        "useofwater": "str",
        "estimateratewater": 0,
        "pumpsizeinwater": 0,
        "locationwaterintake": "str",
        "seq_no": 0
    }],
    "mech_trenching_activity": [{
        "type": "str",
        "numberofsites": 0,
        "disturbedarea": 0,
        "timbervolume": 0
    }]
}


class TestGetApplicationListResource:
    """GET /now-applications/applications"""
    def test_get_now_application_list_success(self, test_client, db_session, auth_headers):
        """Should return the correct records with a 200 response code"""

        batch_size = 5
        submissions = NOWApplicationIdentityFactory.create_batch(size=batch_size)

        get_resp = test_client.get('/now-applications', headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())

        assert len(get_data['records']) == batch_size
        assert get_data['total'] == batch_size
        assert all(
            str(submission.now_application_guid) in map(lambda x: x['now_application_guid'],
                                                        get_data['records'])
            for submission in submissions)

    def test_get_application_list_pagination(self, test_client, db_session, auth_headers):
        """Should return paginated records"""

        batch_size = PER_PAGE_DEFAULT + 1
        NOWApplicationIdentityFactory.create_batch(size=batch_size)

        get_resp = test_client.get('/now-applications', headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())

        assert len(get_data['records']) == PER_PAGE_DEFAULT
        assert get_data['current_page'] == PAGE_DEFAULT
        assert get_data['total'] == batch_size

    @pytest.mark.skip(reason='Status refactor broke ability to deploy')
    def test_get_now_application_list_filter_by_status(self, test_client, db_session, auth_headers):
        """Should return the records filtered by status"""

        now_submission_1 = NOWSubmissionFactory(status='Accepted')
        identity_1 = NOWApplicationIdentityFactory(now_submission=now_submission_1)
        now_submission_2 = NOWSubmissionFactory(status='Withdrawn')
        identity_2 = NOWApplicationIdentityFactory(now_submission=now_submission_2)
        now_submission_3 = NOWSubmissionFactory(status='Withdrawn')
        identity_3 = NOWApplicationIdentityFactory(now_submission=now_submission_3)
        now_submission_4 = NOWSubmissionFactory(status='Withdrawn')
        identity_4 = NOWApplicationIdentityFactory(now_submission=now_submission_4)

        get_resp = test_client.get(
            f'now-applications?now_application_status_description=Accepted&now_application_status_description=Withdrawn',
            headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())

        assert len(get_data['records']) == 2
        assert all(
            str(submission.now_application_guid) in map(lambda x: x['now_application_guid'],
                                                        get_data['records'])
            for submission in [now_submission_1, now_submission_2])
        assert all(
            str(submission.now_application_guid) not in map(lambda x: x['now_application_guid'],
                                                            get_data['records'])
            for submission in [now_submission_3, now_submission_4])

    def test_get_now_application_list_filter_by_noticeofworktype(self, test_client, db_session,
                                                                 auth_headers):
        """Should return the records filtered by noticeofworktype"""

        now_submission_1 = NOWSubmissionFactory(noticeofworktype='dog')
        identity_1 = NOWApplicationIdentityFactory(
            now_submission=now_submission_1, submission_only=True)
        now_submission_2 = NOWSubmissionFactory(noticeofworktype='dog')
        identity_2 = NOWApplicationIdentityFactory(
            now_submission=now_submission_2, submission_only=True)
        now_submission_3 = NOWSubmissionFactory(noticeofworktype='cat')
        identity_3 = NOWApplicationIdentityFactory(
            now_submission=now_submission_3, submission_only=True)
        now_submission_4 = NOWSubmissionFactory(noticeofworktype='parrot')
        identity_4 = NOWApplicationIdentityFactory(
            now_submission=now_submission_4, submission_only=True)

        get_resp = test_client.get(
            f'now-applications?notice_of_work_type_description=dog',
            headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())

        assert len(get_data['records']) == 2
        assert all(
            str(submission.now_application_guid) in map(lambda x: x['now_application_guid'],
                                                        get_data['records'])
            for submission in [now_submission_1, now_submission_2])
        assert all(
            str(submission.now_application_guid) not in map(lambda x: x['now_application_guid'],
                                                            get_data['records'])
            for submission in [now_submission_3, now_submission_4])

    def test_get_now_application_list_filter_by_mine_region(self, test_client, db_session,
                                                            auth_headers):
        """Should return the records filtered by mine_region"""

        mine = MineFactory(mine_region='SE')
        mine2 = MineFactory(mine_region='NW')
        now_submission_1 = NOWSubmissionFactory(mine=mine)
        identity_1 = NOWApplicationIdentityFactory(now_submission=now_submission_1, mine=mine)
        now_submission_2 = NOWSubmissionFactory(mine=mine)
        identity_2 = NOWApplicationIdentityFactory(now_submission=now_submission_2, mine=mine)
        now_submission_3 = NOWSubmissionFactory(mine=mine2)
        identity_3 = NOWApplicationIdentityFactory(now_submission=now_submission_3, mine=mine2)
        now_submission_4 = NOWSubmissionFactory(mine=mine2)
        identity_4 = NOWApplicationIdentityFactory(now_submission=now_submission_4, mine=mine2)

        get_resp = test_client.get(
            f'now-applications?mine_region={mine.mine_region}',
            headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())

        assert len(get_data['records']) == 2
        assert all(
            str(submission.now_application_guid) in map(lambda x: x['now_application_guid'],
                                                        get_data['records'])
            for submission in [now_submission_1, now_submission_2])
        assert all(
            str(submission.now_application_guid) not in map(lambda x: x['now_application_guid'],
                                                            get_data['records'])
            for submission in [now_submission_3, now_submission_4])

    def test_get_now_application_list_filter_by_multiple_filters(self, test_client, db_session,
                                                                 auth_headers):
        """Should return the records filtered by status, noticeofworktype, and tracking email"""

        now_submission_1 = NOWSubmissionFactory(status='Rejected', noticeofworktype='dog')
        identity_1 = NOWApplicationIdentityFactory(
            now_submission=now_submission_1, submission_only=True)
        now_submission_2 = NOWSubmissionFactory(status='Received', noticeofworktype='cat')
        identity_2 = NOWApplicationIdentityFactory(
            now_submission=now_submission_2, submission_only=True)
        now_submission_3 = NOWSubmissionFactory(status='Rejected', noticeofworktype='dog')
        identity_3 = NOWApplicationIdentityFactory(
            now_submission=now_submission_3, submission_only=True)
        now_submission_4 = NOWSubmissionFactory(status='Approved', noticeofworktype='cat')
        identity_4 = NOWApplicationIdentityFactory(
            now_submission=now_submission_4, submission_only=True)

        get_resp = test_client.get(
            f'now-applications?now_application_status_description=Approved&now_application_status_description=Rejected&notice_of_work_type_description=dog',
            headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())
        assert len(get_data['records']) == 2
        assert all(
            str(submission.now_application_guid) in map(lambda x: x['now_application_guid'],
                                                        get_data['records'])
            for submission in [now_submission_1, now_submission_3])
        assert all(
            str(submission.now_application_guid) not in map(lambda x: x['now_application_guid'],
                                                            get_data['records'])
            for submission in [now_submission_2, now_submission_4])

    def test_post_now_application_happy_path(self, test_client, db_session, auth_headers):
        """Should return a new NoW Application"""

        mine = MineFactory()
        NOW_APPLICATION_DATA['minenumber'] = mine.mine_no

        post_resp = test_client.post(
            '/now-submissions/applications',
            json=NOW_APPLICATION_DATA,
            headers=auth_headers['nros_vfcbc_auth_header'])
        post_data = json.loads(post_resp.data.decode())

        assert post_resp.status_code == 201, post_resp.response
        assert post_data['messageid'] == NOW_APPLICATION_DATA['messageid']
        assert post_data['application_guid'] is not None
        assert post_data['mine_guid'] == str(mine.mine_guid)
        
    def test_post_now_application_messageid_in_use(self, test_client, db_session, auth_headers):
        """Should return a 400 messageid in use"""

        mine = MineFactory()
        application = NOWSubmissionFactory(mine=mine)
        NOW_APPLICATION_DATA['minenumber'] = mine.mine_no
        NOW_APPLICATION_DATA['messageid'] = application.messageid

        post_resp = test_client.post(
            '/now-submissions/applications',
            json=NOW_APPLICATION_DATA,
            headers=auth_headers['nros_vfcbc_auth_header'])

        assert post_resp.status_code == 400, post_resp.response

    def test_post_now_application_no_mine_found(self, test_client, db_session, auth_headers):
        """Should return a 400 messageid in use"""

        NOW_APPLICATION_DATA['minenumber'] = '1234567'

        post_resp = test_client.post(
            '/now-submissions/applications',
            json=NOW_APPLICATION_DATA,
            headers=auth_headers['nros_vfcbc_auth_header'])

        assert post_resp.status_code == 400, post_resp.response
