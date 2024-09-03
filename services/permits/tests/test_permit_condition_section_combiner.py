import pytest
from app.permit_conditions.validator.permit_condition_model import PermitConditions
from app.permit_conditions.validator.permit_condition_section_combiner import (
    PermitConditionSectionCombiner,
)
from haystack import Document


@pytest.fixture
def combiner():
    return PermitConditionSectionCombiner()


def test_permit_condition_section_combiner_run(combiner):
    documents = [
        Document(
            content='{"text": "A. This is a test.", "id": "1"}',
            meta={"bounding_box": {"left": 1, "bottom": 2, "right": 3, "top": 4}},
        ),
        Document(
            content='{"text": "1. This is a title.", "id": "2"}',
            meta={"bounding_box": {"left": 2, "bottom": 2, "right": 3, "top": 4}},
        ),
        Document(
            content='{"text": "This is another.", "id": "3"}',
            meta={"bounding_box": {"left": 1, "bottom": 5, "right": 4, "top": 3}},
        ),
        Document(
            content='{"text": "(a) This is yet another test.", "id": "4"}',
            meta={"bounding_box": {"left": 1, "bottom": 2, "right": 3, "top": 4}},
        ),
    ]

    result = combiner.run(documents)

    assert isinstance(result, dict)
    assert "conditions" in result
    assert isinstance(result["conditions"], PermitConditions)
    assert len(result["conditions"].conditions) == 3

    condition1 = result["conditions"].conditions[0]

    assert condition1.section == "A"
    assert condition1.section_title == ""
    assert condition1.paragraph is None
    assert condition1.subparagraph is None
    assert condition1.clause is None
    assert condition1.subclause is None
    assert condition1.subsubclause is None
    assert condition1.condition_title == None
    assert condition1.condition_text == "This is a test."
    assert condition1.page_number == 1
    assert condition1.id == "1"
    assert condition1.meta == {
        "bounding_box": {"left": 1, "bottom": 2, "right": 3, "top": 4}
    }

    condition2 = result["conditions"].conditions[1]
    assert condition2.section == "A"
    assert condition2.section_title == ""
    assert condition2.paragraph == "1"
    assert condition2.subparagraph == None
    assert condition2.clause is None
    assert condition2.subclause is None
    assert condition2.subsubclause is None
    assert condition2.condition_title == "This is a title."
    assert condition2.condition_text == "This is another."
    assert condition2.page_number == 1
    assert condition2.id == "3"
    assert condition2.meta == {
        "bounding_box": {"left": 1, "bottom": 5, "right": 4, "top": 3}
    }

    condition3 = result["conditions"].conditions[2]
    assert condition3.section == "A"
    assert condition3.section_title == ""
    assert condition3.paragraph == "1"
    assert condition3.subparagraph == "a"
    assert condition3.clause is None
    assert condition3.subclause is None
    assert condition3.subsubclause is None
    assert condition3.condition_title is None
    assert condition3.condition_text == "This is yet another test."
    assert condition3.page_number == 1
    assert condition3.id == "4"
    assert condition3.meta == {
        "bounding_box": {"left": 1, "bottom": 2, "right": 3, "top": 4}
    }
