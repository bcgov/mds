from tests.now_factories import NOWSubmissionFactory

from app.api.now_applications.transmogrify_now import transmogrify_now


class TestPostApplicationImportResource:
    """GET /now-applications/{application_guid}/import"""

    def test_transmogrify_success(self, db_session):
        now_submission = NOWSubmissionFactory()
        assert transmogrify_now(now_submission.messageid)

    def test_transmogrify_success(self, db_session):
        now_submission = NOWSubmissionFactory()
        na = transmogrify_now(now_submission.messageid)
        assert na.blasting
        assert na.state_of_land
        assert na.camps
        assert na.cut_lines_polarization_survey
        assert na.exploration_surface_drilling
        assert na.mechanical_trenching
        assert na.placer_operation
        assert na.sand_and_gravel
        assert na.surface_bulk_sample
        assert na.water_supply
        assert na.exploration_access
        assert na.settling_pond
        assert na.underground_exploration