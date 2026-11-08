from types import SimpleNamespace

from flask_restx import marshal

from app.api.now_applications.resources.now_application_export_resource import has_legacy_fuel_data
from app.api.now_applications.response_models import NOW_APPLICATION_MODEL_EXPORT


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
