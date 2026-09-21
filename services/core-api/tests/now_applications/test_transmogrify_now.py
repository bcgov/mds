from tests.now_submission_factories import NOWSubmissionFactory

from app.api.now_applications.models.now_application_identity import NOWApplicationIdentity
from app.api.now_applications.transmogrify_now import transmogrify_now
from app.api.now_submissions.models.fuel import Fuel


class TestPostApplicationImportResource:
    """GET /now-applications/{application_guid}/import"""

    def test_transmogrify_success(self, db_session):
        now_submission = NOWSubmissionFactory()
        now_application_identity = NOWApplicationIdentity(messageid=now_submission.messageid, mine_guid=now_submission.mine_guid)
        assert transmogrify_now(now_application_identity)

    def test_transmogrify_success_all_activites(self, db_session):
        now_submission = NOWSubmissionFactory()
        now_application_identity = NOWApplicationIdentity(messageid=now_submission.messageid, mine_guid=now_submission.mine_guid)
        na = transmogrify_now(now_application_identity)
        assert na.blasting_operation
        assert na.state_of_land
        assert na.camp
        assert na.cut_lines_polarization_survey
        assert na.exploration_surface_drilling
        assert na.exploration_access
        assert na.mechanical_trenching
        assert na.placer_operation
        assert na.sand_gravel_quarry_operation
        assert na.surface_bulk_sample
        assert na.water_supply
        assert na.settling_pond
        assert na.underground_exploration

    def test_transmogrify_success_no_activites(self, db_session):
        now_submission = NOWSubmissionFactory(all_activites=False)
        now_application_identity = NOWApplicationIdentity(messageid=now_submission.messageid, mine_guid=now_submission.mine_guid)
        na = transmogrify_now(now_application_identity)
        assert not na.blasting_operation
        assert not na.state_of_land
        assert not na.camp
        assert not na.cut_lines_polarization_survey
        assert not na.exploration_surface_drilling
        assert not na.exploration_access
        assert not na.mechanical_trenching
        assert not na.placer_operation
        assert not na.sand_gravel_quarry_operation
        assert not na.surface_bulk_sample
        assert na.water_supply
        assert not na.settling_pond
        assert not na.underground_exploration

    def test_transmogrify_work_year_info(self, db_session):
        now_submission = NOWSubmissionFactory(yearroundseasonal='Seasonal')
        now_application_identity = NOWApplicationIdentity(messageid=now_submission.messageid, mine_guid=now_submission.mine_guid)
        na = transmogrify_now(now_application_identity)
        assert na.work_year_info == 'Seasonal'

    def test_transmogrify_drill_site_fields(self, db_session):
        now_submission = NOWSubmissionFactory(
            nowmorethan25drillsites='Yes', nowexplnumprpsdunrecldrillsite=50)
        now_application_identity = NOWApplicationIdentity(messageid=now_submission.messageid, mine_guid=now_submission.mine_guid)
        na = transmogrify_now(now_application_identity)
        assert na.exploration_surface_drilling.has_more_than_25_unreclaimed_drill_sites is True
        assert na.exploration_surface_drilling.num_unreclaimed_drill_sites == 50

    def test_transmogrify_protection_of_cultural_heritage_resources(self, db_session):
        now_submission = NOWSubmissionFactory(
            protectionofculturalheritageresources='Some protected resources description')
        now_application_identity = NOWApplicationIdentity(messageid=now_submission.messageid, mine_guid=now_submission.mine_guid)
        na = transmogrify_now(now_application_identity)
        assert na.state_of_land.protection_of_cultural_heritage_resources == 'Some protected resources description'

    def test_transmogrify_fuel_details_none(self, db_session):
        now_submission = NOWSubmissionFactory(camp=True)
        now_application_identity = NOWApplicationIdentity(messageid=now_submission.messageid, mine_guid=now_submission.mine_guid)
        na = transmogrify_now(now_application_identity)
        assert na.camp
        assert na.camp.fuel_details == []

    def test_transmogrify_fuel_details_single_entry_creates_camp(self, db_session):
        now_submission = NOWSubmissionFactory()
        Fuel(
            messageid=now_submission.messageid,
            fueltype='Diesel',
            fuelrelatedactivity='Barrel Storage',
            estimatedfuelvolume=500,
            descriptionoffuelrelatedactivity='A diesel stove may be used to heat core tent.',
            descriptionofprecautionarymeasures='A fuel berm would surround the diesel barrel.').save()
        now_application_identity = NOWApplicationIdentity(messageid=now_submission.messageid, mine_guid=now_submission.mine_guid)
        na = transmogrify_now(now_application_identity)
        assert na.camp
        assert len(na.camp.fuel_details) == 1
        fuel_detail = na.camp.fuel_details[0]
        assert fuel_detail.fuel_type == 'Diesel'
        assert fuel_detail.fuel_related_activity == 'Barrel Storage'
        assert fuel_detail.estimated_fuel_volume == 500
        assert fuel_detail.description_of_fuel_related_activity == 'A diesel stove may be used to heat core tent.'
        assert fuel_detail.description_of_precautionary_measures == 'A fuel berm would surround the diesel barrel.'

    def test_transmogrify_fuel_details_multiple_entries(self, db_session):
        now_submission = NOWSubmissionFactory()
        Fuel(messageid=now_submission.messageid, fueltype='Diesel', estimatedfuelvolume=500).save()
        Fuel(messageid=now_submission.messageid, fueltype='Propane', estimatedfuelvolume=200).save()
        now_application_identity = NOWApplicationIdentity(messageid=now_submission.messageid, mine_guid=now_submission.mine_guid)
        na = transmogrify_now(now_application_identity)
        assert len(na.camp.fuel_details) == 2
        fuel_types = {fd.fuel_type for fd in na.camp.fuel_details}
        assert fuel_types == {'Diesel', 'Propane'}
