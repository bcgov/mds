import json
from unittest.mock import Mock

import pytest
from app.common.types.chat_data import ChatData
from app.common.types.permit_condition_model import PermitCondition, PermitConditions
from app.pipelines.permit_condition_extraction.components.permit_condition_correction import (
    PermitConditionCorrection,
)
from haystack import Document
from haystack.dataclasses import ChatMessage


@pytest.fixture
def mock_chat_generator():
    return Mock()

@pytest.fixture
def sample_conditions():
    return PermitConditions(conditions=[
        PermitCondition(
            id="1",
            section="A",
            paragraph="1",
            subparagraph="a",
            clause="i",
            subclause="",
            condition_text="Original condition text",
            condition_title="Test Condition",
            meta={}
        )
    ])

@pytest.fixture
def sample_document():
    return [Document(content="Original condition text in document")]

@pytest.fixture
def validator(mock_chat_generator):
    return PermitConditionCorrection(
        chat_generator=mock_chat_generator,
        template="Test template {original_text} {conditions_json}"
    )

def test_initialization(mock_chat_generator):
    validator = PermitConditionCorrection(chat_generator=mock_chat_generator)
    assert validator.chat_generator == mock_chat_generator
    assert validator.max_batch_size == 1000
    assert not validator.reprocessing_attempted

def test_validation_no_changes(validator, mock_chat_generator, sample_conditions, sample_document):
    mock_chat_generator.run.return_value = {
        "data": ChatData(messages=[[ChatMessage.from_system(text=json.dumps({"no_corrections_needed": True}))]], documents=[])
    }
    
    result = validator.run(sample_conditions, sample_document)
    
    assert result["conditions"] == sample_conditions
    assert len(result["conditions"].conditions) == 1

def test_validation_with_corrections(validator, mock_chat_generator, sample_conditions, sample_document):
    corrections = {
        "conditions": [{
            "id": "1",
            "level1": "B",  # Changed from "A"
            "level2": "1",
            "level3": "a",
            "level4": "i",
            "level5": "",
            "text": "Updated condition text",
            "condition_title": "Updated Title"
        }]
    }
    mock_chat_generator.run.return_value = {
        "data": ChatData(messages=[[ChatMessage.from_system(text=json.dumps(corrections))]], documents=[])
    }
    
    result = validator.run(sample_conditions, sample_document)
    
    assert result["conditions"].conditions[0].section == "B"
    assert result["conditions"].conditions[0].condition_text == "Updated condition text"
    assert result["conditions"].conditions[0].condition_title == "Updated Title"

def test_validation_with_new_condition(validator, mock_chat_generator, sample_conditions, sample_document):
    corrections = {
        "conditions": [
            {
                "id": "1",
                "level1": "A",
                "level2": "1",
                "level3": "a",
                "level4": "i",
                "level5": "",
                "text": "Original condition text",
                "condition_title": "Test Condition"
            },
            {
                "id": "2",
                "level1": "B",
                "level2": "2",
                "level3": "b",
                "level4": "",
                "level5": "",
                "text": "New condition text",
                "condition_title": "New Condition"
            }
        ]
    }
    mock_chat_generator.run.return_value = {
        "data": ChatData(messages=[[ChatMessage.from_system(text=json.dumps(corrections))]], documents=[])
    }
    
    result = validator.run(sample_conditions, sample_document)
    
    assert len(result["conditions"].conditions) == 2
    assert result["conditions"].conditions[1].id == "2"
    assert result["conditions"].conditions[1].condition_text == "New condition text"

def test_validation_remove_condition(validator, mock_chat_generator, sample_conditions, sample_document):
    corrections = {
        "conditions": [],
        "remove_conditions": ["1"]
    }
    mock_chat_generator.run.return_value = {
        "data": ChatData(messages=[[ChatMessage.from_system(text=json.dumps(corrections))]], documents=[])
    }
    
    result = validator.run(sample_conditions, sample_document)
    
    assert len(result["conditions"].conditions) == 0

def test_validation_with_invalid_response(validator, mock_chat_generator, sample_conditions, sample_document):
    mock_chat_generator.run.return_value = {
        "data": ChatData(messages=[[ChatMessage.from_system(text="invalid json")]], documents=[])
    }
    
    result = validator.run(sample_conditions, sample_document)
    
    assert result["conditions"] == sample_conditions

def test_batch_size_limit(validator, sample_conditions, sample_document):
    many_conditions = PermitConditions(conditions=[sample_conditions.conditions[0]] * 1001)
    
    result = validator.run(many_conditions, sample_document)
    
    assert result["conditions"] == many_conditions

def test_missing_template(mock_chat_generator, sample_conditions, sample_document):
    validator = PermitConditionCorrection(chat_generator=mock_chat_generator, template=None)
    
    result = validator.run(sample_conditions, sample_document)
    
    assert result["conditions"] == sample_conditions
