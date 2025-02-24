import json
import os
from unittest.mock import MagicMock, patch

import pytest
from app.pipelines.permit_condition_search.components.cached_embedding import (
    EmbeddingCache,
    hash_message,
)
from haystack import Document, Pipeline


@pytest.fixture
def document_store():
    return MagicMock()

@pytest.fixture 
def cache_checker():
    return MagicMock()

def test_hash_message():
    message = "test message"
    expected_hash = "3f0a377ba0a4a460ecb616f6507ce0d8cfa3e704025d4fda3ed0c5ca05468728"
    assert hash_message(message) == expected_hash

def test_embedding_cache_init(document_store):
    cache_field = "content"
    component = EmbeddingCache(document_store=document_store, cache_field=cache_field)
    assert component.cache_field == cache_field
    assert component.cache_checker is not None

def test_run_with_cache_hits(document_store):
    # Setup
    cache_field = "content"
    component = EmbeddingCache(document_store=document_store, cache_field=cache_field)
    
    doc1 = Document(content="test1")
    doc2 = Document(content="test2")
    documents = [doc1, doc2]
    
    embedding1 = [0.1, 0.2, 0.3]
    embedding2 = [0.4, 0.5, 0.6]
    
    mock_hit1 = MagicMock()
    mock_hit1.content = json.dumps(embedding1)
    mock_hit1.meta = {cache_field: "test1"}
    
    mock_hit2 = MagicMock()
    mock_hit2.content = json.dumps(embedding2)
    mock_hit2.meta = {cache_field: "test2"}
    
    component.cache_checker.run = MagicMock(return_value={
        "hits": [mock_hit1, mock_hit2],
        "misses": []
    })

    # Execute
    result = component.run(documents)

    # Assert
    assert len(result["hits"]) == 2
    assert len(result["misses"]) == 0
    assert result["hits"][0].embedding == embedding1
    assert result["hits"][1].embedding == embedding2

def test_run_with_cache_misses(document_store):
    # Setup
    cache_field = "content"
    component = EmbeddingCache(document_store=document_store, cache_field=cache_field)
    
    doc1 = Document(content="test1")
    doc2 = Document(content="test2")
    documents = [doc1, doc2]
    
    mock_miss1 = MagicMock()
    mock_miss1.meta = {cache_field: "test1"}
    
    mock_miss2 = MagicMock()
    mock_miss2.meta = {cache_field: "test2"}
    
    component.cache_checker.run = MagicMock(return_value={
        "hits": [],
        "misses": [mock_miss1, mock_miss2]
    })

    # Execute
    result = component.run(documents)

    # Assert
    assert len(result["hits"]) == 0
    assert len(result["misses"]) == 2
    assert result["misses"][0].content == "test1"
    assert result["misses"][1].content == "test2"

def test_embedding_cache_in_pipeline(document_store):
    # Setup pipeline
    embedding_cache = EmbeddingCache(document_store=document_store, cache_field="content")
    pipeline = Pipeline()
    pipeline.add_component("embedding_cache", embedding_cache)
    
    # Create test documents
    doc1 = Document(content="test1")
    doc2 = Document(content="test2")
    documents = [doc1, doc2]
    
    # Mock cache checker response
    embedding1 = [0.1, 0.2, 0.3]
    mock_hit = MagicMock()
    mock_hit.content = json.dumps(embedding1)
    mock_hit.meta = {"content": "test1"}
    
    mock_miss = MagicMock()
    mock_miss.meta = {"content": "test2"}
    
    embedding_cache.cache_checker.run = MagicMock(return_value={
        "hits": [mock_hit],
        "misses": [mock_miss]
    })

    # Execute pipeline
    result = pipeline.run({"embedding_cache": {"documents": documents}})

    # Assert
    assert len(result["embedding_cache"]["hits"]) == 1
    assert len(result["embedding_cache"]["misses"]) == 1
    assert result["embedding_cache"]["hits"][0].embedding == embedding1
    assert result["embedding_cache"]["misses"][0].content == "test2"