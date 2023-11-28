from app.api.projects.project_link.models.project_link import ProjectLink
from tests.factories import ProjectLinkFactory

def test_find_by_project_link_guid(db_session):
    project_link = ProjectLinkFactory()
    project_link_guid = project_link.project_link_guid
    project_link = ProjectLink.find_by_project_link_guid(str(project_link_guid))
    assert project_link.project_link_guid == project_link_guid