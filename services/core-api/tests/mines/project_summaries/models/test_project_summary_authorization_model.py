from tests.factories import ProjectSummaryFactory, ProjectSummaryAuthorizationFactory

from app.api.mines.project_summary.models.project_summary_authorization import ProjectSummaryAuthorization


def test_find_by_project_summary_authorization_guid(db_session):
    project_summary_authorization = ProjectSummaryAuthorizationFactory()
    project_summary_authorization_guid = project_summary_authorization.project_summary_authorization_guid
    project_summary_authorization = ProjectSummaryAuthorization.find_by_project_summary_authorization_guid(
        str(project_summary_authorization_guid))
    assert project_summary_authorization.project_summary_authorization_guid == project_summary_authorization_guid


def test_find_by_project_summary_guid(db_session):
    batch_size = 2
    project_summary = ProjectSummaryFactory()
    ProjectSummaryAuthorizationFactory.create_batch(
        project_summary=project_summary, size=batch_size)

    project_summary_guid = project_summary.project_summary_guid

    project_summary_authorizations = ProjectSummaryAuthorization.find_by_project_summary_guid(
        str(project_summary_guid))
    assert len(project_summary_authorizations) == batch_size
    assert all(project_summary_authorization.project_summary_guid == project_summary_guid
               for project_summary_authorization in project_summary_authorizations)
