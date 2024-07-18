import pytest
from app.permit_conditions.validator.json_fixer import JSONRepair
from app.permit_conditions.pipelines.chat_data import ChatData
from haystack.dataclasses import ChatMessage


def test_run_with_valid_json():
    repair = JSONRepair()
    data = ChatData(
        [
            ChatMessage.from_system(
                '{"key": "value", "nested": {"inner_key": "inner_value"}}'
            )
        ],
        None,
    )
    expected_data = ChatData(
        [
            ChatMessage.from_system(
                '{"key": "value", "nested": {"inner_key": "inner_value"}}'
            )
        ],
        None,
    )
    assert repair.run(data)["data"] == expected_data


def test_run_with_invalid_json():
    repair = JSONRepair()
    data = ChatData(
        [
            ChatMessage.from_system('{key": "value"}'),  # Invalid JSON string
        ],
        None,
    )
    expected_data = ChatData(
        [
            ChatMessage.from_system('{"key": "value"}'),  # Repaired JSON string
        ],
        None,
    )
    assert repair.run(data)["data"] == expected_data
