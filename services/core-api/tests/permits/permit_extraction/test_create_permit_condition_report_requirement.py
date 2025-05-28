from datetime import datetime
from unittest.mock import MagicMock, patch

import pytest
from app.api.mines.permits.permit_conditions.models.permit_conditions import (
    PermitConditions,
)
from app.api.mines.permits.permit_extraction.create_permit_condition_report_requirement import (
    create_permit_condition_report_requirement,
)
from tests.factories import PermitAmendmentFactory, create_mine_and_permit


@pytest.fixture
def mock_task(db_session):
    mine, permit = create_mine_and_permit()
    permit_amendment = PermitAmendmentFactory(permit=permit, mine=mine)
    task = MagicMock()
    task.permit_amendment = permit_amendment
    return task


def test_create_report_requirement_with_no_report_required(mock_task):
    condition = PermitConditions(
        permit_condition_id="test-id",
        condition="Test condition text",
        meta={"questions": [{"question_key": "require_report", "answer": False}]},
    )

    result = create_permit_condition_report_requirement(mock_task, condition)
    assert result is None


def test_create_report_requirement_basic(mock_task):
    condition = PermitConditions(
        condition="Test condition text",
        permit_amendment_id=mock_task.permit_amendment.permit_amendment_id,
        condition_category_code="GEC",
        condition_type_code="CON",
        display_order=1,
        meta={
            "questions": [
                {"question_key": "require_report", "answer": True},
                {"question_key": "report_name", "answer": "Test Report"},
                {"question_key": "due_date", "answer": "2023-12-31"},
                {"question_key": "recurring", "answer": True},
                {"question_key": "frequency", "answer": "monthly"},
                {"question_key": "mention_chief_inspector", "answer": True},
                {"question_key": "mention_chief_permitting_officer", "answer": False},
            ]
        },
    )
    condition.save()

    result = create_permit_condition_report_requirement(mock_task, condition)
    assert result is not None
    assert result.report_name == "Test Report"
    assert result.permit_condition_ids == [condition.permit_condition_id]
    assert result.permit_amendment_id == mock_task.permit_amendment.permit_amendment_id
    assert result.cim_or_cpo == "CIM"
    assert result.due_date_period_months == 1
    assert result.initial_due_date == datetime(2023, 12, 31).date()


def test_create_report_requirement_both_cim_cpo(mock_task):
    condition = PermitConditions(
        condition="Test condition text",
        permit_condition_id=mock_task.permit_amendment.permit_amendment_id,
        meta={
            "questions": [
                {"question_key": "require_report", "answer": True},
                {"question_key": "mention_chief_inspector", "answer": True},
                {"question_key": "mention_chief_permitting_officer", "answer": True},
            ]
        },
    )

    result = create_permit_condition_report_requirement(mock_task, condition)
    assert result is not None
    assert result.cim_or_cpo == "Both"


def test_create_report_requirement_various_frequencies(mock_task):
    test_cases = [
        ("annually", 12),
        ("quarterly", 3),
        ("semiannually", 6),
        ("as needed", 0),
        ("every 5 years", 60),
    ]

    id = 1
    for frequency, expected_months in test_cases:
        condition = PermitConditions(
            permit_condition_id=id,
            permit_amendment_id=mock_task.permit_amendment.permit_amendment_id,
            condition_category_code="GEC",
            condition_type_code="CON",
            display_order=id,
            condition="Test condition text",
            meta={
                "questions": [
                    {"question_key": "require_report", "answer": True},
                    {"question_key": "recurring", "answer": True},
                    {"question_key": "frequency", "answer": frequency},
                ]
            },
        )

        condition.save()

        result = create_permit_condition_report_requirement(
            mock_task, condition
        )
        assert result is not None
        assert result.due_date_period_months == expected_months
        id += 1


@patch(
    "app.api.mines.permits.permit_extraction.create_permit_condition_report_requirement.current_app"
)
def test_create_report_requirement_invalid_date(
    mock_current_app, mock_task, test_client
):
    condition = PermitConditions(
        permit_condition_id=1,
        condition="Test condition text",
        permit_amendment_id=mock_task.permit_amendment.permit_amendment_id,
        condition_category_code="GEC",
        condition_type_code="CON",
        display_order=1,
        meta={
            "questions": [
                {"question_key": "require_report", "answer": True},
                {"question_key": "due_date", "answer": "invalid-date"},
            ]
        },
    )
    condition.save()

    result = create_permit_condition_report_requirement(mock_task, condition)
    assert result is not None
    assert result.initial_due_date is None
    mock_current_app.logger.error.assert_called_once()

def test_create_report_requirement_with_same_meta(mock_task, db_session):
    """
    Test creating two conditions with the same report name.
    Verifies that a single report requirement is created and shared between the conditions.
    """

    shared_meta = {
        "questions": [
            {"question_key": "report_name", "answer": "Test Report"},
            {"question_key": "require_report", "answer": True},
            {"question_key": "mention_chief_inspector", "answer": True},
            {"question_key": "mention_chief_permitting_officer", "answer": True},
        ]
    }

    condition_one = PermitConditions(
        permit_condition_id=1,
        condition="Test condition text 1",
        permit_amendment_id=mock_task.permit_amendment.permit_amendment_id,
        condition_category_code="GEC",
        condition_type_code="CON",
        display_order=1,
        meta=shared_meta
    )
    condition_two = PermitConditions(
        permit_condition_id=2,
        condition="Test condition text 1",
        permit_amendment_id=mock_task.permit_amendment.permit_amendment_id,
        condition_category_code="GEC",
        condition_type_code="CON",
        display_order=2,
        meta=shared_meta
    )
    condition_one.save()
    condition_two.save()

    result_one = create_permit_condition_report_requirement(mock_task, condition_one)
    create_permit_condition_report_requirement(mock_task, condition_two)

    assert result_one is not None
    assert result_one.permit_condition_ids == [condition_one.permit_condition_id, condition_two.permit_condition_id]