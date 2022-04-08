from tests.factories import ProjectSummaryContactFactory, ProjectSummaryFactory

from app.api.projects.project_summary.models.project_summary_contact import ProjectSummaryContact


def test_find_project_summary_contact_by_guid(db_session):
    project_summary_contact = ProjectSummaryContactFactory()
    project_summary_contact_guid = project_summary_contact.project_summary_contact_guid
    project_summary_contact = ProjectSummaryContact.find_project_summary_contact_by_guid(
        str(project_summary_contact_guid))
    assert project_summary_contact.project_summary_contact_guid == project_summary_contact_guid


def test_find_project_summary_contacts_by_project_summary_guid(db_session):
    batch_size = 2
    project_summary = ProjectSummaryFactory()
    ProjectSummaryContactFactory.create_batch(project_summary=project_summary, size=batch_size)

    project_summary_guid = project_summary.project_summary_guid

    project_summary_contacts = ProjectSummaryContact.find_project_summary_contacts_by_project_summary_guid(
        str(project_summary_guid))
    assert len(project_summary_contacts) == batch_size
    assert all(project_summary_contact.project_summary_guid == project_summary_guid
               for project_summary_contact in project_summary_contacts)
