from datetime import datetime
from unittest.mock import MagicMock, patch

import pytest
from app.api.mines.permits.permit_extraction.create_permit_condition_report_requirement import (
    create_permit_condition_report_requirement,
)
from app.api.mines.permits.permit_extraction.models.permit_condition_result import (
    PermitConditionResult,
)


@pytest.fixture
def mock_task():
    task = MagicMock()
    task.permit_amendment.permit_amendment_id = "test-amendment-id"
    return task


def test_create_report_requirement_with_no_report_required(mock_task):
    condition = PermitConditionResult(
        condition_text="Test condition text",
        meta={"questions": [{"question_key": "require_report", "answer": False}]},
    )

    result = create_permit_condition_report_requirement(mock_task, condition, "test-id")
    assert result is None


def test_create_report_requirement_basic(mock_task):
    condition = PermitConditionResult(
        condition_text="Test condition text",
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

    result = create_permit_condition_report_requirement(mock_task, condition, "test-id")
    assert result is not None
    assert result.report_name == "Test Report"
    assert result.permit_condition_id == "test-id"
    assert result.permit_amendment_id == "test-amendment-id"
    assert result.cim_or_cpo == "CIM"
    assert result.due_date_period_months == 1
    assert result.initial_due_date == datetime(2023, 12, 31)


def test_create_report_requirement_both_cim_cpo(mock_task):
    condition = PermitConditionResult(
        condition_text="Test condition text",
        meta={
            "questions": [
                {"question_key": "require_report", "answer": True},
                {"question_key": "mention_chief_inspector", "answer": True},
                {"question_key": "mention_chief_permitting_officer", "answer": True},
            ]
        },
    )

    result = create_permit_condition_report_requirement(mock_task, condition, "test-id")
    assert result is not None
    assert result.cim_or_cpo == "BOTH"


def test_create_report_requirement_various_frequencies(mock_task):
    test_cases = [
        ("annually", 12),
        ("quarterly", 3),
        ("semiannually", 6),
        ("as needed", 0),
        ("every 5 years", 60),
    ]

    for frequency, expected_months in test_cases:
        condition = PermitConditionResult(
            condition_text="Test condition text",
            meta={
                "questions": [
                    {"question_key": "require_report", "answer": True},
                    {"question_key": "recurring", "answer": True},
                    {"question_key": "frequency", "answer": frequency},
                ]
            },
        )

        result = create_permit_condition_report_requirement(
            mock_task, condition, "test-id"
        )
        assert result is not None
        assert result.due_date_period_months == expected_months


@patch(
    "app.api.mines.permits.permit_extraction.create_permit_condition_report_requirement.current_app"
)
def test_create_report_requirement_invalid_date(
    mock_current_app, mock_task, test_client
):
    condition = PermitConditionResult(
        condition_text="Test condition text",
        meta={
            "questions": [
                {"question_key": "require_report", "answer": True},
                {"question_key": "due_date", "answer": "invalid-date"},
            ]
        },
    )

    result = create_permit_condition_report_requirement(mock_task, condition, "test-id")
    assert result is not None
    assert result.initial_due_date is None
    mock_current_app.logger.error.assert_called_once()
