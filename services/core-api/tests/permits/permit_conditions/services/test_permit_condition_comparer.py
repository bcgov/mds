from unittest.mock import MagicMock

import pytest
from app.api.mines.permits.permit_conditions.models.permit_conditions import (
    PermitConditions,
)
from app.api.mines.permits.permit_conditions.services.permit_condition_comparer import (
    ConditionChangeType,
    PermitConditionComparer,
)
from tests.factories import create_mine_and_permit


@pytest.fixture
def previous_conditions(db_session):
    mine, permit = create_mine_and_permit()
    permit_amendment_id = permit.permit_amendments[0].permit_amendment_id

    conditions = []

    # Root condition
    root = PermitConditions(
        permit_amendment_id=permit_amendment_id,
        condition="Section 1",
        condition_category_code="GEC",
        condition_type_code="SEC",
        display_order=1,
        _step="1",
    )
    db_session.add(root)

    # Subcondition 1
    sub1 = PermitConditions(
        permit_amendment_id=permit_amendment_id,
        condition="Keep mining area clean",
        condition_category_code="GEC",
        condition_type_code="CON",
        display_order=1,
        _step="1",
        parent=root,
    )
    db_session.add(sub1)

    # Subcondition 2
    sub2 = PermitConditions(
        permit_amendment_id=permit_amendment_id,
        condition="Submit monthly reports",
        condition_category_code="GEC",
        condition_type_code="CON",
        display_order=2,
        _step="2",
        parent=root,
    )
    db_session.add(sub2)

    db_session.flush()
    conditions.extend([root, sub1, sub2])
    return conditions


@pytest.fixture
def new_root(db_session):
    root = PermitConditions(
        condition="Section 1",
        condition_category_code="GEC",
        condition_type_code="SEC",
        display_order=1,
        _step="1",
    )

    return root


@pytest.fixture
def comparer(previous_conditions):
    return PermitConditionComparer(previous_conditions)


def test_compare_condition_unchanged(comparer, db_session, new_root):
    """Test condition with same text and step is marked unchanged"""
    current = PermitConditions(
        permit_amendment_id=2,
        condition="Keep mining area clean",
        condition_category_code="CAT1",
        condition_type_code="CON",
        display_order=1,
        parent=new_root,
        _step="1",
    )

    comparison = comparer.compare_condition(current)
    assert comparison.change_type == ConditionChangeType.UNCHANGED
    assert comparison.text_similarity == 1.0
    assert comparison.structure_similarity == 1.0
    assert comparison.combined_score == 1.0


def test_compare_condition_modified(comparer, db_session, new_root):
    """Test condition with different text but same step is marked modified"""
    current = PermitConditions(
        permit_amendment_id=2,
        condition="Keep mining area cclean",
        condition_category_code="GEC",
        condition_type_code="CON",
        display_order=1,
        _step="1",
        parent=new_root,
    )

    comparison = comparer.compare_condition(current)
    assert comparison.change_type == ConditionChangeType.MODIFIED
    assert 0.8 < comparison.text_similarity < 1.0
    assert comparison.structure_similarity == 1.0


def test_compare_condition_moved(comparer, db_session, new_root):
    """Test condition with same text but different step is marked moved"""

    new_root._step = "2"
    current = PermitConditions(
        permit_amendment_id=2,
        condition="Keep mining area clean",
        condition_category_code="GEC",
        condition_type_code="CON",
        display_order=1,
        _step="1",
        parent=new_root,
    )

    comparison = comparer.compare_condition(current)
    assert comparison.change_type == ConditionChangeType.MOVED
    assert comparison.text_similarity > 0.9
    assert comparison.structure_similarity == 0.0


def test_compare_condition_added(comparer, db_session, new_root):
    """Test new condition is marked as added"""
    current = PermitConditions(
        permit_amendment_id=2,
        condition="Brand new condition",
        condition_category_code="GEC",
        condition_type_code="CON",
        display_order=1,
        _step="3",
        parent=new_root,
    )

    comparison = comparer.compare_condition(current)
    assert comparison.change_type == ConditionChangeType.ADDED
    assert comparison.text_similarity == 0.0
    assert comparison.structure_similarity == 0.0
    assert comparison.combined_score == 0.0


def test_compare_condition_multiple_levels(comparer, db_session, new_root):
    """Test condition with multiple parent levels."""
    sub_condition = PermitConditions(
        condition="Level 2 condition",
        condition_category_code="MULTI",
        condition_type_code="CON",
        display_order=1,
        _step="1",
        parent=new_root,
    )
    nested_sub_condition = PermitConditions(
        condition="Level 3 condition",
        condition_category_code="MULTI",
        condition_type_code="CON",
        display_order=1,
        _step="1",
        parent=sub_condition,
    )

    comparison = comparer.compare_condition(nested_sub_condition)
    assert comparison.change_type == ConditionChangeType.ADDED
    assert comparison.text_similarity == 0.0
    assert comparison.structure_similarity == 0.0
