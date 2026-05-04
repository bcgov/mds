import pytest
from unittest.mock import MagicMock, patch
from haystack import AsyncPipeline
from app.pipelines.document_search.document_search_pipeline import (
    create_now_document_search_store,
    create_document_search_retrieval_pipeline
)
from app.pipelines.permit_condition_search.stores.ai_search_document_store import AzureSearchDocumentStore

@pytest.fixture(autouse=True)
def mock_config():
    with patch("app.pipelines.document_search.document_search_pipeline.config") as mock:
        mock.search.api_key.resolve_value.return_value = "test_key"
        mock.search.endpoint.resolve_value.return_value = "https://test.search.windows.net"
        mock.search.index_name.resolve_value.return_value = "test-index"
        mock.search.embedding_dimension = 1536
        
        mock.openai.endpoint.resolve_value.return_value = "https://test.openai.azure.com"
        mock.openai.api_key.resolve_value.return_value = "test_openai_key"
        mock.openai.embedding_model = "text-embedding-3-small"
        mock.openai.deployment_name = "gpt-4"
        mock.openai.api_version = "2024-02-15-preview"
        yield mock

def test_create_now_document_search_store():
    with patch("app.pipelines.document_search.document_search_pipeline.AzureSearchDocumentStore") as mock_store_class:
        store = create_now_document_search_store()
        mock_store_class.assert_called_once()
        assert store is not None

def test_create_document_search_retrieval_pipeline():
    with patch("app.pipelines.document_search.document_search_pipeline.AsyncPipeline") as mock_pipeline_class, \
         patch("app.pipelines.document_search.document_search_pipeline.AzureOpenAITextEmbedder"), \
         patch("app.pipelines.document_search.document_search_pipeline.AzureAISearchHybridRetriever"), \
         patch("app.pipelines.document_search.document_search_pipeline.AzureOpenAIChatGenerator"), \
         patch("app.pipelines.document_search.document_search_pipeline.create_now_document_search_store"):
        
        mock_pipeline = MagicMock()
        mock_pipeline_class.return_value = mock_pipeline
        
        pipeline = create_document_search_retrieval_pipeline()
        
        assert pipeline == mock_pipeline
        assert mock_pipeline.add_component.call_count == 4
        assert mock_pipeline.connect.call_count == 3
