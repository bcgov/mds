import pytest
from app.api.mines.permits.permit_conditions.models.permit_conditions import (
    PermitConditions,
)
from app.api.mines.permits.permit_extraction.create_permit_conditions import (
    create_permit_conditions_from_task,
)
from app.api.mines.permits.permit_extraction.models.permit_extraction_task import (
    PermitExtractionTask,
)
from app.api.mines.reports.models.mine_report_permit_requirement import (
    MineReportPermitRequirement,
)
from tests.factories import create_mine_and_permit


@pytest.fixture(scope="function")
def permit_amendment(test_client, db_session):
    # Create a sample PermitExtractionTask object
    mine, permit = create_mine_and_permit()
    permit_amendment = permit.permit_amendments[0]
    PermitConditions.query.delete()
    db_session.flush()

    yield permit_amendment


@pytest.fixture(scope="function")
def permit_conditions(permit_amendment, db_session):
    task = PermitExtractionTask(
        task_result={
            "conditions": [
                # General Section
                {
                    "section": "A",
                    "paragraph": None,
                    "subparagraph": None,
                    "clause": None,
                    "subclause": None,
                    "subsubclause": None,
                    "condition_title": None,
                    "condition_text": "General",
                },
                {
                    "section": "A",
                    "paragraph": "1",
                    "subparagraph": None,
                    "clause": None,
                    "subclause": None,
                    "subsubclause": None,
                    "condition_title": None,
                    "condition_text": "This is a paragraph",
                },
                {
                    "section": "A",
                    "paragraph": "1",
                    "subparagraph": "1",
                    "clause": None,
                    "subclause": None,
                    "subsubclause": None,
                    "condition_title": None,
                    "condition_text": "This is a subparagraph",
                },
                {
                    "section": "A",
                    "paragraph": "1",
                    "subparagraph": "1",
                    "clause": "a",
                    "subclause": None,
                    "subsubclause": None,
                    "condition_title": None,
                    "condition_text": "This is a clause",
                },
                {
                    "section": "A",
                    "paragraph": "1",
                    "subparagraph": "1",
                    "clause": "a",
                    "subclause": "b",
                    "subsubclause": None,
                    "condition_title": "This condition has a title",
                    "condition_text": "This is a subclause",
                },
                # Protection of Land and Watercourses Section
                {
                    "section": "B",
                    "paragraph": None,
                    "subparagraph": None,
                    "clause": None,
                    "subclause": None,
                    "subsubclause": None,
                    "condition_title": None,
                    "condition_text": "Protection of Land and Watercourses",
                },
                {
                    "section": "B",
                    "paragraph": "2",
                    "subparagraph": None,
                    "clause": None,
                    "subclause": None,
                    "subsubclause": None,
                    "condition_text": "Another paragraph",
                },
                # Custom section
                {
                    "section": "C",
                    "paragraph": None,
                    "subparagraph": None,
                    "clause": None,
                    "subclause": None,
                    "subsubclause": None,
                    "condition_title": None,
                    "condition_text": "This is just a test",
                },
                {
                    "section": "C",
                    "paragraph": "1",
                    "subparagraph": None,
                    "clause": None,
                    "subclause": None,
                    "subsubclause": None,
                    "condition_text": "A test paragraph",
                },
            ]
        },
        permit_amendment=permit_amendment,
    )
    # Call the function
    create_permit_conditions_from_task(task)

    # Retrieve the created permit conditions from the database
    permit_conditions = PermitConditions.find_by_permit_amendment_id_ordered(permit_amendment.permit_amendment_id)

    return permit_conditions


def test_create_permit_conditions_from_task(
    permit_conditions, permit_amendment, db_session
): 

    assert len(permit_conditions) == 7
    ### General Section
    gen_cat = permit_conditions[0]

    # Top level sections are not created as a PermitCondition. They are mapped to a PermitConditionCategory instead
    assert (
        permit_conditions[0].permit_amendment_id == permit_amendment.permit_amendment_id
    )
    assert permit_conditions[0].condition_category_code != "GEC"
    assert permit_conditions[0].condition_category.description == "General"
    assert permit_conditions[0].condition == "This is a paragraph"
    assert permit_conditions[0].condition_type_code == "SEC"  # First level is a section
    assert permit_conditions[0].parent_permit_condition_id is None
    assert permit_conditions[0]._step == "1"

    assert (
        permit_conditions[1].permit_amendment_id == permit_amendment.permit_amendment_id
    )
    assert (
        permit_conditions[1].condition_category_code == gen_cat.condition_category_code
    )
    assert permit_conditions[1].condition == "This is a subparagraph"
    assert (
        permit_conditions[1].condition_type_code == "CON"
    )  # Second level is a condition
    assert (
        permit_conditions[1].parent_permit_condition_id == gen_cat.permit_condition_id
    )
    assert permit_conditions[1]._step == "1"

    assert (
        permit_conditions[2].permit_amendment_id == permit_amendment.permit_amendment_id
    )
    assert (
        permit_conditions[2].condition_category_code == gen_cat.condition_category_code
    )
    assert permit_conditions[2].condition == "This is a clause"
    assert (
        permit_conditions[2].condition_type_code == "LIS"
    )  # Third level on is a list item
    assert (
        permit_conditions[2].parent_permit_condition_id
        == permit_conditions[1].permit_condition_id
    )
    assert permit_conditions[2]._step == "a"

    # When a condition both has a title and text, they are created as two conditions, with the text as a child of the title
    # Note: This was an assumption made to make the display more accurately reflect the PDF. May need a revision.
    assert (
        permit_conditions[3].permit_amendment_id == permit_amendment.permit_amendment_id
    )
    assert (
        permit_conditions[3].condition_category_code == gen_cat.condition_category_code
    )
    assert permit_conditions[3].condition == "This condition has a title"
    assert permit_conditions[3].condition_type_code == "LIS"
    assert (
        permit_conditions[3].parent_permit_condition_id
        == permit_conditions[2].permit_condition_id
    )
    assert permit_conditions[3]._step == "b"

    assert (
        permit_conditions[4].permit_amendment_id == permit_amendment.permit_amendment_id
    )
    assert (
        permit_conditions[4].condition_category_code == gen_cat.condition_category_code
    )
    assert permit_conditions[4].condition == "This is a subclause"
    assert permit_conditions[4].condition_type_code == "LIS"
    assert (
        permit_conditions[4].parent_permit_condition_id
        == permit_conditions[3].permit_condition_id
    )
    assert (
        permit_conditions[4]._step == ""
    )  # This is a child of the title condition - which in the PDFs do not have a step


def test_creates_general_conditions_as_unique_for_permit_amendment(
    permit_conditions, permit_amendment, db_session
):
    # Protection of Land and Watercourses Section
    assert (
        permit_conditions[5].permit_amendment_id == permit_amendment.permit_amendment_id
    )
    assert permit_conditions[5].condition_category_code != "ELC"
    assert (
        permit_conditions[5].condition_category.description
        == "Protection of Land and Watercourses"
    )
    assert permit_conditions[5].condition == "Another paragraph"
    assert permit_conditions[5].condition_type_code == "SEC"
    assert permit_conditions[5].parent_permit_condition_id is None
    assert permit_conditions[5]._step == "2"


def test_creates_custom_conditions(permit_conditions, permit_amendment, db_session):
    # Can handle custom sections
    assert (
        permit_conditions[6].permit_amendment_id == permit_amendment.permit_amendment_id
    )
    assert permit_conditions[6].condition_category.description == "This is just a test"
    assert permit_conditions[6].condition == "A test paragraph"
    assert permit_conditions[6].parent_permit_condition_id is None
    assert (
        permit_conditions[6].condition_category.permit_amendment_id
        == permit_amendment.permit_amendment_id
    )
    assert permit_conditions[6]._step == "1"


def test_report_requirement_exists(permit_amendment, db_session):
    task = PermitExtractionTask(
        task_result={
            "conditions": [
                {
                    "section": "D",
                    "paragraph": "1",
                    "subparagraph": None,
                    "clause": None,
                    "subclause": None,
                    "subsubclause": None,
                    "condition_title": None,
                    "condition_text": "This is a report requirement",
                    "meta": {
                        "questions": [
                            {"question_key": "require_report", "answer": True},
                            {"question_key": "report_name", "answer": "Test Report"},
                            {"question_key": "due_date", "answer": "2023-12-31"},
                            {"question_key": "recurring", "answer": True},
                            {"question_key": "frequency", "answer": "monthly"},
                            {"question_key": "mention_chief_inspector", "answer": True},
                            {
                                "question_key": "mention_chief_permitting_officer",
                                "answer": False,
                            },
                        ]
                    },
                }
            ]
        },
        permit_amendment=permit_amendment,
    )
    create_permit_conditions_from_task(task)
    report_requirements = MineReportPermitRequirement.query.all()
    assert len(report_requirements) == 1
    assert report_requirements[0].report_name == "Test Report"


def test_nested_display_order(test_client, db_session, permit_amendment):
    # Create a task with nested conditions
    task = PermitExtractionTask(
        permit_amendment=permit_amendment,
        task_result={
            "conditions": [
                {
                    "section": "A",
                    "condition_text": "General",
                },
                {
                    "section": "A",
                    "paragraph": "1",
                    "condition_text": "First sub-condition",
                },
                {
                    "section": "A",
                    "paragraph": "2",
                    "condition_text": "Second sub-condition",
                },
                {
                    "section": "A",
                    "paragraph": "2",
                    "subparagraph": "a",
                    "condition_text": "Nested condition",
                },
                {
                    "section": "A",
                    "paragraph": "2",
                    "subparagraph": "a",
                    "clause": "i",
                    "condition_text": "Clause",
                },
                {
                    "section": "A",
                    "paragraph": "2",
                    "subparagraph": "a",
                    "clause": "ii",
                    "condition_text": "Clause2",
                },
                {"section": "B", "condition_text": "Another section"},
            ]
        },
    )

    create_permit_conditions_from_task(task)

    # Query conditions and verify display orders
    conditions = db_session.query(PermitConditions).all()

    # Create a map of conditions by their text for easier testing
    conditions_map = {c.condition: c for c in conditions}

    assert len(conditions_map.keys()) == 5

    # Verify sub-conditions are top-level (sections are "Categories", so not part of the tree)
    assert conditions_map["First sub-condition"].parent_permit_condition_id is None
    assert conditions_map["First sub-condition"].display_order == 1

    assert conditions_map["Second sub-condition"].parent_permit_condition_id is None
    assert conditions_map["Second sub-condition"].display_order == 2

    assert conditions_map["Nested condition"].display_order == 1

    assert conditions_map["Clause"].display_order == 1
    assert conditions_map["Clause2"].display_order == 2

    # Verify nested condition is a child of the second sub-condition
    assert (
        conditions_map["Nested condition"].parent_permit_condition_id
        == conditions_map["Second sub-condition"].permit_condition_id
    )
    assert (
        conditions_map["Clause"].parent_permit_condition_id
        == conditions_map["Nested condition"].permit_condition_id
    )
    assert (
        conditions_map["Clause2"].parent_permit_condition_id
        == conditions_map["Nested condition"].permit_condition_id
    )


def test_display_order_with_titles(test_client, db_session, permit_amendment):
    task = PermitExtractionTask(
        permit_amendment=permit_amendment,
        task_result={
            "conditions": [
                {
                    "section": "A",
                    "condition_text": "Firstt secion",
                },
                {
                    "section": "A",
                    "paragraph": "1",
                    "condition_text": "Sub 1",
                },
                {
                    "section": "A",
                    "paragraph": "2",
                    "condition_text": "Sub 2",
                },
            ]
        },
    )

    create_permit_conditions_from_task(task)

    conditions = db_session.query(PermitConditions).all()
    conditions_map = {c.condition: c for c in conditions}

    assert len(conditions_map.keys()) == 2

    # Verify display orders with titles
    assert conditions_map["Sub 1"].display_order == 1
    assert conditions_map["Sub 2"].display_order == 2
