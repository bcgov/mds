from unittest.mock import MagicMock

import pytest
from app.permit_conditions.pipelines.PaginatedChatPromptBuilder import (
    PaginatedChatPromptBuilder,
    _format_condition_text_for_prompt,
)
from app.permit_conditions.validator.permit_condition_model import (
    PermitCondition,
    PermitConditions,
)
from haystack import Document
from haystack.dataclasses import ChatMessage


@pytest.fixture
def sample_conditions():
    return PermitConditions(
        conditions=[
            PermitCondition(
                id="0", condition_text="General", section="A", paragraph="", meta={}
            ),
            PermitCondition(
                id="1",
                condition_text="Condition 1",
                section="A",
                paragraph="1",
                meta={},
            ),
            PermitCondition(
                id="2",
                condition_text="Condition 2",
                section="A",
                paragraph="1",
                meta={},
            ),
            PermitCondition(
                id="3",
                condition_text="Condition 3",
                section="B",
                paragraph="1",
                meta={},
            ),
            PermitCondition(
                id="4",
                condition_text="Condition 4",
                section="B",
                paragraph="2",
                meta={},
            ),
        ]
    )


@pytest.fixture
def builder():
    return PaginatedChatPromptBuilder()


def test_split_conditions_groups_conditions_by_section(builder, sample_conditions):
    grouped = builder.split_conditions(sample_conditions.conditions)
    assert len(grouped) == 2
    assert len(grouped[0]) == 3  # Section A conditions
    assert len(grouped[1]) == 2  # Section B conditions
    assert grouped[0][0].id == "0"
    assert grouped[1][0].id == "3"


def test_split_conditions_large_subsection_splits_conditions_if_more_than_30(builder):
    conditions = [
        PermitCondition(
            id=str(i),
            text=f"Condition {i}",
            section="A",
            paragraph="1" if i < 31 else "2",
            meta={},
        )
        for i in range(35)
    ]
    grouped = builder.split_conditions(conditions)
    assert len(grouped) == 2
    assert len(grouped[0]) == 31
    assert len(grouped[1]) == 4


def test_run_groups_prompts_by_condition_section(builder, sample_conditions):
    documents = [Document(content="test doc")]
    template = [
        ChatMessage.from_system("System prompt"),
        ChatMessage.from_user("User prompt"),
        ChatMessage.from_user("Permit document prompt"),
    ]
    template_vars = {"var": "value"}

    result = builder.run(
        conditions=sample_conditions,
        template=template,
        template_variables=template_vars,
        documents=documents,
    )

    assert "data" in result
    assert len(result["data"].messages) == 2  # Section A + Section B


def test_run_with_iteration(builder, sample_conditions):
    documents = [Document(content="test doc")]
    template = [
        ChatMessage.from_system("System prompt"),
        ChatMessage.from_user("User prompt"),
        ChatMessage.from_user("Permit document prompt"),
    ]
    iteration = {"start_page": 1, "last_condition_text": "Previous condition"}

    result = builder.run(
        conditions=sample_conditions,
        template=template,
        iteration=iteration,
        documents=documents,
    )

    assert "data" in result
    assert len(result["data"].messages) == 2


def test_format_condition_text_formats_condition_for_prompt(sample_conditions):
    formatted = _format_condition_text_for_prompt(sample_conditions.conditions)
    assert len(formatted) == 1
    assert isinstance(formatted[0], Document)
    assert formatted[0].content is not None
    assert "Condition 1 (id: 1)" in formatted[0].content
    assert "Condition 4 (id: 4)" in formatted[0].content


def test_run_with_template_variables_populates_prompt(builder, sample_conditions):
    documents = [Document(content="test doc")]
    template = [
        ChatMessage.from_system("System prompt with {{ var }}"),
        ChatMessage.from_user("User prompt with {{ var }}"),
        ChatMessage.from_user("Permit document prompt with {{ var }}"),
    ]
    template_vars = {"var": "value"}

    result = builder.run(
        conditions=sample_conditions,
        template=template,
        template_variables=template_vars,
        documents=documents,
    )

    assert "data" in result
    assert len(result["data"].messages) == 2
    assert result["data"].messages[0][0].content == "System prompt with value"
    assert result["data"].messages[0][1].content == "User prompt with value"
    assert result["data"].messages[0][2].content == "Permit document prompt with value"


def test_run_conditions_can_be_used_in_prompt(builder, sample_conditions):
    documents = [Document(content="test doc 1"), Document(content="test doc 2")]
    template = [
        ChatMessage.from_system("System prompt"),
        ChatMessage.from_user("User prompt"),
        ChatMessage.from_user("Conditions:\n {{ documents[0].content }}"),
    ]
    template_vars = {"var": "value"}

    result = builder.run(
        conditions=sample_conditions,
        template=template,
        template_variables=template_vars,
        documents=documents,
    )

    assert "data" in result
    assert len(result["data"].messages) == 2
    assert len(result["data"].messages[0]) == 3
    assert len(result["data"].messages[1]) == 3
    assert result["data"].messages[0][0].content == "System prompt"
    assert result["data"].messages[0][1].content == "User prompt"
    assert (
        result["data"].messages[0][2].content
        == "Conditions:\n         () General (id: 0)\n        (1) Condition 1 (id: 1)\n        (1) Condition 2 (id: 2)"
    )
    assert result["data"].messages[1][0].content == "System prompt"
    assert result["data"].messages[1][1].content == "User prompt"
    assert (
        result["data"].messages[1][2].content
        == "Conditions:\n         (1) Condition 3 (id: 3)\n        (2) Condition 4 (id: 4)"
    )
