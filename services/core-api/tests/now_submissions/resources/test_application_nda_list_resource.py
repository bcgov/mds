import json

from tests.factories import NOWSubmissionFactory, MineFactory, NOWApplicationIdentityFactory, NOWApplicationNDAFactory
from app.api.now_applications.resources.now_application_list_resource import PAGE_DEFAULT, PER_PAGE_DEFAULT

APPLICATION_NDA_DATA = {
    "messageid":
    1234567890,
    "originating_system":
    "str",
    "trackingnumber":
    0,
    "applicationtype":
    "str",
    "status":
    "Withdrawn",
    "submitteddate":
    "2020-03-05T23:15:39.361Z",
    "receiveddate":
    "2020-03-05T23:15:39.361Z",
    "typedeemedauthorization":
    "str",
    "permitnumber":
    "str",
    "planactivitiesdrillprogram":
    "str",
    "planactivitiesipsurvey":
    "str",
    "proposedstartdate":
    "2020-03-05T23:15:39.361Z",
    "proposedenddate":
    "2020-03-05T23:15:39.361Z",
    "totallinekilometers":
    0,
    "descplannedactivities":
    "str",
    "proposednewenddate":
    "2020-03-05T23:15:39.361Z",
    "reasonforextension":
    "str",
    "anyotherinformation":
    "str",
    "vfcbcapplicationurl":
    "str",
    "messagecreateddate":
    "2020-03-05T23:15:39.361Z",
    "processed":
    "s",
    "processeddate":
    "2020-03-05T23:15:39.361Z",
    "nrsosapplicationid":
    "str",
    "applicant": {
        "clientid": 0,
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
        "mailingaddressline2": "str",
        "mailingaddresscity": "str",
        "mailingaddressprovstate": "",
        "mailingaddresscountry": "str",
        "mailingaddresspostalzip": "str"
    },
    "submitter": {
        "clientid": 0,
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
        "mailingaddressline2": "str",
        "mailingaddresscity": "str",
        "mailingaddressprovstate": "str",
        "mailingaddresscountry": "str",
        "mailingaddresspostalzip": "str"
    },
    "documents": [{
        "id": 0,
        "documenturl": "str",
        "filename": "str",
        "documenttype": "str",
        "description": "str"
    }]
}


class TestGetApplicationNDAListResource:
    def test_post_now_application_nda_happy_path(self, test_client, db_session, auth_headers):
        """Should return a new NoW NDA"""

        mine = MineFactory()
        APPLICATION_NDA_DATA['minenumber'] = mine.mine_no

        post_resp = test_client.post(
            '/now-submissions/applications-nda',
            json=APPLICATION_NDA_DATA,
            headers=auth_headers['nros_vfcbc_auth_header'])
        post_data = json.loads(post_resp.data.decode())

        assert post_resp.status_code == 201, post_resp.response
        assert post_data['messageid'] == APPLICATION_NDA_DATA['messageid']
        assert post_data['application_nda_guid'] is not None
        assert post_data['mine_guid'] == str(mine.mine_guid)

    def test_post_now_application_messageid_in_use(self, test_client, db_session, auth_headers):
        """Should return a 400 messageid in use for NDA"""

        mine = MineFactory()
        application = NOWApplicationNDAFactory(mine=mine)
        APPLICATION_NDA_DATA['minenumber'] = mine.mine_no
        APPLICATION_NDA_DATA['messageid'] = application.messageid

        post_resp = test_client.post(
            '/now-submissions/applications-nda',
            json=APPLICATION_NDA_DATA,
            headers=auth_headers['nros_vfcbc_auth_header'])

        assert post_resp.status_code == 400, post_resp.response

    def test_post_now_application_no_mine_found(self, test_client, db_session, auth_headers):
        """Should return a 400 mine not found for NDA"""

        APPLICATION_NDA_DATA['minenumber'] = '1234567'

        post_resp = test_client.post(
            '/now-submissions/applications-nda',
            json=APPLICATION_NDA_DATA,
            headers=auth_headers['nros_vfcbc_auth_header'])

        assert post_resp.status_code == 400, post_resp.response
