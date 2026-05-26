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

        mock_analyze_result = MagicMock()
        mock_analyze_result.paragraphs = [MagicMock()]
        mock_analyze_result.tables = []
        mock_di.run_document_intelligence.return_value = mock_analyze_result
        mock_di.add_metadata_to_document.return_value = "doc1"
        mock_chunker.run.return_value = {"chunks": [{"id": "c1", "content": "chunk1"}]}

        chunks, artifacts = extract_and_chunk_file(tmp_path, now_guid, doc_meta)

        assert len(chunks) == 1
        assert artifacts == []
        assert chunks[0]["content"] == "chunk1"
        mock_di.run_document_intelligence.assert_called_once()
        mock_chunker.run.assert_called_once()


def test_extract_and_chunk_file_includes_table_chunks():
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

        mock_cell_h1 = MagicMock(row_index=0, column_index=0, content="ColA")
        mock_cell_h2 = MagicMock(row_index=0, column_index=1, content="ColB")
        mock_cell_r1 = MagicMock(row_index=1, column_index=0, content="A1")
        mock_cell_r2 = MagicMock(row_index=1, column_index=1, content="B1")
        mock_region = MagicMock(page_number=2, polygon=[1, 1, 5, 1, 5, 4, 1, 4])
        mock_table = MagicMock(
            row_count=2,
            column_count=2,
            cells=[mock_cell_h1, mock_cell_h2, mock_cell_r1, mock_cell_r2],
            bounding_regions=[mock_region],
            caption=None,
            footnotes=[],
        )

        mock_analyze_result = MagicMock()
        mock_analyze_result.paragraphs = [MagicMock()]
        mock_analyze_result.tables = [mock_table]
        mock_di.run_document_intelligence.return_value = mock_analyze_result
        mock_di.add_metadata_to_document.return_value = "doc1"
        mock_chunker.run.return_value = {"chunks": [{"id": "c1", "content": "chunk1"}]}

        chunks, artifacts = extract_and_chunk_file(tmp_path, now_guid, doc_meta)

        assert len(artifacts) == 1
        assert len(chunks) == 2
        assert any("Headers: ColA, ColB" in chunk["content"] for chunk in chunks)
        table_chunks = [chunk for chunk in chunks if chunk.get("artifact_type") == "table"]
        assert len(table_chunks) == 1
        assert table_chunks[0]["artifact_id"] == "doc_guid_p2_t1"
        assert table_chunks[0]["artifact_page_number"] == 2


def test_extract_and_chunk_file_includes_table_preview_and_markdown_metadata():
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
         patch("app.pipelines.document_search.indexing.chunker") as mock_chunker, \
         patch(
             "app.pipelines.document_search.indexing._build_table_upload_payload",
             return_value={
                 "file_name": "doc_guid_p2_t1.png",
                 "mime_type": "image/png",
                 "content_bytes": b"fakepng",
             },
         ):

        mock_cell_h1 = MagicMock(row_index=0, column_index=0, content="ColA")
        mock_cell_h2 = MagicMock(row_index=0, column_index=1, content="ColB")
        mock_cell_r1 = MagicMock(row_index=1, column_index=0, content="A1")
        mock_cell_r2 = MagicMock(row_index=1, column_index=1, content="B1")
        mock_region = MagicMock(page_number=2, polygon=[1, 1, 5, 1, 5, 4, 1, 4])
        mock_table = MagicMock(
            row_count=2,
            column_count=2,
            cells=[mock_cell_h1, mock_cell_h2, mock_cell_r1, mock_cell_r2],
            bounding_regions=[mock_region],
            caption=None,
            footnotes=[],
        )

        mock_analyze_result = MagicMock()
        mock_analyze_result.paragraphs = [MagicMock()]
        mock_analyze_result.tables = [mock_table]
        mock_di.run_document_intelligence.return_value = mock_analyze_result
        mock_di.add_metadata_to_document.return_value = "doc1"
        mock_chunker.run.return_value = {"chunks": [{"id": "c1", "content": "chunk1"}]}

        chunks, artifacts = extract_and_chunk_file(tmp_path, now_guid, doc_meta)

        table_chunk = next(chunk for chunk in chunks if chunk.get("artifact_type") == "table")
        assert "| ColA | ColB |" in table_chunk["artifact_table_markdown"]

        table_artifact = next(artifact for artifact in artifacts if artifact.get("type") == "table")
        assert "markdown" in table_artifact["content"]
        assert table_artifact["_artifact_upload"]["mime_type"] == "image/png"


def test_extract_and_chunk_file_table_artifact_skips_upload_when_image_unavailable():
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
         patch("app.pipelines.document_search.indexing.chunker") as mock_chunker, \
         patch("app.pipelines.document_search.indexing._build_table_upload_payload", return_value=None):

        mock_cell_h1 = MagicMock(row_index=0, column_index=0, content="ColA")
        mock_cell_h2 = MagicMock(row_index=0, column_index=1, content="ColB")
        mock_cell_r1 = MagicMock(row_index=1, column_index=0, content="A1")
        mock_cell_r2 = MagicMock(row_index=1, column_index=1, content="B1")
        mock_region = MagicMock(page_number=2, polygon=[1, 1, 5, 1, 5, 4, 1, 4])
        mock_table = MagicMock(
            row_count=2,
            column_count=2,
            cells=[mock_cell_h1, mock_cell_h2, mock_cell_r1, mock_cell_r2],
            bounding_regions=[mock_region],
            caption=None,
            footnotes=[],
        )

        mock_analyze_result = MagicMock()
        mock_analyze_result.paragraphs = [MagicMock()]
        mock_analyze_result.tables = [mock_table]
        mock_di.run_document_intelligence.return_value = mock_analyze_result
        mock_di.add_metadata_to_document.return_value = "doc1"
        mock_chunker.run.return_value = {"chunks": [{"id": "c1", "content": "chunk1"}]}

        _, artifacts = extract_and_chunk_file(tmp_path, now_guid, doc_meta)

        table_artifact = next(artifact for artifact in artifacts if artifact.get("type") == "table")
        assert "_artifact_upload" not in table_artifact


def test_extract_and_chunk_file_table_upload_disabled_by_env(monkeypatch):
    monkeypatch.setenv("DOCUMENT_ARTIFACT_ENABLE_TABLE_BINARY_UPLOAD", "false")

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
         patch("app.pipelines.document_search.indexing.chunker") as mock_chunker, \
         patch("app.pipelines.document_search.indexing._build_table_upload_payload") as mock_build_upload:

        mock_cell_h1 = MagicMock(row_index=0, column_index=0, content="ColA")
        mock_cell_h2 = MagicMock(row_index=0, column_index=1, content="ColB")
        mock_cell_r1 = MagicMock(row_index=1, column_index=0, content="A1")
        mock_cell_r2 = MagicMock(row_index=1, column_index=1, content="B1")
        mock_region = MagicMock(page_number=2, polygon=[1, 1, 5, 1, 5, 4, 1, 4])
        mock_table = MagicMock(
            row_count=2,
            column_count=2,
            cells=[mock_cell_h1, mock_cell_h2, mock_cell_r1, mock_cell_r2],
            bounding_regions=[mock_region],
            caption=None,
            footnotes=[],
        )

        mock_analyze_result = MagicMock()
        mock_analyze_result.paragraphs = [MagicMock()]
        mock_analyze_result.tables = [mock_table]
        mock_di.run_document_intelligence.return_value = mock_analyze_result
        mock_di.add_metadata_to_document.return_value = "doc1"
        mock_chunker.run.return_value = {"chunks": [{"id": "c1", "content": "chunk1"}]}

        _, artifacts = extract_and_chunk_file(tmp_path, now_guid, doc_meta)

        table_artifact = next(artifact for artifact in artifacts if artifact.get("type") == "table")
        assert "_artifact_upload" not in table_artifact
        mock_build_upload.assert_not_called()


def test_extract_and_chunk_file_includes_figure_artifacts_and_chunks():
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

        mock_region = MagicMock(page_number=4, polygon=[2, 2, 8, 2, 8, 6, 2, 6])
        mock_caption = MagicMock(content="Figure 1: Site overview")
        mock_figure_paragraph = MagicMock(content="Open pit layout with haul road alignment")
        mock_figure = MagicMock(
            bounding_regions=[mock_region],
            caption=mock_caption,
            footnotes=[],
            elements=["/paragraphs/0"],
        )

        mock_analyze_result = MagicMock()
        mock_analyze_result.paragraphs = [mock_figure_paragraph]
        mock_analyze_result.tables = []
        mock_analyze_result.figures = [mock_figure]
        mock_di.run_document_intelligence.return_value = mock_analyze_result
        mock_di.add_metadata_to_document.return_value = "doc1"
        mock_chunker.run.return_value = {"chunks": [{"id": "c1", "content": "chunk1"}]}

        chunks, artifacts = extract_and_chunk_file(tmp_path, now_guid, doc_meta)

        figure_artifacts = [artifact for artifact in artifacts if artifact.get("type") == "figure"]
        assert len(figure_artifacts) == 1
        assert figure_artifacts[0]["artifact_id"] == "doc_guid_p4_f1"
        assert figure_artifacts[0]["page_number"] == 4

        figure_chunks = [chunk for chunk in chunks if chunk.get("artifact_type") == "figure"]
        assert len(figure_chunks) == 1
        assert figure_chunks[0]["artifact_id"] == "doc_guid_p4_f1"
        assert "Figure description: Open pit layout with haul road alignment" in figure_chunks[0]["content"]


def test_extract_and_chunk_file_figure_artifact_includes_upload_payload_when_available():
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
         patch("app.pipelines.document_search.indexing.chunker") as mock_chunker, \
         patch(
             "app.pipelines.document_search.indexing._build_figure_upload_payload",
             return_value={
                 "file_name": "doc_guid_p4_f1.png",
                 "mime_type": "image/png",
                 "content_bytes": b"fakepng",
             },
         ):

        mock_region = MagicMock(page_number=4, polygon=[2, 2, 8, 2, 8, 6, 2, 6])
        mock_figure = MagicMock(
            bounding_regions=[mock_region],
            caption=MagicMock(content="Figure 1"),
            footnotes=[],
            elements=[],
        )

        mock_analyze_result = MagicMock()
        mock_analyze_result.paragraphs = [MagicMock()]
        mock_analyze_result.tables = []
        mock_analyze_result.figures = [mock_figure]
        mock_di.run_document_intelligence.return_value = mock_analyze_result
        mock_di.add_metadata_to_document.return_value = "doc1"
        mock_chunker.run.return_value = {"chunks": [{"id": "c1", "content": "chunk1"}]}

        _, artifacts = extract_and_chunk_file(tmp_path, now_guid, doc_meta)

        figure_artifacts = [artifact for artifact in artifacts if artifact.get("type") == "figure"]
        assert len(figure_artifacts) == 1
        assert figure_artifacts[0]["_artifact_upload"]["mime_type"] == "image/png"
        assert figure_artifacts[0]["_artifact_upload"]["file_name"] == "doc_guid_p4_f1.png"


def test_extract_and_chunk_file_figure_upload_disabled_by_env(monkeypatch):
    monkeypatch.setenv("DOCUMENT_ARTIFACT_ENABLE_FIGURE_BINARY_UPLOAD", "false")

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
         patch("app.pipelines.document_search.indexing.chunker") as mock_chunker, \
         patch("app.pipelines.document_search.indexing._build_figure_upload_payload") as mock_build_upload:

        mock_region = MagicMock(page_number=4, polygon=[2, 2, 8, 2, 8, 6, 2, 6])
        mock_figure = MagicMock(
            bounding_regions=[mock_region],
            caption=MagicMock(content="Figure 1"),
            footnotes=[],
            elements=[],
        )

        mock_analyze_result = MagicMock()
        mock_analyze_result.paragraphs = [MagicMock()]
        mock_analyze_result.tables = []
        mock_analyze_result.figures = [mock_figure]
        mock_di.run_document_intelligence.return_value = mock_analyze_result
        mock_di.add_metadata_to_document.return_value = "doc1"
        mock_chunker.run.return_value = {"chunks": [{"id": "c1", "content": "chunk1"}]}

        _, artifacts = extract_and_chunk_file(tmp_path, now_guid, doc_meta)

        figure_artifacts = [artifact for artifact in artifacts if artifact.get("type") == "figure"]
        assert len(figure_artifacts) == 1
        assert "_artifact_upload" not in figure_artifacts[0]
        mock_build_upload.assert_not_called()
