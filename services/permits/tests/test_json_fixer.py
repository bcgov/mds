import pytest
from app.permit_conditions.pipelines.chat_data import ChatData
from app.permit_conditions.validator.json_fixer import JSONRepair
from haystack.dataclasses import ChatMessage


def test_run_with_valid_json():
    repair = JSONRepair()
    data = ChatData(
        [
            [
                ChatMessage.from_system(
                    '{"key": "value", "nested": {"inner_key": "inner_value"}}'
                )
            ]
        ],
        [],
    )
    expected_data = ChatData(
        [
            [
                ChatMessage.from_system(
                    '{"key": "value", "nested": {"inner_key": "inner_value"}}'
                )
            ]
        ],
        [],
    )
    assert repair.run(data)["data"] == expected_data


def test_run_with_invalid_json():
    repair = JSONRepair()
    data = ChatData(
        [
            [
                ChatMessage.from_system('{key": "value"}'),  # Invalid JSON string
            ]
        ],
        [],
    )
    expected_data = ChatData(
        [
            [
                ChatMessage.from_system('{"key": "value"}'),  # Repaired JSON string
            ]
        ],
        [],
    )
    assert repair.run(data)["data"] == expected_data


def test_run_with_multiple_valid_messages_returns_as_is():
    repair = JSONRepair()
    data = ChatData(
        [
            [
                ChatMessage.from_system('{key": "value1"}'),  # Invalid JSON
                ChatMessage.from_system(
                    '{nested": {"inner": "value2"}}'
                ),  # Invalid JSON
            ],
            [ChatMessage.from_system('{third": "value3"}')],  # Invalid JSON
        ],
        [],
    )
    expected_data = ChatData(
        [
            [
                ChatMessage.from_system('{"key": "value1"}'),
                ChatMessage.from_system('{"nested": {"inner": "value2"}}'),
            ],
            [ChatMessage.from_system('{"third": "value3"}')],
        ],
        [],
    )
    assert repair.run(data)["data"] == expected_data


def test_run_with_mixed_valid_invalid_json_fixes_invalid():
    repair = JSONRepair()
    data = ChatData(
        [
            [
                ChatMessage.from_system('{"valid": "json"}'),  # Valid JSON
                ChatMessage.from_system('{invalid": true}'),  # Invalid JSON
            ]
        ],
        [],
    )
    expected_data = ChatData(
        [
            [
                ChatMessage.from_system('{"valid": "json"}'),
                ChatMessage.from_system('{"invalid": true}'),
            ]
        ],
        [],
    )
    assert repair.run(data)["data"] == expected_data
