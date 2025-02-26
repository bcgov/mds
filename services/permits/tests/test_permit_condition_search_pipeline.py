from unittest.mock import MagicMock

import pytest
from app.pipelines.permit_condition_search.permit_condition_search_pipeline import (
    create_permit_condition_search_indexing_pipeline,
    create_permit_condition_search_retrieval_pipeline,
)
from haystack import Pipeline
from haystack.components.builders import ChatPromptBuilder
from haystack.components.embedders import AzureOpenAITextEmbedder
from haystack.components.generators.chat import AzureOpenAIChatGenerator
from haystack_integrations.components.retrievers.azure_ai_search import (
    AzureAISearchHybridRetriever,
)


@pytest.fixture
def mock_components():
    # Mock the components that require credentials
    AzureOpenAITextEmbedder.__init__ = MagicMock(return_value=None)
    AzureOpenAIChatGenerator.__init__ = MagicMock(return_value=None)
    AzureAISearchHybridRetriever.__init__ = MagicMock(return_value=None)
    ChatPromptBuilder.__init__ = MagicMock(return_value=None)

def test_create_permit_condition_search_retrieval_pipeline_returns_pipeline(mock_components):
    pipeline = create_permit_condition_search_retrieval_pipeline()
    assert isinstance(pipeline, Pipeline)

def test_indexing_pipeline_validates(mock_components):
    pipeline = create_permit_condition_search_retrieval_pipeline()
    try:
        pipeline._validate_input({"text_embedder": {"query": "test query"}, "retriever": {"query": "test query"}, "text_embedder": {"text": "test query"}})

    except Exception as e:
        pytest.fail(f"Pipeline validation failed with error: {str(e)}")

def test_search_pipeline_validates(mock_components):
    pipeline = create_permit_condition_search_indexing_pipeline()
    try:
        pipeline._validate_input({"csv_converter": {"file_path": "test.csv"}})

    except Exception as e:
        pytest.fail(f"Pipeline validation failed with error: {str(e)}")