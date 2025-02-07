from unittest.mock import MagicMock, patch

import pytest
from app.pipelines.permit_condition_search.components.document_embedder_with_cache import (
    DocumentEmbedderCache,
)
from haystack import Document
from haystack.document_stores.types import DuplicatePolicy


@pytest.fixture
def mock_document_store():
    return MagicMock()


@pytest.fixture 
def test_documents():
    return [
        Document(content="test doc 1"),
        Document(content="test doc 2")
    ]


def test_init(mock_document_store):
    embedder = DocumentEmbedderCache(
        document_store=mock_document_store,
        cache_field="test_field"
    )
    
    assert embedder.document_store == mock_document_store
    assert embedder.cache_field == "test_field"
    assert embedder.document_writer.document_store == mock_document_store
    assert embedder.document_writer.policy == DuplicatePolicy.OVERWRITE


@patch("app.pipelines.permit_condition_search.components.document_embedder_with_cache.AzureOpenAIDocumentEmbedder.run")
def test_run(mock_run, mock_document_store, test_documents):
    embedder = DocumentEmbedderCache(
        document_store=mock_document_store,
        cache_field="test_field"
    )
    
    # Mock the parent class run method to return documents with embeddings
    mock_docs = test_documents.copy()
    for doc in mock_docs:
        doc.embedding = [0.1, 0.2, 0.3]
    mock_run.return_value = {"documents": mock_docs}
    mock_document_store.write_documents.return_value = None

    result = embedder.run(test_documents)

    # Verify parent class run was called
    mock_run.assert_called_once_with(test_documents)

    # Verify documents were written to cache
    embedder.document_writer.document_store.write_documents.assert_called_once()
    written_docs = embedder.document_writer.document_store.write_documents.call_args.kwargs['documents']
    assert len(written_docs) == 2
    assert written_docs[0].meta["test_field"] == "test doc 1"
    assert written_docs[1].meta["test_field"] == "test doc 2"

    # Verify original result is returned
    assert result["documents"] == mock_docs