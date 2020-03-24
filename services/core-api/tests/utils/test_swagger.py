
class TestSwagger:
    """GET /"""
    def test_swagger_returns_success(self, test_client, db_session):
        """Should return the correct records with a 200 response code"""
        get_resp = test_client.get('/swagger.json')
        assert get_resp.status_code == 200, get_resp.response
