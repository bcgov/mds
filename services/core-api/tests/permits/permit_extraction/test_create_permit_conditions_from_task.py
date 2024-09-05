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
from tests.factories import create_mine_and_permit


@pytest.fixture(scope="function")
def permit_amendment(test_client):
    # Create a sample PermitExtractionTask object
    mine, permit = create_mine_and_permit()
    permit_amendment = permit.permit_amendments[0]
    PermitConditions.query.delete()

    yield permit_amendment


def test_create_permit_conditions_from_task(permit_amendment):

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
                    "clause": 'a',
                    "subclause": None,
                    "subsubclause": None,
                    "condition_title": None,
                    "condition_text": "This is a clause",
                },
                {
                    "section": "A",
                    "paragraph": "1",
                    "subparagraph": "1",
                    "clause": 'a',
                    "subclause": 'b',
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

            ]
        },
        permit_amendment=permit_amendment,
    )

    # Call the function
    create_permit_conditions_from_task(task)

    # Retrieve the created permit conditions from the database
    permit_conditions = PermitConditions.query.all()

    # Assert the created permit conditions
    assert len(permit_conditions) == 6

    ### General Section

    # Top level sections are not created as a PermitCondition. They are mapped to a PermitConditionCategory instead
    assert permit_conditions[0].permit_amendment_id == permit_amendment.permit_amendment_id
    assert permit_conditions[0].condition_category_code == "GEC"
    assert permit_conditions[0].condition == "This is a paragraph"
    assert permit_conditions[0].condition_type_code == "SEC" # First level is a section
    assert permit_conditions[0].parent_permit_condition_id is None
    assert permit_conditions[0]._step == "1"

    assert permit_conditions[1].permit_amendment_id == permit_amendment.permit_amendment_id
    assert permit_conditions[1].condition_category_code == "GEC"
    assert permit_conditions[1].condition == "This is a subparagraph"
    assert permit_conditions[1].condition_type_code == "CON" # Second level is a condition
    assert permit_conditions[1].parent_permit_condition_id == permit_conditions[0].permit_condition_id
    assert permit_conditions[1]._step == "1"

    assert permit_conditions[2].permit_amendment_id == permit_amendment.permit_amendment_id
    assert permit_conditions[2].condition_category_code == "GEC"
    assert permit_conditions[2].condition == "This is a clause"
    assert permit_conditions[2].condition_type_code == "LIS" # Third level on is a list item
    assert permit_conditions[2].parent_permit_condition_id == permit_conditions[1].permit_condition_id
    assert permit_conditions[2]._step == "a"

    # When a condition both has a title and text, they are created as two conditions, with the text as a child of the title
    # Note: This was an assumption made to make the display more accurately reflect the PDF. May need a revision.
    assert permit_conditions[3].permit_amendment_id == permit_amendment.permit_amendment_id
    assert permit_conditions[3].condition_category_code == "GEC"
    assert permit_conditions[3].condition == "This condition has a title"
    assert permit_conditions[3].condition_type_code == "LIS"
    assert permit_conditions[3].parent_permit_condition_id == permit_conditions[2].permit_condition_id
    assert permit_conditions[3]._step == "b"

    assert permit_conditions[4].permit_amendment_id == permit_amendment.permit_amendment_id
    assert permit_conditions[4].condition_category_code == "GEC"
    assert permit_conditions[4].condition == "This is a subclause"
    assert permit_conditions[4].condition_type_code == "LIS"
    assert permit_conditions[4].parent_permit_condition_id == permit_conditions[3].permit_condition_id
    assert permit_conditions[4]._step == "" # This is a child of the title condition - which in the PDFs do not have a step

    ## Protection of Land and Watercourses Section

    assert permit_conditions[5].permit_amendment_id == permit_amendment.permit_amendment_id
    assert permit_conditions[5].condition_category_code == "ELC"
    assert permit_conditions[5].condition == "Another paragraph"
    assert permit_conditions[5].condition_type_code == "SEC"
    assert permit_conditions[5].parent_permit_condition_id is None
    assert permit_conditions[5]._step == "2"