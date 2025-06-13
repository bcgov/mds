from tests.factories import AmsFinalApplicationFactory, ProjectSummaryAmsAuthorizationFactory, ProjectSummaryFactory
from app.api.projects.ams_final_application.models.ams_final_application import AmsFinalApplication

def test_ams_final_app_find_by_auth_guid(db_session):
    final_app = AmsFinalApplicationFactory()

    query_result = AmsFinalApplication.find_by_authorization_guid(final_app.project_summary_authorization_guid)
    assert final_app.ams_final_application_guid == query_result.ams_final_application_guid

def test_ams_final_app_find_by_project_summary_guid(db_session):
    project_summary = ProjectSummaryFactory()

    auth_1 = ProjectSummaryAmsAuthorizationFactory(project_summary=project_summary)
    auth_2 = ProjectSummaryAmsAuthorizationFactory(project_summary=project_summary)
    auth_3 = ProjectSummaryAmsAuthorizationFactory(project_summary=project_summary)
    auth_4 = ProjectSummaryAmsAuthorizationFactory(project_summary=project_summary)

    final_app_1 = AmsFinalApplicationFactory(project_summary_authorization=auth_1)
    final_app_2 = AmsFinalApplicationFactory(project_summary_authorization=auth_2)
    final_app_3 = AmsFinalApplicationFactory(project_summary_authorization=auth_3)

    result = AmsFinalApplication.find_by_project_summary_guid(project_summary.project_summary_guid)

    assert len(result) == 3