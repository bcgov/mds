import json
import pytest
from unittest.mock import MagicMock, patch
from app.permit_conditions.pipelines.chat_data import ChatData
from app.permit_conditions.validator.permit_condition_validator import (
    PermitConditionValidator,
)
from haystack.dataclasses import ChatMessage, Document

logger = MagicMock()

valid_reply_content = (
    '{"condition_text": "Valid condition", "section_title": "Section 1"}'
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
            ChatMessage.from_system(valid_reply_content),
        ],
        documents=documents[:2],
    )
    result = validator.run(chat_data)
    assert "documents" in result
    assert len(result["documents"]) == 2
    assert result["documents"][0].content["condition_text"] == "Valid condition"


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
