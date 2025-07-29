import json
import os
from unittest.mock import MagicMock

import pytest
from app.pipelines.permit_condition_extraction.components.filter_conditions_paragraphs import (
    FilterConditionsParagraphsConverter,
    _identify_bottom_of_first_page_header,
    filter_paragraphs,
)
from app.tasks.tasks import task_context
from haystack import Document
from tests.mocks import MockContext

logger = MagicMock()


@pytest.fixture(scope="session", autouse=True)
def set_env():
    os.environ["DEBUG_MODE"] = "true"


def test_run():
    with task_context(MockContext()):

        documents = [
            Document(
                content=json.dumps(
                    {"id": "abc123", "text": "paragraph 1", "role": None}
                ),
                meta={"bounding_box": {"left": 10}, "page": 1},
            ),
            Document(
                content=json.dumps(
                    {"id": "abc234", "text": "paragraph 2", "role": None}
                ),
                meta={"bounding_box": {"left": 20}, "page": 1},
            ),
        ]
        converter = FilterConditionsParagraphsConverter()

        result = converter.run(documents)

        assert len(result["documents"]) == 2
        assert json.loads(result["documents"][0].content)["text"] == "paragraph 1"
        assert json.loads(result["documents"][1].content)["text"] == "paragraph 2"


def test_excludes_text_in_header():
    paragraphs = [
        Document(
            content=json.dumps(
                {"id": "ab2", "text": "Page Header start", "role": "pageHeader"}
            ),
            meta={"bounding_box": {"top": 0, "bottom": 5}, "page": 1},
        ),
        Document(
            content=json.dumps(
                {
                    "id": "ab2",
                    "text": "Page Header end",
                    "role": None,
                }
            ),
            meta={"bounding_box": {"bottom": 10, "top": 5}, "page": 1},
        ),
        Document(
            content=json.dumps(
                {
                    "id": "ab3",
                    "text": "conditions header",
                    "role": "sectionHeading",
                }
            ),
            meta={"bounding_box": {"top": 20}, "page": 1},
        ),
        Document(
            content=json.dumps(
                {"id": "ab4", "text": "A. General", "role": "sectionHeading"}
            ),
            meta={"bounding_box": {"top": 20}, "page": 1},
        ),
        Document(
            content=json.dumps(
                {
                    "id": "ab5",
                    "text": "Page 1 of two",
                    "role": None,
                }
            ),
            meta={"bounding_box": {"top": 4}, "page": 1},
        ),
        Document(
            content=json.dumps(
                {
                    "id": "ab6",
                    "text": "2",
                    "role": "sectionHeading",
                }
            ),
            meta={"bounding_box": {"top": 30}, "page": 1},
        ),
    ]

    for p in paragraphs:
        if p.content:
            p.content = json.loads(p.content)

    with task_context(MockContext()):
        result = filter_paragraphs(paragraphs)

    assert len(result) == 2
    assert result[0].content["text"] == "A. General"
    assert result[1].content["text"] == "2"


def test_filter_paragraphs_excludes_page_nr_footnote_page_footer():
    paragraphs = [
        Document(
            content=json.dumps(
                {"id": "ab3", "text": "conditions header", "role": "sectionHeading"}
            ),
            meta={"page": 1},
        ),
        Document(
            content=json.dumps(
                {"id": "ab4", "text": "A. General", "role": "sectionHeading"}
            ),
            meta={"page": 1},
        ),
        Document(
            content=json.dumps({"id": "ab5", "text": "1", "role": None}),
            meta={"page": 1},
        ),
        Document(
            content=json.dumps({"id": "ab6", "text": "2", "role": "pageNumber"}),
            meta={"page": 1},
        ),
        Document(
            content=json.dumps({"id": "ab6", "text": "3", "role": "footnote"}),
            meta={"page": 1},
        ),
        Document(
            content=json.dumps({"id": "ab6", "text": "4", "role": "pageFooter"}),
            meta={"page": 1},
        ),
        Document(
            content=json.dumps({"id": "ab5", "text": "5", "role": None}),
            meta={"page": 1},
        ),
    ]

    for p in paragraphs:
        if p.content:
            p.content = json.loads(p.content)

    with task_context(MockContext()):
        result = filter_paragraphs(paragraphs)

    assert len(result) == 3
    assert result[0].content["text"] == "A. General"
    assert result[1].content["text"] == "1"
    assert result[2].content["text"] == "5"


def test_filter_paragraphs_only_includes_paragraphs_in_conditions_section_finds_conditions_header():
    paragraphs = [
        Document(
            content=json.dumps({"role": None, "text": "paragraph 1"}),
            meta={"page": 1},
        ),
        Document(
            content=json.dumps({"role": None, "text": "paragraph 2"}),
            meta={"page": 1},
        ),
        Document(
            content=json.dumps(
                {"role": "sectionHeading", "text": "Permit Conditions"}
            ),
            meta={"page": 1},
        ),
        Document(
            content=json.dumps({"role": None, "text": "paragraph after header"}),
            meta={"page": 1},
        ),
        Document(
            content=json.dumps(
                {"role": "sectionHeading", "text": "1. First condition"}
            ),
            meta={"page": 1},
        ),
        Document(
            content=json.dumps({"role": None, "text": "2. Second condition"}),
            meta={"page": 1},
        ),
    ]

    for p in paragraphs:
        if p.content:
            p.content = json.loads(p.content)

    with task_context(MockContext()):
        result = filter_paragraphs(paragraphs)

    assert len(result) == 2
    assert result[0].content["text"] == "1. First condition"
    assert result[1].content["text"] == "2. Second condition"


def test_filter_paragraphs_only_includes_paragraphs_in_conditions_section_no_conditions_header():
    paragraphs = [
        Document(
            content=json.dumps({"role": None, "text": "paragraph 1"}),
            meta={"page": 1},
        ),
        Document(
            content=json.dumps({"role": None, "text": "paragraph 2"}),
            meta={"page": 1},
        ),
    ]

    for p in paragraphs:
        if p.content:
            p.content = json.loads(p.content)

    with task_context(MockContext()):
        result = filter_paragraphs(paragraphs)

    assert len(result) == 2
    assert result[0].content["text"] == "paragraph 1"
    assert result[1].content["text"] == "paragraph 2"


def test_filter_paragraphs_only_includes_paragraphs_in_conditions_section_header_only():
    paragraphs = [
        Document(
            content=json.dumps({"role": None, "text": "paragraph 1"}),
            meta={"page": 1},
        ),
        Document(
            content=json.dumps(
                {"role": "sectionHeading", "text": "Permit Conditions"}
            ),
            meta={"page": 1},
        ),
    ]

    for p in paragraphs:
        if p.content:
            p.content = json.loads(p.content)

    with task_context(MockContext()):
        result = filter_paragraphs(paragraphs)

    assert len(result) == 1
    assert result[0].content["text"] == "Permit Conditions"


def test_identify_bottom_of_first_page_header():
    paragraphs = [
        Document(
            content=json.dumps({"id": "ab1", "text": "paragraph 1", "role": None}),
            meta={"bounding_box": {"bottom": 40, "top": 30}, "page": 1},
        ),
        Document(
            content=json.dumps({"id": "ab2", "text": "paragraph 2", "role": None}),
            meta={"bounding_box": {"bottom": 40, "top": 30}, "page": 1},
        ),
        Document(
            content=json.dumps(
                {"id": "ab3", "text": "page header 1", "role": "pageHeader"}
            ),
            meta={"bounding_box": {"bottom": 10}, "page": 1},
        ),
        Document(
            content=json.dumps({"id": "ab4", "text": "page header 2", "role": None}),
            meta={"bounding_box": {"bottom": 20}, "page": 1},
        ),
        Document(
            content=json.dumps(
                {"id": "ab5", "text": "page header 2", "role": "sectionHeader"}
            ),
            meta={"bounding_box": {"bottom": 20}, "page": 1},
        ),
        Document(
            content=json.dumps({"id": "ab6", "text": "permit no", "role": "role3"}),
            meta={"bounding_box": {"bottom": 30, "top": 40}, "page": 1},
        ),
    ]

    for p in paragraphs:
        if p.content:
            p.content = json.loads(p.content)

    with task_context(MockContext()):
        result = _identify_bottom_of_first_page_header(paragraphs)

    assert result == 10


def test_identify_bottom_of_first_page_header_different_pages():
    paragraphs = [
        Document(
            content=json.dumps(
                {"id": "ab3", "text": "page header 1", "role": "pageHeader"}
            ),
            meta={"bounding_box": {"bottom": 10}, "page": 1},
        ),
        Document(
            content=json.dumps({"id": "ab4", "text": "page header 2", "role": "pageHeader"}),
            meta={"bounding_box": {"bottom": 20}, "page": 1},
        ),
        Document(
            content=json.dumps({"id": "ab6", "text": "permit no", "role": "pageHeader"}),
            meta={"bounding_box": {"bottom": 30, "top": 40}, "page": 1},
        ),
        Document(
            content=json.dumps(
                {"id": "ab5", "text": "page header 2", "role": "sectionHeader"}
            ),
            meta={"bounding_box": {"bottom": 20}, "page": 2},
        ),
    ]

    for p in paragraphs:
        if p.content:
            p.content = json.loads(p.content)

    with task_context(MockContext()):
        result = _identify_bottom_of_first_page_header(paragraphs)

    assert result is None


def test_filter_paragraphs_integration_multi_page():
    paragraphs = [
        # Page 1
        Document(
            content=json.dumps({"role": "pageHeader", "text": "Header"}),
            meta={"bounding_box": {"top": 0, "bottom": 10}, "page": 1},
        ),
        Document(
            content=json.dumps({"role": "sectionHeading", "text": "Permit Details"}),
            meta={"bounding_box": {"top": 20, "bottom": 30}, "page": 1},
        ),
        Document(
            content=json.dumps({"role": None, "text": "Some intro text"}),
            meta={"bounding_box": {"top": 30, "bottom": 40}, "page": 1},
        ),
        Document(
            content=json.dumps({"role": "pageFooter", "text": "Page 1"}),
            meta={"bounding_box": {"top": 90, "bottom": 100}, "page": 1},
        ),
        # Page 2
        Document(
            content=json.dumps({"role": "pageHeader", "text": "Header"}),
            meta={"bounding_box": {"top": 0, "bottom": 10}, "page": 2},
        ),
        Document(
            content=json.dumps(
                {"role": "title", "text": "Part B: Conditions"}
            ),
            meta={"bounding_box": {"top": 20, "bottom": 30}, "page": 2},
        ),
        Document(
            content=json.dumps({"role": "sectionHeading", "text": "1. General Conditions"}),
            meta={"bounding_box": {"top": 30, "bottom": 40}, "page": 2},
        ),
        Document(
            content=json.dumps({"role": None, "text": "This is the first condition."}),
            meta={"bounding_box": {"top": 40, "bottom": 50}, "page": 2},
        ),
        Document(
            content=json.dumps({"role": "pageFooter", "text": "Page 2"}),
            meta={"bounding_box": {"top": 90, "bottom": 100}, "page": 2},
        ),
    ]
    for p in paragraphs:
        if p.content:
            p.content = json.loads(p.content)

    with task_context(MockContext()):
        result = filter_paragraphs(paragraphs)

    assert len(result) == 2
    assert result[0].content["text"] == "1. General Conditions"
    assert result[1].content["text"] == "This is the first condition."


def test_filter_paragraphs_excludes_figure_paragraphs():
    paragraphs = [
        Document(
            content=json.dumps({"role": None, "text": "This is a normal paragraph."}),
            meta={"page": 1},
        ),
        Document(
            content=json.dumps(
                {"role": None, "text": ' Figure 1: Map of area 49° 5\' 30"'}
            ),
            meta={"page": 1},
        ),
        Document(
            content=json.dumps({"role": None, "text": "Figure 2: Another map"}),
            meta={"page": 1},
        ),
        Document(
            content=json.dumps(
                {"role": None, "text": "This is another normal paragraph."}
            ),
            meta={"page": 1},
        ),
    ]

    for p in paragraphs:
        if p.content:
            p.content = json.loads(p.content)

    with task_context(MockContext()):
        result = filter_paragraphs(paragraphs)

    assert len(result) == 3
    assert result[0].content["text"] == "This is a normal paragraph."
    assert result[1].content["text"] == "Figure 2: Another map"
    assert result[2].content["text"] == "This is another normal paragraph."
