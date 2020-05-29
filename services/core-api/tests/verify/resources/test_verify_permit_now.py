import json, decimal
from flask_restplus import marshal, fields

from tests.factories import MineFactory, PermitFactory, PermitAmendmentFactory
from tests.now_application_factories import NOWApplicationIdentityFactory
from tests.now_submission_factories import NOWSubmissionFactory


class TestVerifyPermitMine:
    """GET verify/permit/mine"""
    def test_get_verify_permit_mine(self, test_client, db_session, auth_headers):
        mine = MineFactory(operating=True)
        #by default, authorization_end_date in the PermitAmendmentFactory is >30days
        permit = PermitFactory(permit_no="CX-1", mine=mine, permit_amendments=1)
        now_app = NOWApplicationIdentityFactory(mine=mine)
        permit.permit_amendments[0].now_identity = now_app

        now_sub = NOWSubmissionFactory()

        get_resp = test_client.get(
            f'/verify/permit/now?a_PermitNumber={permit.permit_no}',
            headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert get_data['a_Result'] == "Success"
        assert str(now_app.now_number) in get_data['a_NoWInfo']
