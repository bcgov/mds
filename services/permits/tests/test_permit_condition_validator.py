import json
from unittest.mock import MagicMock, patch

import pytest
from app.permit_conditions.pipelines.chat_data import ChatData
from app.permit_conditions.validator.permit_condition_validator import (
    PermitConditionValidator,
)
from haystack.dataclasses import ChatMessage, Document

logger = MagicMock()

valid_reply_content = (
    '[{ "type": "section", "numbering": "B", "title": "Geotechnical", "text": "", "section": "", "paragraph": "", "subparagraph": "", "clause": "", "subclause": "", "subsubclause": "" }]'
)
valid_reply_content2 = (
    '[{ "type": "subparagraph", "numbering": "(a)", "title": "Operations", "text": "abc", "section": "B", "paragraph": "3", "subparagraph": "", "clause": "", "subclause": "", "subsubclause": "" }, { "type": "clause", "numbering": "(ii)", "title": "", "text": "Starting in 2022,", "section": "B", "paragraph": "3", "subparagraph": "(b)", "clause": "", "subclause": "", "subsubclause": "" }]'
)


valid_reply_content_missing_section_title = (
    '[{ "type": "section", "numbering": "B", "title": "Geotechnical", "text": "", "section": "", "paragraph": "", "subparagraph": "", "clause": "", "subclause": "", "subsubclause": "" }, { "type": "clause", "numbering": "(ii)", "title": "", "text": "Starting in 2022,", "section": "B", "paragraph": "3", "subparagraph": "(b)", "clause": "", "subclause": "", "subsubclause": "" }]'
)


invalid_reply_content = "Invalid JSON"

documents = [
    Document(),
    Document(),
    Document(),
    Document(),
    Document(),
    Document(),
    Document(),
]


def test_run_with_valid_replies():
    validator = PermitConditionValidator()
    chat_data = ChatData(
        messages=[
            ChatMessage.from_system(valid_reply_content),
            ChatMessage.from_system(valid_reply_content2),
        ],
        documents=documents[:2],
    )
    result = validator.run(chat_data)
    assert "conditions" in result
    assert len(result["conditions"].conditions) == 3
    assert result['conditions'].conditions[0].condition_text == ""
    assert result['conditions'].conditions[1].condition_text == "abc"
    assert result['conditions'].conditions[2].condition_text == "Starting in 2022,"

def test_run_with_valid_replies_should_have_section_title_of_parent():
    validator = PermitConditionValidator()
    chat_data = ChatData(
        messages=[
            ChatMessage.from_system(valid_reply_content_missing_section_title),
        ],
        documents=documents[:1],
    )
    result = validator.run(chat_data)
    assert "conditions" in result
    assert len(result["conditions"].conditions) == 2

    section_condition, clause_condition = result['conditions'].conditions

    assert section_condition.section_title == "Geotechnical"
    assert section_condition.section == "B"
    assert section_condition.paragraph == ""
    assert section_condition.subparagraph == ""
    assert section_condition.clause == ""
    assert section_condition.subclause == ""
    assert section_condition.subsubclause == ""

    assert clause_condition.section_title == "Geotechnical"
    assert clause_condition.section == "B"
    assert clause_condition.paragraph == "3"
    assert clause_condition.subparagraph == "b"
    assert clause_condition.clause == "ii"
    assert clause_condition.subclause == ""
    assert clause_condition.subsubclause == ""


def test_run_with_invalid_replies():
    validator = PermitConditionValidator()
    chat_data = ChatData(
        messages=[
            ChatMessage.from_system(invalid_reply_content),
        ],
        documents=None,
    )
    with pytest.raises(json.JSONDecodeError):
        validator.run(chat_data)


def test_run_with_multiple_iterations():
    validator = PermitConditionValidator()
    validator.max_pages = 1
    chat_data = ChatData(
        messages=[
            ChatMessage.from_system(valid_reply_content),
        ]
        * 10,
        documents=documents,
    )

    result = validator.run(chat_data)
    assert "iteration" in result
    assert result["iteration"]["start_page"] == 1

    validator.start_page = result["iteration"]["start_page"]
    result = validator.run(chat_data)
    assert "iteration" in result
    assert result["iteration"]["start_page"] == 2
