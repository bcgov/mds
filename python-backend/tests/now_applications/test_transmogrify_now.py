from tests.now_submission_factories import NOWSubmissionFactory

from app.api.now_applications.models.now_application_identity import NOWApplicationIdentity
from app.api.now_applications.transmogrify_now import transmogrify_now


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
        assert na.camps
        assert na.cut_lines_polarization_survey
        assert na.exploration_surface_drilling
        assert na.exploration_access
        assert na.mechanical_trenching
        assert na.placer_operation
        assert na.sand_and_gravel
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
        assert not na.camps
        assert not na.cut_lines_polarization_survey
        assert not na.exploration_surface_drilling
        assert not na.exploration_access
        assert not na.mechanical_trenching
        assert not na.placer_operation
        assert not na.sand_and_gravel
        assert not na.surface_bulk_sample
        assert na.water_supply
        assert not na.settling_pond
        assert not na.underground_exploration
