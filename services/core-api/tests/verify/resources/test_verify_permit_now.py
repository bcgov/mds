import json, decimal
from flask_restx import marshal, fields

from tests.factories import create_mine_and_permit
from tests.now_application_factories import NOWApplicationIdentityFactory


class TestVerifyPermitNOW:
    """GET verify/permit/mine"""
    def test_get_verify_permit_now(self, test_client, db_session, auth_headers):
        mine, permit = create_mine_and_permit({'operating': True}, {'permit_no': "CX-1"})
        #by default, authorization_end_date in the PermitAmendmentFactory is >30days
        now_app = NOWApplicationIdentityFactory(mine=mine)
        permit.permit_amendments[0].now_identity = now_app

        get_resp = test_client.get(
            f'/verify/permit/now?a_PermitNumber={permit.permit_no}',
            headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert get_data['a_Result'] == "Success"
        assert str(now_app.now_number) in get_data['a_NoWInfo']
