import os
import json
import io
import csv
from unittest.mock import MagicMock, patch
import pytest
import pandas as pd
from haystack import Document

from app.permit_conditions.converters.filter_conditions_paragraphs import (
    FilterConditionsParagraphsConverter,
    filter_paragraphs,
    _identify_bottom_of_first_page_header,
    _create_csv_representation
)
from app.permit_conditions.tasks.tasks import task_context
from tests.mocks import MockContext

logger = MagicMock()


@pytest.fixture(scope="session", autouse=True)
def set_env():
    os.environ["DEBUG_MODE"] = "true"



def test_run():
    with task_context(MockContext()):

        documents = [
            Document(content=json.dumps({"id": "abc123", "text": "paragraph 1", "role": None}), meta={"bounding_box": {"left": 10}}),
            Document(content=json.dumps({"id": "abc234", "text": "paragraph 2", "role": None}), meta={"bounding_box": {"left": 20}}),
        ]
        converter = FilterConditionsParagraphsConverter()

        result = converter.run(documents)

        assert len(result["documents"]) == 3
        assert result["documents"][0].content == '"id","indentation","text"\n"abc123","10","paragraph 1"\n"abc234","20","paragraph 2"\n'
        assert json.loads(result["documents"][1].content)['text'] == 'paragraph 1'
        assert json.loads(result["documents"][2].content)['text'] == 'paragraph 2'


def test_create_csv_representation():
    docs = [
        Document(content={"id": "abc123", "text": "paragraph 1", "role": None,}, meta={"bounding_box": {"left": 10}}),
        Document(content={"id": "abc234", "text": "paragraph 2", "role": None,}, meta={"bounding_box": {"left": 20}}),
    ]
    
    with task_context(MockContext()):

        result = _create_csv_representation(docs)

        expected_csv = '"id","indentation","text"\n"abc123","10","paragraph 1"\n"abc234","20","paragraph 2"\n'
        assert result == expected_csv

def test_excludes_text_in_header():
    paragraphs = [
        Document(content={"id": "ab2", "text": "Page Header start", "role": "pageHeader"}, meta={ "bounding_box": {"top": 0, "bottom": 5}}),
        Document(content={"id": "ab2", "text": "Page Header end", "role": None,}, meta={ "bounding_box": {"bottom": 10, "top": 5}}),
        Document(content={"id": "ab3", "text": "conditions header", "role": "sectionHeading",}, meta={ "bounding_box": {"top": 20}}),
        Document(content={"id": "ab4", "text": "A. General", "role": "sectionHeading"}, meta={ "bounding_box":  {"top": 20}}),
        Document(content={"id": "ab5", "text": "Page 1 of two", "role": None,}, meta={ "bounding_box": {"top": 5}}),
        Document(content={"id": "ab6", "text": "2", "role": "sectionHeading",}, meta={ "bounding_box": {"top": 30}}),
    ]

    with task_context(MockContext()):
        result = filter_paragraphs(paragraphs)
    
    assert len(result) == 2
    assert result[0].content["text"] == "A. General"
    assert result[1].content["text"] == "2"

def test_filter_paragraphs_excludes_page_nr_footnote_page_footer():
    paragraphs = [
        Document(content={"id": "ab3", "text": "conditions header", "role": "sectionHeading"}),
        Document(content={"id": "ab4", "text": "A. General", "role": "sectionHeading"}),
        Document(content={"id": "ab5", "text": "1", "role": None}),
        Document(content={"id": "ab6", "text": "2", "role": "pageNumber"}),
        Document(content={"id": "ab6", "text": "3", "role": "footnote"}),
        Document(content={"id": "ab6", "text": "4", "role": "pageFooter"}),
        Document(content={"id": "ab5", "text": "5", "role": None}),
    ]
    with task_context(MockContext()):
        result = filter_paragraphs(paragraphs)

    assert len(result) == 3
    assert result[0].content["text"] == "A. General"
    assert result[1].content["text"] == "1"
    assert result[2].content["text"] == "5"


def test_filter_paragraphs_only_includes_paragraphs_in_conditions_section():
    paragraphs = [
        Document(content={"id": "ab1", "text": "paragraph 1", "role": None}),
        Document(content={"id": "ab2", "text": "paragraph 2", "role": None}),
        Document(content={"id": "ab3", "text": "conditions header", "role": "sectionHeading"}),
        Document(content={"id": "ab2", "text": "paragraph 2", "role": None}),
        Document(content={"id": "ab4", "text": "condition 1", "role": "sectionHeading"}),
        Document(content={"id": "ab5", "text": "condition 2", "role": None}),
    ]

    with task_context(MockContext()):
        result = filter_paragraphs(paragraphs)

    assert len(result) == 2
    assert result[0].content["text"] == "condition 1"
    assert result[1].content["text"] == "condition 2"


def test_identify_bottom_of_first_page_header():
    paragraphs = [
        Document(content={"id": "ab1", "text": "paragraph 1", "role": None}, meta={"bounding_box": {"bottom": 40, "top": 30}}),
        Document(content={"id": "ab2", "text": "paragraph 2", "role": None}, meta={"bounding_box": {"bottom": 40, "top": 30}}),
        Document(content={"id": "ab3", "text": "page header 1", "role": "pageHeader"}, meta={"bounding_box": {"bottom": 10}}),
        Document(content={"id": "ab4", "text": "page header 2", "role": None}, meta={"bounding_box": {"bottom": 20}}),
        Document(content={"id": "ab5", "text": "page header 2", "role": "sectionHeader"}, meta={"bounding_box": {"bottom": 20}}),
        Document(content={"id": "ab6", "text": "permit no", "role": "role3"}, meta={"bounding_box": {"bottom": 30, "top": 40}}),
    ]

    with task_context(MockContext()):
        result = _identify_bottom_of_first_page_header(paragraphs)

    assert result == 20