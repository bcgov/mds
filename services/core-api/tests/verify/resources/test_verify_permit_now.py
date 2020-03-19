import json, decimal
from flask_restplus import marshal, fields

from tests.factories import PermitFactory, PermitAmendmentFactory


class TestVerifyPermitMine:
    """GET verify/permit/mine"""
    def test_get_verify_permit_mine(self, test_client, db_session, auth_headers):
        #by default, authorization_end_date in the PermitAmendmentFactory is >30days
        permit = PermitFactory(permit_no="CX-1")

        get_resp = test_client.get(
            f'/verify/permit/now?a_PermitNumber={permit.permit_no}', headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_data['a_Result'] == "Success"
        assert get_resp.status_code == 200
