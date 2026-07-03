import json
from datetime import datetime, timedelta
from unittest.mock import MagicMock, patch, PropertyMock

from app.api.now_applications.models.now_application_status import NOWApplicationStatus
from tests.now_application_factories import NOWApplicationIdentityFactory, NOWApplicationFactory
from tests.factories import MineFactory


class TestNOWApplicationStatus:
    """GET /now-applications/application-status-codes"""
    def test_get_application_status_codes(self, test_client, db_session, auth_headers):
        """Should return the correct number of records with a 200 response code"""

        get_resp = test_client.get(
            f'/now-applications/application-status-codes', headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert len(get_data['records']) == len(NOWApplicationStatus.get_all())

    """PUT /now_applications/ID/status"""

    def test_put_application_status(self, test_client, db_session, auth_headers):
        mine = MineFactory(major_mine_ind=True, mine_permit_amendments=1)
        now_application = NOWApplicationFactory(application_progress=None)
        now_application_identity = NOWApplicationIdentityFactory(
            now_application=now_application, mine=mine)

        put_resp = test_client.put(
            f'/now-applications/{now_application_identity.now_application_guid}/status',
            json={
                'issue_date': datetime.now().isoformat(),
                'auth_end_date': (datetime.now() + timedelta(days=30)).isoformat(),
                'now_application_status_code': 'REJ'
            },
            headers=auth_headers['full_auth_header'])
        assert put_resp.status_code == 200, put_resp.response

    def test_put_application_status_WDN(self, test_client, db_session, auth_headers):
        mine = MineFactory(major_mine_ind=True, mine_permit_amendments=1)
        now_application = NOWApplicationFactory(application_progress=None)
        now_application_identity = NOWApplicationIdentityFactory(
            now_application=now_application, mine=mine)

        put_resp = test_client.put(
            f'/now-applications/{now_application_identity.now_application_guid}/status',
            json={
                'issue_date': datetime.now().isoformat(),
                'auth_end_date': (datetime.now() + timedelta(days=30)).isoformat(),
                'now_application_status_code': 'WDN'
            },
            headers=auth_headers['full_auth_header'])
        assert put_resp.status_code == 200, put_resp.response

    def test_put_AIA_substitutes_variables_for_core_generated_permit(self, test_client, db_session, auth_headers):
        """When is_generated_in_core=True, transform_variables_to_data and
        replace_condition_value_with_data should be called during AIA issuance."""
        mine = MineFactory(major_mine_ind=True, mine_permit_amendments=1)
        now_application = NOWApplicationFactory(application_progress=None)
        now_application_identity = NOWApplicationIdentityFactory(
            now_application=now_application, mine=mine)

        transformer_module = (
            'app.api.now_applications.resources.now_application_status_resource')

        mock_permit_amendment = MagicMock()
        mock_permit_amendment.is_generated_in_core = True
        mock_permit_amendment.permit_amendment_status_code = 'DFT'
        mock_permit_amendment.conditions = []
        mock_permit_amendment.preamble_text = '{mine_name} preamble'

        mock_permit = MagicMock()
        mock_permit.permit_status_code = 'O'

        mock_site_property = MagicMock()
        mock_site_property.mine_type_detail = []
        mock_site_property.mine_tenure_type_code = None

        with patch(f'{transformer_module}.Permit.find_by_now_application_guid', return_value=mock_permit), \
             patch(f'{transformer_module}.PermitAmendment.find_by_now_application_guid', return_value=mock_permit_amendment), \
             patch(f'{transformer_module}.transform_variables_to_data', return_value={'mine_name': 'Test Mine'}) as mock_transform, \
             patch(f'{transformer_module}.replace_condition_value_with_data', return_value='Test Mine preamble') as mock_replace, \
             patch(f'{transformer_module}.calculate_liability', return_value=0.0), \
             patch(f'{transformer_module}.MinePartyAppointment.find_current_appointments', return_value=[]), \
             patch(f'{transformer_module}.Permit.validate_exemption_fee_status'), \
             patch(f'{transformer_module}.MineType.find_by_permit_guid', return_value=None), \
             patch(f'{transformer_module}.MineType.create', return_value=MagicMock()), \
             patch(f'{transformer_module}.export_and_index_permit_amendments'), \
             patch('app.api.now_applications.models.now_application.NOWApplication.site_property',
                   new_callable=PropertyMock, return_value=mock_site_property):

            test_client.put(
                f'/now-applications/{now_application_identity.now_application_guid}/status',
                json={
                    'issue_date': datetime.now().isoformat(),
                    'auth_end_date': (datetime.now() + timedelta(days=30)).isoformat(),
                    'now_application_status_code': 'AIA',
                    'exemption_fee_status_code': 'fil',
                },
                headers=auth_headers['full_auth_header'])

            mock_transform.assert_called_once()
            mock_replace.assert_called()

    def test_put_AIA_skips_substitution_for_non_core_permit(self, test_client, db_session, auth_headers):
        """When is_generated_in_core=False, transform_variables_to_data should NOT be called."""
        mine = MineFactory(major_mine_ind=True, mine_permit_amendments=1)
        now_application = NOWApplicationFactory(application_progress=None)
        now_application_identity = NOWApplicationIdentityFactory(
            now_application=now_application, mine=mine)

        transformer_module = (
            'app.api.now_applications.resources.now_application_status_resource')

        mock_permit_amendment = MagicMock()
        mock_permit_amendment.is_generated_in_core = False
        mock_permit_amendment.permit_amendment_status_code = 'DFT'
        mock_permit_amendment.conditions = []
        mock_permit_amendment.preamble_text = '{mine_name} preamble'

        mock_permit = MagicMock()
        mock_permit.permit_status_code = 'O'

        with patch(f'{transformer_module}.Permit.find_by_now_application_guid', return_value=mock_permit), \
             patch(f'{transformer_module}.PermitAmendment.find_by_now_application_guid', return_value=mock_permit_amendment), \
             patch(f'{transformer_module}.transform_variables_to_data') as mock_transform, \
             patch(f'{transformer_module}.MinePartyAppointment.find_current_appointments', return_value=[]), \
             patch(f'{transformer_module}.Permit.validate_exemption_fee_status'), \
             patch(f'{transformer_module}.MineType.find_by_permit_guid', return_value=None), \
             patch(f'{transformer_module}.MineType.create', return_value=MagicMock()), \
             patch(f'{transformer_module}.export_and_index_permit_amendments'):

            test_client.put(
                f'/now-applications/{now_application_identity.now_application_guid}/status',
                json={
                    'issue_date': datetime.now().isoformat(),
                    'auth_end_date': (datetime.now() + timedelta(days=30)).isoformat(),
                    'now_application_status_code': 'AIA',
                    'exemption_fee_status_code': 'fil',
                },
                headers=auth_headers['full_auth_header'])

            mock_transform.assert_not_called()
