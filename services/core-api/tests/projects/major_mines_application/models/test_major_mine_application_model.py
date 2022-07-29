from tests.factories import ProjectFactory, MajorMineApplicationFactory
from app.api.projects.major_mine_application.models.major_mine_application import MajorMineApplication


def test_major_mine_application_find_by_major_mine_application_guid(db_session):
    major_mine_application = MajorMineApplicationFactory()
    major_mine_application_guid = major_mine_application.major_mine_application_guid
    major_mine_application = MajorMineApplication.find_by_major_mine_application_guid(
        str(major_mine_application_guid))

    assert major_mine_application.major_mine_application_guid == major_mine_application_guid


def test_major_mine_application_find_by_project_guid(db_session):
    project = ProjectFactory()
    major_mine_application = MajorMineApplicationFactory(project=project)
    major_mine_application = MajorMineApplication.find_by_project_guid(str(project.project_guid))

    assert major_mine_application.project_guid == project.project_guid