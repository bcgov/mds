import json

from app.api.variances.models.variance_application_status_code import VarianceApplicationStatusCode


class TestGetVarianceApplicationStatusCode:
    """GET /variances/status-codes"""
    def test_get_variance_application_status_codes(self, test_client, db_session, auth_headers):
        """Should return the correct number of records with a 200 response code"""

        get_resp = test_client.get(
            f'/variances/status-codes', headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert len(get_data['records']) == len(VarianceApplicationStatusCode.get_active())
