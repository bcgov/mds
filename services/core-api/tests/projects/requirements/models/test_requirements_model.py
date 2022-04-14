from tests.factories import RequirementsFactory
from app.api.projects.information_requirements_table.models.requirements import Requirements


def test_find_all_requirements(db_session):
    batch_size = 10
    RequirementsFactory.create_batch(size= batch_size)

    requirements = Requirements.get_all()

    assert len(requirements) == batch_size


def test_requirements_find_by_requirement_guid(db_session):
    requirement = RequirementsFactory()
    requirement_guid = requirement.requirement_guid

    requirement = Requirements.find_by_requirement_guid(requirement_guid)
    assert requirement.requirement_guid == requirement_guid 