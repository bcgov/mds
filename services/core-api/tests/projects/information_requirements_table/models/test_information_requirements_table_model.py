from tests.factories import ProjectFactory, InformationRequirementsTableFactory
from app.api.projects.information_requirements_table.models.information_requirements_table import InformationRequirementsTable


def test_find_information_requirements_table_by_irt_guid(db_session):
    project = ProjectFactory()
    irt = InformationRequirementsTableFactory(project=project)

    irt_guid = irt.irt_guid

    irt = InformationRequirementsTable.find_by_irt_guid(str(irt_guid))
    assert irt.irt_guid == irt_guid


def test_find_information_requirements_table_by_project_guid(db_session):
    project = ProjectFactory()
    irt = InformationRequirementsTableFactory(project=project)

    project_guid = project.project_guid

    irt = InformationRequirementsTable.find_by_project_guid(str(project_guid))
    assert irt.project_guid == project_guid
