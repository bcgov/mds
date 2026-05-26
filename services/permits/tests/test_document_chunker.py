import json
import pytest
from haystack import Document
from app.pipelines.document_search.components.document_chunker import DocumentChunker, DocumentChunkMetadata

def test_document_chunker_run():
    chunker = DocumentChunker()
    metadata = DocumentChunkMetadata(
        now_application_guid="now_guid",
        mine_guid="mine_guid",
        document_manager_guid="doc_guid",
        document_name="test_doc.pdf",
        document_type="Technical Report",
        submitted_date="2023-01-01"
    )
    
    documents = [
        Document(content=json.dumps({"text": "This is a long enough paragraph to be indexed. It has more than 50 characters."}), meta={"page": 3}),
        Document(content=json.dumps({"text": "Short"})),
        Document(content="This is another long enough paragraph that is not JSON encoded. It should also be handled.")
    ]
    
    result = chunker.run(documents=documents, metadata=metadata)
    
    assert result["chunk_count"] == 2
    assert len(result["chunks"]) == 2
    
    chunk1 = result["chunks"][0]
    assert chunk1["content"] == "This is a long enough paragraph to be indexed. It has more than 50 characters."
    assert chunk1["document_name"] == "test_doc.pdf"
    assert chunk1["document_type"] == "Technical Report"
    assert chunk1["submitted_date"] == "2023-01-01"
    assert chunk1["now_application_guid"] == "now_guid"
    assert chunk1["artifact_type"] == "text"
    assert chunk1["artifact_id"] is None
    assert chunk1["artifact_page_number"] == 3
    
    chunk2 = result["chunks"][1]
    assert chunk2["content"] == "This is another long enough paragraph that is not JSON encoded. It should also be handled."
    assert chunk2["document_manager_guid"] == "doc_guid"
    assert chunk2["artifact_type"] == "text"
    assert chunk2["artifact_page_number"] is None

def test_document_chunker_make_id():
    chunker = DocumentChunker()
    id1 = chunker._make_id("now", "doc", 0)
    id2 = chunker._make_id("now", "doc", 1)
    id3 = chunker._make_id("now", "doc", 0)
    
    assert id1 != id2
    assert id1 == id3
    assert len(id1) == 16
