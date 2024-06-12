from tests.factories import MineFactory, ProjectSummaryFactory, ProjectFactory

from app.api.projects.project_summary.models.project_summary import ProjectSummary


def test_project_summary_find_by_project_summary_guid(db_session):
    project_summary = ProjectSummaryFactory()
    project_summary_guid = project_summary.project_summary_guid
    project_summary = ProjectSummary.find_by_project_summary_guid(str(project_summary_guid))
    assert project_summary.project_summary_guid == project_summary_guid


def test_project_summary_find_by_project_guid(db_session):
    batch_size = 1
    project = ProjectFactory.create_batch(size=batch_size)
    project_summaries = ProjectSummary.find_by_project_guid(str(project[0].project_guid))

    assert len(project_summaries) == batch_size
    assert all(project_summary.project_guid == project[0].project_guid
               for project_summary in project_summaries)
