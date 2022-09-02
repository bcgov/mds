from tests.factories import ProjectFactory, ProjectDecisionPackageFactory
from app.api.projects.project_decision_package.models.project_decision_package import ProjectDecisionPackage


def test_project_decision_package_find_by_project_decision_package_guid(db_session):
    project_decision_package = ProjectDecisionPackageFactory()
    project_decision_package_guid = project_decision_package.project_decision_package_guid
    found_project_decision_package = ProjectDecisionPackage.find_by_project_decision_package_guid(
        str(project_decision_package_guid))

    assert found_project_decision_package.project_decision_package_guid == project_decision_package_guid


def test_project_decision_package_find_by_project_decision_package_id(db_session):
    project_decision_package = ProjectDecisionPackageFactory()
    project_decision_package_id = project_decision_package.project_decision_package_id
    found_project_decision_package = ProjectDecisionPackage.find_by_project_decision_package_id(
        str(project_decision_package_id))

    assert found_project_decision_package.project_decision_package_id == project_decision_package_id


def test_project_decision_package_find_by_project_guid(db_session):
    project = ProjectFactory()
    ProjectDecisionPackageFactory(project=project)
    project_decision_package = ProjectDecisionPackage.find_by_project_guid(str(project.project_guid))

    assert project_decision_package.project_guid == project.project_guid