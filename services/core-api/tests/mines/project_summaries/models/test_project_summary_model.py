from tests.factories import MineFactory, ProjectSummaryFactory

from app.api.mines.project_summary.models.project_summary import ProjectSummary


def test_project_summary_find_by_project_summary_guid(db_session):
    project_summary = ProjectSummaryFactory()
    project_summary_guid = project_summary.project_summary_guid
    project_summary = ProjectSummary.find_by_project_summary_guid(str(project_summary_guid))
    assert project_summary.project_summary_guid == project_summary_guid


def test_project_summary_find_by_mine_guid(db_session):
    batch_size = 2
    mine = MineFactory(minimal=True)
    ProjectSummaryFactory.create_batch(mine=mine, size=batch_size)

    mine_guid = mine.mine_guid

    project_summaries = ProjectSummary.find_by_mine_guid(str(mine_guid))
    assert len(project_summaries) == batch_size
    assert all(project_summary.mine_guid == mine_guid for project_summary in project_summaries)
