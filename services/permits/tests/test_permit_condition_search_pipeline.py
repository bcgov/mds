from unittest.mock import MagicMock, patch

import pytest
from app.pipelines.permit_condition_extraction.components.azure_document_intelligence_converter import (
    AzureDocumentIntelligenceConverter,
)
from app.pipelines.permit_condition_search.components.azure_blob_upload import (
    AzureBlobUploader,
)
from app.pipelines.permit_condition_search.permit_condition_search_pipeline import (
    create_permit_condition_search_indexing_pipeline,
    create_permit_condition_search_retrieval_pipeline,
)
from app.pipelines.permit_condition_search.stores.ai_search_document_store import (
    AzureSearchDocumentStore,
)
from haystack.components.builders import ChatPromptBuilder
from haystack.components.embedders import AzureOpenAITextEmbedder
from haystack.components.generators.chat import AzureOpenAIChatGenerator
from haystack.core.pipeline.async_pipeline import AsyncPipeline
from haystack_integrations.components.retrievers.azure_ai_search import (
    AzureAISearchHybridRetriever,
)


@pytest.fixture
def mock_components():
    # Mock the components that require credentials
    AzureOpenAITextEmbedder.__init__ = MagicMock(return_value=None)
    AzureOpenAIChatGenerator.__init__ = MagicMock(return_value=None)
    AzureAISearchHybridRetriever.__init__ = MagicMock(return_value=None)
    AzureDocumentIntelligenceConverter.__init__ = MagicMock(return_value=None)
    AzureBlobUploader.__init__ = MagicMock(return_value=None)
    with patch("app.pipelines.permit_condition_search.permit_condition_search_pipeline.create_azure_search_document_store") as mock_create_store:
        mock_create_store.return_value = MagicMock(spec=AzureSearchDocumentStore)
        yield


def test_create_permit_condition_search_retrieval_pipeline_returns_pipeline(mock_components):
    pipeline = create_permit_condition_search_retrieval_pipeline()
    assert isinstance(pipeline, AsyncPipeline)


def test_indexing_pipeline_validates(mock_components):
    pipeline = create_permit_condition_search_retrieval_pipeline()
    try:
        query = "test query"
        pipeline._validate_input({"text_embedder": {"text": query}, "retriever": {"query": query}, "prompt_builder": {"question": query}})

    except Exception as e:
        pytest.fail(f"Pipeline validation failed with error: {str(e)}")


def test_search_pipeline_validates(mock_components):
    pipeline = create_permit_condition_search_indexing_pipeline()
    try:
        pipeline._validate_input({"blob_uploader": {"file_path": "test.csv"}})

    except Exception as e:
        pytest.fail(f"Pipeline validation failed with error: {str(e)}")