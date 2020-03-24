
import json

from tests.factories import BondFactory, MineFactory, PermitFactory, PartyFactory
from app.api.now_applications.resources.now_application_list_resource import PAGE_DEFAULT, PER_PAGE_DEFAULT


class TestSwagger:
    """GET /"""
    def test_swagger_returns_success(self, test_client, db_session, auth_headers):
        """Should return the correct records with a 200 response code"""
        get_resp = test_client.get('/swagger.json')
        assert get_resp.status_code == 200, get_resp.response
