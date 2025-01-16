import uuid
from unittest.mock import Mock

import pytest
from app.api.mines.permits.permit_conditions.models.permit_conditions import (
    PermitConditions,
)
from app.api.mines.permits.permit_extraction.models.permit_condition_result import (
    PermitConditionResult,
)
from app.api.mines.permits.permit_extraction.permit_condition_creator import (
    PermitConditionCreator,
)
from tests.factories import PermitAmendmentFactory, create_mine_and_permit


@pytest.fixture(scope="function")
def permit_amendments(db_session):
    mine, permit = create_mine_and_permit(num_permit_amendments=2)

    return [permit.permit_amendments[0], permit.permit_amendments[1]]


@pytest.fixture(scope="function")
def permit_condition_creator(test_client, db_session, permit_amendments):
    creator = PermitConditionCreator(
        permit_amendment=permit_amendments[0], previous_amendment=permit_amendments[1]
    )
    creator.current_category = "GEC"
    yield creator


def test_create_basic_condition(permit_condition_creator, db_session):
    condition_result = PermitConditionResult(
        section="A",
        paragraph="1",
        condition_text="Test condition",
        condition_title=None,
        meta={},
    )

    main_condition, title_condition, _ = permit_condition_creator.create_condition(
        condition_result
    )

    assert main_condition.condition == "Test condition"
    assert main_condition.condition_type_code == "SEC"
    assert main_condition.condition_category_code == "GEC"
    assert main_condition.display_order == 1
    assert main_condition._step == "1"
    assert main_condition.parent_permit_condition_id is None
    assert title_condition is None


def test_create_condition_with_title(permit_condition_creator, db_session):
    condition_result = PermitConditionResult(
        section="A",
        paragraph="1",
        condition_text="Test condition",
        condition_title="Test Title",
        meta={},
    )

    main_condition, title_condition, _ = permit_condition_creator.create_condition(
        condition_result
    )

    assert title_condition.condition == "Test Title"
    assert title_condition.condition_type_code == "SEC"
    assert title_condition._step == "1"

    assert main_condition.condition == "Test condition"
    assert (
        main_condition.parent_permit_condition_id == title_condition.permit_condition_id
    )
    assert main_condition._step == ""


def test_create_nested_conditions(permit_condition_creator, db_session):
    # Create parent condition
    parent_result = PermitConditionResult(
        section="A",
        paragraph="1",
        condition_text="Parent condition",
        condition_title=None,
        meta={},
    )

    parent_condition, _, _ = permit_condition_creator.create_condition(parent_result)

    # Create child condition
    child_result = PermitConditionResult(
        section="A",
        paragraph="1",
        subparagraph="a",
        condition_text="Child condition",
        condition_title=None,
        meta={},
    )

    child_condition, _, _ = permit_condition_creator.create_condition(child_result)

    assert (
        child_condition.parent_permit_condition_id
        == parent_condition.permit_condition_id
    )
    assert child_condition.display_order == 1
    assert child_condition._step == "a"


def test_condition_comparison_with_previous_amendment(
    test_client, db_session, permit_amendments, permit_condition_creator
):
    current_amendment, previous_amendment = permit_amendments

    gid = uuid.uuid4()
    previous_condition = PermitConditions(
        permit_condition_guid=gid,
        permit_amendment_id=previous_amendment.permit_amendment_id,
        condition="Previous condition",
        condition_type_code="SEC",
        condition_category_code="GEC",
        display_order=1,
        _step="1",
    )
    db_session.add(previous_condition)
    db_session.commit()

    # Create similar condition
    condition_result = PermitConditionResult(
        section="A",
        paragraph="1",
        condition_text="Previous condition",
        condition_title=None,
        meta={},
    )

    main_condition, _, _ = permit_condition_creator.create_condition(condition_result)

    assert main_condition.meta.get("condition_comparison") is not None
    assert main_condition.meta["condition_comparison"]["change_type"] == "unchanged"
    assert main_condition.meta["condition_comparison"]["text_similarity"] == 1.0
    assert main_condition.meta["condition_comparison"]["structure_similarity"] == 1.0
    assert main_condition.meta["condition_comparison"]["combined_score"] == 1.0
    assert main_condition.meta["condition_comparison"][
        "previous_condition_guid"
    ] == str(gid)


def test_condition_comparison_with_previous_amendment_nested(
    test_client, db_session, permit_amendments, permit_condition_creator
):
    current_amendment, previous_amendment = permit_amendments

    parent_gid = uuid.uuid4()
    child_gid = uuid.uuid4()

    # Create previous parent and child conditions
    previous_parent = PermitConditions(
        permit_condition_guid=parent_gid,
        permit_amendment_id=previous_amendment.permit_amendment_id,
        condition="Previous parent condition",
        condition_type_code="SEC",
        condition_category_code="GEC",
        display_order=1,
        _step="1",
    )
    previous_child = PermitConditions(
        permit_condition_guid=child_gid,
        permit_amendment_id=previous_amendment.permit_amendment_id,
        condition="Previous child condition",
        condition_type_code="SEC",
        condition_category_code="GEC",
        display_order=1,
        _step="a",
        parent_permit_condition_id=previous_parent.permit_condition_id,
    )
    db_session.add_all([previous_parent, previous_child])
    db_session.commit()

    # Create similar nested conditions
    parent_result = PermitConditionResult(
        section="A",
        paragraph="1",
        condition_text="Previous parent condition",
        condition_title=None,
        meta={},
    )
    child_result = PermitConditionResult(
        section="A",
        paragraph="1",
        subparagraph="a",
        condition_text="Previous child condition",
        condition_title=None,
        meta={},
    )

    parent_condition, _, _ = permit_condition_creator.create_condition(parent_result)
    child_condition, _, _ = permit_condition_creator.create_condition(child_result)

    assert parent_condition.meta["condition_comparison"]["change_type"] == "unchanged"
    assert parent_condition.meta["condition_comparison"][
        "previous_condition_guid"
    ] == str(parent_gid)
    assert child_condition.meta["condition_comparison"]["change_type"] == "moved"
    assert child_condition.meta["condition_comparison"][
        "previous_condition_guid"
    ] == str(child_gid)


def test_condition_comparison_with_previous_amendment_modified(
    test_client, db_session, permit_amendments, permit_condition_creator
):
    current_amendment, previous_amendment = permit_amendments

    parent_gid = uuid.uuid4()
    child_gid = uuid.uuid4()

    # Create previous parent and child conditions
    previous_parent = PermitConditions(
        permit_condition_guid=parent_gid,
        permit_amendment_id=previous_amendment.permit_amendment_id,
        condition="Previous parent condition",
        condition_type_code="SEC",
        condition_category_code="GEC",
        display_order=1,
        _step="1",
    )
    previous_child = PermitConditions(
        permit_condition_guid=child_gid,
        permit_amendment_id=previous_amendment.permit_amendment_id,
        condition="Previous child condition",
        condition_type_code="SEC",
        condition_category_code="GEC",
        display_order=1,
        _step="a",
        parent_permit_condition_id=previous_parent.permit_condition_id,
    )
    db_session.add_all([previous_parent, previous_child])
    db_session.commit()

    # Test with modified child condition text
    child_result_modified = PermitConditionResult(
        section="A",
        paragraph="1",
        subparagraph="a",
        condition_text="Previous child condition mod",
        condition_title=None,
        meta={},
    )

    modified_child_condition, _, _ = permit_condition_creator.create_condition(
        child_result_modified
    )

    assert (
        modified_child_condition.meta["condition_comparison"]["change_type"]
        == "modified"
    )
    assert (
        modified_child_condition.meta["condition_comparison"]["text_similarity"] < 1.0
    )
    assert (
        modified_child_condition.meta["condition_comparison"]["structure_similarity"]
        == 1.0
    )
    assert modified_child_condition.meta["condition_comparison"][
        "previous_condition_guid"
    ] == str(child_gid)


def test_condition_comparison_with_previous_amendment_added(
    test_client, db_session, permit_amendments, permit_condition_creator
):
    current_amendment, previous_amendment = permit_amendments

    parent_gid = uuid.uuid4()
    child_gid = uuid.uuid4()

    # Create previous parent and child conditions
    previous_parent = PermitConditions(
        permit_condition_guid=parent_gid,
        permit_amendment_id=previous_amendment.permit_amendment_id,
        condition="Previous parent condition",
        condition_type_code="SEC",
        condition_category_code="GEC",
        display_order=1,
        _step="1",
    )
    previous_child = PermitConditions(
        permit_condition_guid=child_gid,
        permit_amendment_id=previous_amendment.permit_amendment_id,
        condition="Previous child condition",
        condition_type_code="SEC",
        condition_category_code="GEC",
        display_order=1,
        _step="a",
        parent_permit_condition_id=previous_parent.permit_condition_id,
    )
    db_session.add_all([previous_parent, previous_child])
    db_session.commit()

    # Test with modified child condition text
    child_result_added = PermitConditionResult(
        section="A",
        paragraph="1",
        subparagraph="a",
        condition_text="Previous modified a lot",
        condition_title=None,
        meta={},
    )

    modified_child_condition, _, _ = permit_condition_creator.create_condition(
        child_result_added
    )

    assert (
        modified_child_condition.meta["condition_comparison"]["change_type"] == "added"
    )
    assert (
        modified_child_condition.meta["condition_comparison"]["text_similarity"] == 0.0
    )
    assert (
        modified_child_condition.meta["condition_comparison"]["structure_similarity"]
        == 0.0
    )
    assert (
        modified_child_condition.meta["condition_comparison"]["previous_condition_guid"]
        == None
    )


def test_no_condition_comparison_without_previous_amendment(
    test_client, db_session, permit_amendments
):
    # Create creator without previous amendment
    creator = PermitConditionCreator(
        permit_amendment=permit_amendments[0], previous_amendment=None
    )
    creator.current_category = "GEC"

    condition_result = PermitConditionResult(
        section="A",
        paragraph="1",
        condition_text="Test condition",
        condition_title=None,
        meta={},
    )

    main_condition, _, _ = creator.create_condition(condition_result)

    assert "condition_comparison" not in main_condition.meta
