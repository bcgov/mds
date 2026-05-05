import pytest
from unittest.mock import MagicMock, patch
from app.pipelines.document_search.indexing import (
    delete_document_chunks,
    embed_chunks,
    push_to_index,
    extract_and_chunk_file
)

@pytest.fixture
def mock_search_client():
    return MagicMock()

def test_delete_document_chunks(mock_search_client):
    mock_search_client.search.side_effect = [
        [{"id": "1"}, {"id": "2"}],
        []
    ]
    mock_search_client.delete_documents.return_value = [
        MagicMock(succeeded=True),
        MagicMock(succeeded=True)
    ]
    
    deleted = delete_document_chunks(mock_search_client, "doc_guid")
    
    assert deleted == 2
    mock_search_client.search.assert_called()
    mock_search_client.delete_documents.assert_called_once_with(documents=[{"id": "1"}, {"id": "2"}])

def test_embed_chunks():
    chunks = [{"content": "text1"}, {"content": "text2"}]
    
    with patch("app.pipelines.document_search.indexing.openai_client") as mock_openai:
        mock_response = MagicMock()
        mock_response.data = [
            MagicMock(embedding=[0.1, 0.2]),
            MagicMock(embedding=[0.3, 0.4])
        ]
        mock_openai.embeddings.create.return_value = mock_response
        
        mock_progress = MagicMock()
        result = embed_chunks(chunks, on_progress=mock_progress)
        
        assert len(result) == 2
        assert result[0]["embedding"] == [0.1, 0.2]
        assert result[1]["embedding"] == [0.3, 0.4]
        mock_progress.assert_called()

def test_push_to_index(mock_search_client):
    chunks = [{"id": "1", "content": "text1"}, {"id": "2", "content": "text2"}]
    mock_search_client.upload_documents.return_value = [
        MagicMock(succeeded=True),
        MagicMock(succeeded=True)
    ]
    
    mock_progress = MagicMock()
    succeeded = push_to_index(mock_search_client, chunks, on_progress=mock_progress)
    
    assert succeeded == 2
    mock_search_client.upload_documents.assert_called_once_with(documents=chunks)
    mock_progress.assert_called()

def test_extract_and_chunk_file():
    tmp_path = "/tmp/test.pdf"
    now_guid = "now_guid"
    doc_meta = {
        "document_manager_guid": "doc_guid",
        "document_name": "test.pdf",
        "document_type": "Report",
        "mine_guid": "mine_guid",
        "submitted_date": "2023-01-01"
    }
    
    with patch("app.pipelines.document_search.indexing.document_intelligence") as mock_di, \
         patch("app.pipelines.document_search.indexing.chunker") as mock_chunker:
        
        mock_di.run.return_value = {"documents": ["doc1"]}
        mock_chunker.run.return_value = {"chunks": [{"id": "c1", "content": "chunk1"}]}
        
        chunks = extract_and_chunk_file(tmp_path, now_guid, doc_meta)
        
        assert len(chunks) == 1
        assert chunks[0]["content"] == "chunk1"
        mock_di.run.assert_called_once()
        mock_chunker.run.assert_called_once()
