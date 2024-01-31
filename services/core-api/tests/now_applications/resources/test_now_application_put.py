import json, decimal, pytest
from flask_restx import marshal, fields

from app.api.now_applications.response_models import NOW_APPLICATION_MODEL
from tests.now_application_factories import NOWApplicationIdentityFactory, NOWApplicationFactory


class TestNOWApplication:
    """PUT mines/now-applications/<guid>"""
    @pytest.mark.skip(
        reason='Application changes now fire a request to NROS so need to mock the service call.')
    def test_put_application_field(self, test_client, db_session, auth_headers):
        now_application = NOWApplicationFactory()
        test_application = NOWApplicationIdentityFactory(now_application=now_application)
        assert test_application.now_application
        data = marshal(test_application.now_application, NOW_APPLICATION_MODEL)

        new_latitude = '-55.111'
        data['latitude'] = new_latitude

        put_resp = test_client.put(
            f'/now-applications/{test_application.now_application_guid}',
            json=data,
            headers=auth_headers['full_auth_header'])
        assert put_resp.status_code == 200, put_resp.response

        put_data = json.loads(put_resp.data.decode())
        assert decimal.Decimal(put_data['latitude']) == decimal.Decimal(new_latitude)
