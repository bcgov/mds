import json, datetime

from tests.factories import (NOWSubmissionFactory, NOWApplicationIdentityFactory)

NOW_STARTSTOP = {
  "termOfPermit": "string",
  "permitIssuedDate": "string",
  "portalApplicationPackageId": "string",
  "nowNumber": "string",
  "applicationId": "string",
  "permitExpiryDate": "string",
  "noticeOfWorkType": "string",
  "applicationType": "string",
  "processedDate": "string",
  "mineNumber": "string",
  "typeOfApplication": "string",
  "applicationDescription": "string",
  "status": "string",
  "approvalNumber": "string",
  "stopWorkDate": "string",
  "startWorkDate": "string",
  "receivedDate": "string",
  "portalApplicationPackageNumber": "string",
  "typeOfPermit": "string",
  "proposedStartDate": "string",
  "otherInformation": "string",
  "permitStartDate": "string",
  "submittedDate": "string",
  "portalApplicationId": "string",
  "proposedEndDate": "string"
}

class TestPostApplicationStartStopListResource:
    """POST /now-submissions/applications-startstop"""
    def test_post_now_application_startstop(self, test_client, db_session,
                                                              auth_headers):
        """Should return an id with a 201 response code"""

        post_resp = test_client.post(
            '/now-submissions/applications-startstop',
            json=NOW_STARTSTOP,
            headers=auth_headers['nros_vfcbc_auth_header'])
        post_data = json.loads(post_resp.data.decode())

        assert post_resp.status_code == 201, post_resp.response