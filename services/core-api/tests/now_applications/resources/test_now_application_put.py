import json, decimal, pytest
from flask_restx import marshal, fields

from app.api.now_applications.response_models import NOW_APPLICATION_MODEL
from tests.now_application_factories import NOWApplicationIdentityFactory, NOWApplicationFactory
from unittest.mock import patch

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

    @patch('app.api.now_applications.resources.now_application_resource.NROSNOWStatusService.nros_now_status_update')
    @patch('app.api.now_applications.resources.now_application_resource.DocumentManagerService.importNoticeOfWorkSubmissionDocuments')
    def test_put_now_application_tier_code(self, mock_import_docs, mock_nros, test_client, db_session, auth_headers):
        now_application = NOWApplicationFactory()
        test_application = NOWApplicationIdentityFactory(now_application=now_application)
        assert test_application.now_application
        data = marshal(test_application.now_application, NOW_APPLICATION_MODEL)

        assert data.get('now_application_tier_code') is None

        # Set tier for the first time
        data['now_application_tier_code'] = 'T1'
        data['now_application_tier_description'] = 'Sample reason for T1'
        put_resp1 = test_client.put(
            f'/now-applications/{test_application.now_application_guid}',
            json=data,
            headers=auth_headers['full_auth_header'])
        
        assert put_resp1.status_code == 200, put_resp1.response
        put_data1 = json.loads(put_resp1.data.decode())
        assert put_data1['now_application_tier_code'] == 'T1'

        # Update tier
        assert put_data1['now_application_tier_code'] == 'T1'
        assert put_data1['now_application_tier_description'] == 'Sample reason for T1'

        # Update tier code and description
        data['now_application_tier_code'] = 'T2'
        data['now_application_tier_description'] = 'Updated reason for T2'
        put_resp2 = test_client.put(
            f'/now-applications/{test_application.now_application_guid}',
            json=data,
            headers=auth_headers['full_auth_header'])

        assert put_resp2.status_code == 200, put_resp2.response
        put_data2 = json.loads(put_resp2.data.decode())
        assert put_data2['now_application_tier_code'] == 'T2'
        assert put_data2['now_application_tier_description'] == 'Updated reason for T2'

        # Latest tier should be T2
        assert test_application.now_application.now_application_tier_code == 'T2'

    @patch('app.api.now_applications.resources.now_application_resource.NROSNOWStatusService.nros_now_status_update')
    @patch('app.api.now_applications.resources.now_application_resource.DocumentManagerService.importNoticeOfWorkSubmissionDocuments')
    def test_put_now_application_tier_invalid_code(self, mock_import_docs, mock_nros, test_client, db_session, auth_headers):
        now_application = NOWApplicationFactory()
        test_application = NOWApplicationIdentityFactory(now_application=now_application)
        data = marshal(test_application.now_application, NOW_APPLICATION_MODEL)

        data['now_application_tier_code'] = 'INV'
        put_resp = test_client.put(
            f'/now-applications/{test_application.now_application_guid}',
            json=data,
            headers=auth_headers['full_auth_header'])
        
        assert put_resp.status_code == 400
        assert b'Invalid Tier Category code: INV' in put_resp.data

    @patch('app.api.now_applications.resources.now_application_resource.NROSNOWStatusService.nros_now_status_update')
    @patch('app.api.now_applications.resources.now_application_resource.DocumentManagerService.importNoticeOfWorkSubmissionDocuments')
    def test_put_now_application_tier_null_code_on_existing_tier(self, mock_import_docs, mock_nros, test_client, db_session, auth_headers):
        now_application = NOWApplicationFactory()
        test_application = NOWApplicationIdentityFactory(now_application=now_application)
        data = marshal(test_application.now_application, NOW_APPLICATION_MODEL)

        # First set it
        data['now_application_tier_code'] = 'T1'
        test_client.put(
            f'/now-applications/{test_application.now_application_guid}',
            json=data,
            headers=auth_headers['full_auth_header'])
        
        # Now try to set it to null
        data['now_application_tier_code'] = None
        put_resp = test_client.put(
            f'/now-applications/{test_application.now_application_guid}',
            json=data,
            headers=auth_headers['full_auth_header'])
        
        assert put_resp.status_code == 400
        assert b'Tier Category code cannot be null.' in put_resp.data
