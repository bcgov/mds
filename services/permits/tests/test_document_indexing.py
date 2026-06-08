from unittest.mock import MagicMock, patch

import app.pipelines.document_search.indexing as indexing
import fitz
import pytest
from app.pipelines.document_search.artifact_chunk_builder import (
    build_table_markdown,
    categorize_artifact,
)
from app.pipelines.document_search.artifact_extraction import (
    extract_figure_artifacts,
    extract_table_artifacts,
)
from app.pipelines.document_search.artifact_region_image import (
    build_region_upload_payload,
    extract_page_rotation_hints,
)
from app.pipelines.document_search.indexing import (
    delete_document_chunks,
    embed_chunks,
    extract_and_chunk_file,
    push_to_index,
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
        assert table_chunks[0]["artifact_category"] == "table"
        assert table_chunks[0]["artifact_bounding_box_left"] == 1.0
        assert table_chunks[0]["artifact_bounding_box_top"] == 1.0
        assert table_chunks[0]["artifact_bounding_box_right"] == 5.0
        assert table_chunks[0]["artifact_bounding_box_bottom"] == 4.0


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
             "app.pipelines.document_search.indexing.build_region_upload_payload",
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


def test_build_table_markdown_uses_library_rendering_for_special_characters():
    markdown = build_table_markdown(
        headers=["ColA", "Col|B"],
        row_payload=[{"ColA": "A|1", "Col|B": "Line 1\nLine 2"}],
    )

    assert markdown is not None
    assert "| ColA" in markdown
    assert "A\\|1" in markdown
    assert "Line 1" in markdown


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
         patch("app.pipelines.document_search.indexing.build_region_upload_payload", return_value=None):

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
         patch("app.pipelines.document_search.indexing.build_region_upload_payload") as mock_build_upload:

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
        assert "artifact_category" in figure_chunks[0]
        assert "Figure description: Open pit layout with haul road alignment" in figure_chunks[0]["content"]
        assert figure_chunks[0]["artifact_bounding_box_left"] == 2.0
        assert figure_chunks[0]["artifact_bounding_box_top"] == 2.0
        assert figure_chunks[0]["artifact_bounding_box_right"] == 8.0
        assert figure_chunks[0]["artifact_bounding_box_bottom"] == 6.0


def test_categorize_artifact_identifies_map_terms():
    category = categorize_artifact(
        artifact_type="figure",
        caption="Site map showing open pit and haul roads",
        description="Includes legend and north arrow",
        summary=None,
        footnotes=[],
    )

    assert category == "map"


def test_categorize_artifact_identifies_site_photo_terms():
    category = categorize_artifact(
        artifact_type="figure",
        caption="Ground-level site photo of disturbed area",
        description="Landscape with access road",
        summary=None,
        footnotes=[],
    )

    assert category == "site_photo"


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
             "app.pipelines.document_search.indexing.build_region_upload_payload",
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
         patch("app.pipelines.document_search.indexing.build_region_upload_payload") as mock_build_upload:

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


def test_extract_and_chunk_file_enriches_figure_caption_and_summary_when_enabled(monkeypatch):
    monkeypatch.setattr(
        "app.pipelines.document_search.indexing.config.multimodal_enrichment_enabled",
        True,
    )

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
             "app.pipelines.document_search.indexing.generate_figure_caption_and_summary",
             return_value={
                 "caption": "Generated pit overview",
                 "summary": "A concise generated summary for search results.",
             },
         ):

        mock_region = MagicMock(page_number=4, polygon=[2, 2, 8, 2, 8, 6, 2, 6])
        mock_figure_paragraph = MagicMock(content="Open pit layout with haul roads")
        mock_figure = MagicMock(
            bounding_regions=[mock_region],
            caption=None,
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

        figure_artifact = next(artifact for artifact in artifacts if artifact.get("type") == "figure")
        assert figure_artifact["content"]["caption"] == "Generated pit overview"
        assert figure_artifact["content"]["caption_source"] == "generated"
        assert figure_artifact["content"]["summary_source"] == "generated"

        figure_chunk = next(chunk for chunk in chunks if chunk.get("artifact_type") == "figure")
        assert figure_chunk["artifact_caption"] == "Generated pit overview"
        assert figure_chunk["artifact_summary"] == "A concise generated summary for search results."
        assert "Figure summary:" in figure_chunk["content"]


def test_extract_and_chunk_file_keeps_di_caption_when_enrichment_enabled(monkeypatch):
    monkeypatch.setattr(
        "app.pipelines.document_search.indexing.config.multimodal_enrichment_enabled",
        True,
    )

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
             "app.pipelines.document_search.indexing.generate_figure_caption_and_summary",
             return_value={"caption": "Generated caption", "summary": "Generated summary"},
         ):

        mock_region = MagicMock(page_number=4, polygon=[2, 2, 8, 2, 8, 6, 2, 6])
        mock_figure = MagicMock(
            bounding_regions=[mock_region],
            caption=MagicMock(content="DI caption"),
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

        figure_artifact = next(artifact for artifact in artifacts if artifact.get("type") == "figure")
        assert figure_artifact["content"]["caption"] == "DI caption"
        assert figure_artifact["content"]["caption_source"] == "di"
        assert figure_artifact["content"]["summary"] == "Generated summary"


def test_extract_and_chunk_file_enrichment_failure_is_non_blocking(monkeypatch):
    monkeypatch.setattr(
        "app.pipelines.document_search.indexing.config.multimodal_enrichment_enabled",
        True,
    )

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
             "app.pipelines.document_search.indexing.generate_figure_caption_and_summary",
             side_effect=Exception("llm failed"),
         ):

        mock_region = MagicMock(page_number=4, polygon=[2, 2, 8, 2, 8, 6, 2, 6])
        mock_figure = MagicMock(
            bounding_regions=[mock_region],
            caption=MagicMock(content="DI caption"),
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

        chunks, artifacts = extract_and_chunk_file(tmp_path, now_guid, doc_meta)

        assert len(chunks) == 2
        figure_artifact = next(artifact for artifact in artifacts if artifact.get("type") == "figure")
        assert figure_artifact["content"]["caption"] == "DI caption"
        assert figure_artifact["content"]["caption_source"] == "di"
        assert figure_artifact["content"].get("summary") is None


def test_extract_page_rotation_hints_from_di_pages():
    analyze_result = MagicMock()
    analyze_result.pages = [
        MagicMock(page_number=1, angle=89.8),
        MagicMock(page_number=2, angle=-91.1),
        MagicMock(page_number=3, angle=3.2),
        MagicMock(page_number=4, angle=None),
    ]

    hints = extract_page_rotation_hints(analyze_result)

    assert hints[1] == 90
    assert hints[2] == 270
    assert hints[3] == 0
    assert 4 not in hints


def test_build_region_upload_payload_prefers_di_angle_over_fallback():
    fake_page = MagicMock()
    fake_page.rect = fitz.Rect(0, 0, 720, 720)

    fake_pixmap = MagicMock()
    fake_pixmap.width = 2
    fake_pixmap.height = 1
    fake_pixmap.samples = bytes([255, 0, 0, 0, 255, 0])
    fake_pixmap.tobytes.return_value = b"rawpng"
    fake_page.get_pixmap.return_value = fake_pixmap

    fake_document = MagicMock()
    fake_document.page_count = 1
    fake_document.__enter__.return_value = fake_document
    fake_document.__exit__.return_value = None
    fake_document.__getitem__.return_value = fake_page

    mock_fallback = MagicMock()
    with patch("app.pipelines.document_search.artifact_region_image.fitz.open", return_value=fake_document):
        payload = build_region_upload_payload(
            source_pdf_path="/tmp/test.pdf",
            artifact_id="doc_guid_p1_t1",
            page_number=1,
            bounding_box={"left": 0.0, "top": 0.0, "right": 1.0, "bottom": 1.0},
            page_rotation_hints={1: 90},
            logger=MagicMock(),
            choose_rotation_degrees_from_text_fn=mock_fallback,
        )

    assert payload is not None
    assert payload["mime_type"] == "image/png"
    assert payload["content_bytes"]
    mock_fallback.assert_not_called()


def test_build_region_upload_payload_uses_fallback_when_di_hint_missing():
    fake_page = MagicMock()
    fake_page.rect = fitz.Rect(0, 0, 720, 720)

    fake_pixmap = MagicMock()
    fake_pixmap.width = 2
    fake_pixmap.height = 1
    fake_pixmap.samples = bytes([0, 0, 255, 255, 255, 255])
    fake_pixmap.tobytes.return_value = b"rawpng"
    fake_page.get_pixmap.return_value = fake_pixmap

    fake_document = MagicMock()
    fake_document.page_count = 1
    fake_document.__enter__.return_value = fake_document
    fake_document.__exit__.return_value = None
    fake_document.__getitem__.return_value = fake_page

    with patch("app.pipelines.document_search.artifact_region_image.fitz.open", return_value=fake_document):
        fallback = MagicMock(return_value=(270, "text_direction_vertical_up"))
        payload = build_region_upload_payload(
            source_pdf_path="/tmp/test.pdf",
            artifact_id="doc_guid_p1_f1",
            page_number=1,
            bounding_box={"left": 0.0, "top": 0.0, "right": 1.0, "bottom": 1.0},
            page_rotation_hints={},
            logger=MagicMock(),
            choose_rotation_degrees_from_text_fn=fallback,
        )

    assert payload is not None
    assert payload["mime_type"] == "image/png"
    assert payload["content_bytes"]
    fallback.assert_called_once()


def test_extract_table_artifacts_passes_page_rotation_hints_to_upload_builder():
    doc_meta = {"document_manager_guid": "doc_guid"}
    region = MagicMock(page_number=2, polygon=[1, 1, 5, 1, 5, 4, 1, 4])
    table = MagicMock(
        row_count=2,
        column_count=1,
        cells=[
            MagicMock(row_index=0, column_index=0, content="Header"),
            MagicMock(row_index=1, column_index=0, content="Value"),
        ],
        bounding_regions=[region],
        caption=None,
        footnotes=[],
    )
    analyze_result = MagicMock(tables=[table])

    mock_upload = MagicMock(return_value={"file_name": "x.png", "mime_type": "image/png", "content_bytes": b"x"})
    artifacts = extract_table_artifacts(
        analyze_result,
        doc_meta,
        source_pdf_path="/tmp/test.pdf",
        page_rotation_hints={2: 90},
        build_table_upload_payload_fn=mock_upload,
        extract_caption_fn=MagicMock(return_value=None),
        extract_footnotes_fn=MagicMock(return_value=[]),
    )

    assert len(artifacts) == 1
    assert artifacts[0]["_artifact_upload"]["file_name"] == "x.png"
    assert mock_upload.call_args.kwargs["page_rotation_hints"] == {2: 90}


def test_extract_figure_artifacts_passes_page_rotation_hints_to_upload_builder():
    doc_meta = {"document_manager_guid": "doc_guid"}
    region = MagicMock(page_number=4, polygon=[1, 1, 5, 1, 5, 4, 1, 4])
    figure = MagicMock(
        bounding_regions=[region],
        caption=MagicMock(content="Figure 1"),
        footnotes=[],
        elements=[],
    )
    analyze_result = MagicMock(figures=[figure], paragraphs=[])

    mock_upload = MagicMock(return_value={"file_name": "x.png", "mime_type": "image/png", "content_bytes": b"x"})
    artifacts = extract_figure_artifacts(
        analyze_result,
        doc_meta,
        source_pdf_path="/tmp/test.pdf",
        page_rotation_hints={4: 270},
        build_figure_upload_payload_fn=mock_upload,
        extract_caption_fn=MagicMock(return_value="Figure 1"),
        extract_footnotes_fn=MagicMock(return_value=[]),
    )

    assert len(artifacts) == 1
    assert artifacts[0]["_artifact_upload"]["file_name"] == "x.png"
    assert mock_upload.call_args.kwargs["page_rotation_hints"] == {4: 270}
