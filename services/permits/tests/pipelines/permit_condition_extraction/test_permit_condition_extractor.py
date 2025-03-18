import json
from unittest.mock import Mock, patch

import pytest
from app.common.types.chat_data import ChatData
from app.common.types.permit_condition_model import PermitCondition, PermitConditions
from app.pipelines.permit_condition_extraction.components.permit_condition_extractor import (
    PermitConditionExtractor,
)
from haystack import Document
from haystack.dataclasses import ChatMessage


@pytest.fixture
def mock_chat_generator(sample_documents):
    generator = Mock()
    generator.run.return_value = {
        "data": ChatData(messages=[[ChatMessage.from_system(text=json.dumps([
            {
                "id": "1",
                "level1": "Section 1",
                "level2": "Para A",
                "level3": "Sub 1",
                "level4": "Clause i",
                "level5": "Sub-clause a",
            }
            ]))]], documents=sample_documents)
    }
    return generator

@pytest.fixture
def mock_validator():
    validator = Mock()
    validator.run.return_value = {"conditions": PermitConditions(conditions=[
        PermitCondition(
            id="1",
            section="Section 1",
            paragraph="Para A",
            subparagraph="Sub 1",
            clause="Clause i",
            subclause="Sub-clause a",
            condition_text="Test condition",
            meta={}
        )
    ])}
    return validator

@pytest.fixture
def sample_documents():
    return [
        Document(
            content=json.dumps({
                "id": "1",
                "text": "Test condition"
            }),
            id="1",
            meta={"bounding_box": {"left": 1}}
        )
    ]

def test_init(mock_chat_generator, mock_validator):
    template = "Test template"
    extractor = PermitConditionExtractor(
        chat_generator=mock_chat_generator,
        validator=mock_validator,
        template=template
    )
    
    assert extractor.chat_generator == mock_chat_generator
    assert extractor.validator == mock_validator
    assert extractor.template == template

def test_successful_extraction(mock_chat_generator, sample_documents):
    extractor = PermitConditionExtractor(chat_generator=mock_chat_generator)
    result = extractor.run(documents=sample_documents, template="Test template")
    
    assert isinstance(result["conditions"], PermitConditions)
    assert len(result["conditions"].conditions) == 1
    condition = result["conditions"].conditions[0]
    assert condition.id == "1"
    assert condition.section == "Section 1"
    assert condition.condition_text == "Test condition"

def test_extraction_with_validator(mock_chat_generator, mock_validator, sample_documents):
    extractor = PermitConditionExtractor(
        chat_generator=mock_chat_generator,
        validator=mock_validator,
        template="test_template"
    )
    result = extractor.run(documents=sample_documents)
    
    mock_validator.run.assert_called_once()
    assert isinstance(result["conditions"], PermitConditions)

@patch('app.pipelines.permit_condition_extraction.components.permit_condition_extractor.DEBUG_MODE', True)
def test_debug_mode(mock_chat_generator, sample_documents, tmp_path):
    with patch('builtins.open', create=True) as mock_open:
        extractor = PermitConditionExtractor(chat_generator=mock_chat_generator)
        extractor.run(documents=sample_documents, template="Test template")
        
        assert mock_open.call_count == 3

def test_invalid_json_response(sample_documents):
    mock_generator = Mock()
    mock_generator.run.return_value = {
        "data": ChatData(messages=[[ChatMessage.from_system(text="Invalid JSON")]], documents=[])
    }
    
    extractor = PermitConditionExtractor(chat_generator=mock_generator, template="another test")
    
    with pytest.raises(json.JSONDecodeError):
        extractor.run(documents=sample_documents)

def test_empty_response(sample_documents):
    mock_generator = Mock()
    mock_generator.run.return_value = {"data": None}
    
    extractor = PermitConditionExtractor(chat_generator=mock_generator, template="just testing things")
    result = extractor.run(documents=sample_documents)
    
    assert isinstance(result["conditions"], PermitConditions)
    assert len(result["conditions"].conditions) == 0
