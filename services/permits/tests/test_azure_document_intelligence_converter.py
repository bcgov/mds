import json
import os
from unittest import mock

import pytest
from app.pipelines.permit_condition_extraction.components.azure_document_intelligence_converter import (
    AzureDocumentIntelligenceConverter,
)
from app.tasks.tasks import task_context
from tests.mocks import MockContext


@pytest.fixture
def converter():
    return AzureDocumentIntelligenceConverter(
        api_key='abc123',
        api_version='v1.0',
        endpoint='https://test.com',
    )


@pytest.fixture(scope="session", autouse=True)
def set_env():
    os.environ["DEBUG_MODE"] = "false"


@mock.patch(
    "app.pipelines.permit_condition_extraction.components.azure_document_intelligence_converter.DEBUG_MODE",
    False,
)
@mock.patch(
    "app.pipelines.permit_condition_extraction.components.azure_document_intelligence_converter.DocumentIntelligenceClient"
)
def test_run(mock_client, converter, tmp_path):
    os.environ["DEBUG_MODE"] = "faalse"
    file_path = tmp_path / "test.pdf"
    file_path.write_text("Test PDF content")

    mock_poller = mock.Mock()
    mock_result = mock.Mock()
    mock_result.paragraphs = [
        mock.Mock(
            content="Test paragraph",
            role="Test role",
            bounding_regions=[
                mock.Mock(
                    polygon=[
                        1,2,3,4,5,6,7,8
                    ],
                    page_number=1
                )
            ],
        ),
        mock.Mock(
            content="Test paragraph2",
            role="Test role2",
            bounding_regions=[
                mock.Mock(
                    polygon=[
                        2,2,3,9,5,6,6,4
                    ],
                    page_number=2
                )
            ],
        ),
    ]
    mock_poller.result.return_value = mock_result
    mock_client.return_value.begin_analyze_document.return_value = mock_poller

    with task_context(MockContext()):
        result = converter.run(file_path)

    assert isinstance(result, dict)
    assert "documents" in result

    documents = result["documents"]

    assert isinstance(documents, list)

    assert len(documents) == 2

    document = documents[0]

    res = json.loads(document.content)

    assert res["text"] == "Test paragraph"
    assert res["role"] == "Test role"
    assert res["sort_key"] == 1
    assert res["id"] is not None

    assert document.meta == {
        "bounding_box": {
            "top": 2,
            "right": 7,
            "bottom": 8,
            "left": 1,
        },
        "page": 1,
        "role": "Test role",
    }



def test_add_metadata_to_document(converter):
    idx = 0
    p = mock.Mock(
        content="Test paragraph",
        role="Test role",
        bounding_regions=[
            mock.Mock(
                polygon=[
                    1,2,3,4,5,6,7,8

                ],
                page_number=2
            )
        ],
    )

    document = converter.add_metadata_to_document(idx, p)

    assert document.content is not None
    assert document.meta is not None

    assert document.meta == {
        "bounding_box": {
            "top": 2,
            "right": 7,
            "bottom": 8,
            "left": 1,
        },
        "page": 2,
        "role": "Test role",
    }
