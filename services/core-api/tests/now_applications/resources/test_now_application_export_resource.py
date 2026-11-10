from types import SimpleNamespace

import pytest
from flask_restx import marshal

from app.api.constants import NOW_DOCUMENT_DOWNLOAD_TOKEN
from app.api.now_applications.resources.now_application_export_resource import has_legacy_fuel_data
from app.api.now_applications.response_models import NOW_APPLICATION_MODEL_EXPORT
from app.extensions import cache
from tests.now_application_factories import NOWApplicationIdentityFactory


class TestHasLegacyFuelData:
    def test_false_when_no_camp(self):
        assert has_legacy_fuel_data(None) is False

    def test_false_when_all_legacy_fields_empty(self):
        camp = {
            'has_fuel_stored': True,
            'has_fuel_stored_in_bulk': None,
            'has_fuel_stored_in_barrels': None,
            'volume_fuel_stored': None,
        }
        assert has_legacy_fuel_data(camp) is False

    def test_true_when_any_legacy_field_has_value(self):
        # False is still a value - matches the front-end's `!= null` check
        assert has_legacy_fuel_data({'has_fuel_stored_in_bulk': False}) is True
        assert has_legacy_fuel_data({'has_fuel_stored_in_barrels': True}) is True
        assert has_legacy_fuel_data({'volume_fuel_stored': '0.00'}) is True


class TestNowApplicationExportModel:
    def test_includes_mds_6968_fields(self, app):
        now_application = SimpleNamespace(
            work_year_info='Seasonal',
            state_of_land=SimpleNamespace(
                protection_of_cultural_heritage_resources='Protection plan'),
            exploration_surface_drilling=SimpleNamespace(
                has_more_than_25_unreclaimed_drill_sites=True, num_unreclaimed_drill_sites=30),
            camp=SimpleNamespace(fuel_details=[
                SimpleNamespace(
                    fuel_type='Diesel',
                    fuel_related_activity='Storage',
                    estimated_fuel_volume=500,
                    description_of_fuel_related_activity='Tank storage',
                    description_of_precautionary_measures='Spill kit')
            ]),
        )

        result = marshal(now_application, NOW_APPLICATION_MODEL_EXPORT)

        assert result['work_year_info'] == 'Seasonal'
        assert result['state_of_land'][
            'protection_of_cultural_heritage_resources'] == 'Protection plan'
        assert result['exploration_surface_drilling'][
            'has_more_than_25_unreclaimed_drill_sites'] is True
        assert result['exploration_surface_drilling']['num_unreclaimed_drill_sites'] == 30
        fuel_detail = result['camp']['fuel_details'][0]
        assert fuel_detail['fuel_type'] == 'Diesel'
        assert fuel_detail['fuel_related_activity'] == 'Storage'
        assert fuel_detail['estimated_fuel_volume'] == '500.00'
        assert fuel_detail['description_of_fuel_related_activity'] == 'Tank storage'
        assert fuel_detail['description_of_precautionary_measures'] == 'Spill kit'


class TestNowApplicationExportResource:
    """POST /now-applications/application-export/NTR"""

    @pytest.mark.parametrize('legacy_volume, expected_flag', [(None, 'No'), (100, 'Yes')])
    def test_template_data_includes_mds_6968_fields(self, test_client, db_session, auth_headers,
                                                    legacy_volume, expected_flag):
        identity = NOWApplicationIdentityFactory()
        now_application = identity.now_application
        now_application.work_year_info = 'Seasonal'
        now_application.camp.has_fuel_stored_in_bulk = None
        now_application.camp.has_fuel_stored_in_barrels = None
        now_application.camp.volume_fuel_stored = legacy_volume
        db_session.commit()

        resp = test_client.post(
            '/now-applications/application-export/NTR',
            json={'now_application_guid': str(identity.now_application_guid)},
            headers=auth_headers['full_auth_header'])
        assert resp.status_code == 200, resp.response

        template_data = cache.get(
            NOW_DOCUMENT_DOWNLOAD_TOKEN(resp.get_json()['token']))['template_data']
        assert template_data['work_year_info'] == 'Seasonal'
        assert template_data['camp']['has_legacy_fuel_data'] == expected_flag
