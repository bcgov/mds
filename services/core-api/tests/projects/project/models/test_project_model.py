from tests.factories import ProjectFactory, MineFactory, ProjectSummaryFactory, ProjectFactory

from app.api.projects.project_summary.models.project_summary import ProjectSummary
from app.api.projects.project.models.project import Project


def test_project_find_by_project_guid(db_session):
    project = ProjectFactory()
    project_guid = project.project_guid
    project = Project.find_by_project_guid(str(project_guid))
    assert project.project_guid == project_guid


def test_project_find_by_mine_guid(db_session):
    batch_size = 3
    mine = MineFactory(minimal=True)
    # ProjectFactory.create_batch(mine=mine, size=batch_size)

    mine_guid = mine.mine_guid

    projects = Project.find_by_mine_guid(str(mine_guid))
    assert len(projects) == batch_size
    assert all(project.mine_guid == mine_guid for project in projects)
