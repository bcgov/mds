from tests.factories import ProjectContactFactory, ProjectSummaryFactory, ProjectFactory

from app.api.projects.project_contact.models.project_contact import ProjectContact


def test_find_project_contact_by_guid(db_session):
    project_contact = ProjectContactFactory()
    project_contact_guid = project_contact.project_contact_guid
    project_contact = ProjectContact.find_project_contact_by_guid(str(project_contact_guid))
    assert project_contact.project_contact_guid == project_contact_guid


def test_find_project_contacts_by_project_guid(db_session):
    batch_size = 2
    project = ProjectFactory()
    # ProjectContactFactory.create_batch(project=project, size=batch_size)

    project_guid = project.project_guid

    project_contacts = ProjectContact.find_project_contacts_by_project_guid(str(project_guid))
    assert len(project_contacts) == batch_size
    assert all(project_contact.project_guid == project_guid for project_contact in project_contacts)
