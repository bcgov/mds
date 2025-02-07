from pathlib import Path
from unittest import mock

import pytest
from app.pipelines.permit_condition_search.components.csv_to_document_converter import (
    CSVToDocument,
)


@pytest.fixture
def csv_converter():
    return CSVToDocument()

@pytest.fixture
def mock_csv_file(tmp_path):
    csv_content = "condition,field1,field2\ntest condition,value1,value2\n"
    csv_file = tmp_path / "test.csv"
    csv_file.write_text(csv_content)
    return csv_file

def test_csv_to_document_success(csv_converter, mock_csv_file):
    documents = csv_converter.run(mock_csv_file)['documents']
    
    assert len(documents) == 1
    assert documents[0].content == 'test condition'
    assert documents[0].meta == {'field1': 'value1', 'field2': 'value2'}

def test_csv_to_document_empty_meta_fields(tmp_path):
    csv_content = "condition,field1,field2\ntest condition,,\n"
    csv_file = tmp_path / "test.csv"
    csv_file.write_text(csv_content)
    
    documents = CSVToDocument().run(csv_file)['documents']
    
    assert len(documents) == 1
    assert documents[0].content == 'test condition'
    assert documents[0].meta == {}

def test_csv_to_document_file_not_found(csv_converter):
    with pytest.raises(Exception) as exc:
        csv_converter.run(Path('nonexistent.csv'))
    assert "CSV file not found" in str(exc.value)

def test_csv_to_document_invalid_csv(tmp_path):
    invalid_csv = tmp_path / "invalid.csv"
    invalid_csv.write_text("invalid,csv\ndata\nmissing,columns,abc,123")
    
    with pytest.raises(Exception) as exc:
        CSVToDocument().run(invalid_csv)
    assert "Invalid row found in CSV file" in str(exc.value)

def test_csv_to_document_multiple_rows(tmp_path):
    csv_content = "condition,field1\nfirst condition,value1\nsecond condition,value2\n" 
    csv_file = tmp_path / "test.csv"
    csv_file.write_text(csv_content)
    
    documents = CSVToDocument().run(csv_file)['documents']
    
    assert len(documents) == 2
    assert documents[0].content == 'first condition'
    assert documents[1].content == 'second condition'