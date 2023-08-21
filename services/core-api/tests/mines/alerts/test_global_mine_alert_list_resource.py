class TestGetMineAlerts:
    """GET /mines/global-alerts"""

    def test_get_global_alerts(self, test_client, db_session, auth_headers):
        """Should return the 200 status code"""

        get_resp = test_client.get(
            f'/mines/global-alerts', headers=auth_headers['full_auth_header'])
        
        assert get_resp.status_code == 200
