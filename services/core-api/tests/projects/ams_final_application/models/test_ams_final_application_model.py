from tests.factories import AmsFinalApplicationFactory
from app.api.projects.ams_final_application.models.ams_final_application import AmsFinalApplication

def test_ams_final_app_find_by_auth_guid(db_session):
    final_app = AmsFinalApplicationFactory()

    query_result = AmsFinalApplication.find_by_authorization_guid(final_app.project_summary_authorization_guid)
    assert final_app.ams_final_application_guid == query_result.ams_final_application_guid