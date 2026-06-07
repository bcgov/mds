import pytest
from unittest.mock import MagicMock, patch
from app.tasks.tasks import run_now_document_indexing, run_now_document_indexing_from_manifest

@pytest.fixture
def mock_search_client():
    with patch("app.tasks.tasks.now_document_search_search_client") as m:
        yield m

@pytest.fixture
def mock_indexing():
    with patch("app.tasks.tasks.delete_document_chunks") as m_del, \
         patch("app.tasks.tasks.extract_and_chunk_file") as m_ext, \
         patch("app.tasks.tasks.register_document_artifacts") as m_register, \
         patch("app.tasks.tasks.embed_chunks") as m_emb, \
         patch("app.tasks.tasks.push_to_index") as m_push:
        yield m_del, m_ext, m_register, m_emb, m_push

def test_run_now_document_indexing_success(mock_search_client, mock_indexing):
    mock_del, mock_ext, mock_register, mock_emb, mock_push = mock_indexing
    
    # Setup mocks
    mock_ext.return_value = ([{"content": "chunk1"}], [{"type": "table", "artifact_id": "t-1"}])
    mock_register.return_value = {
        "callback": {"status": "ok"},
        "upload_stats": {"candidates": 1, "uploaded": 1, "skipped": 0, "failed": 0},
    }
    mock_emb.return_value = [{"content": "chunk1", "embedding": [0.1]}]
    mock_push.return_value = 1
    
    # Patch update_state on the task object itself
    with patch.object(run_now_document_indexing, "update_state") as mock_update_state:
        tmp_paths = ["/tmp/file1.pdf"]
        doc_meta_list = [{"document_manager_guid": "doc1"}]
        
        result = run_now_document_indexing.run("now_guid", tmp_paths, doc_meta_list)
        
        assert result == {
            "succeeded": 1,
            "chunk_count": 1,
            "artifact_uploads": {"candidates": 1, "uploaded": 1, "skipped": 0, "failed": 0},
        }
        mock_del.assert_called_once()
        mock_ext.assert_called_once()
        mock_register.assert_called_once()
        mock_emb.assert_called_once()
        mock_push.assert_called_once()
        assert mock_update_state.called


def test_run_now_document_indexing_aggregates_upload_stats(mock_search_client, mock_indexing):
    mock_del, mock_ext, mock_register, mock_emb, mock_push = mock_indexing

    mock_ext.side_effect = [
        ([{"content": "chunk1"}], [{"type": "table", "artifact_id": "t-1"}]),
        ([{"content": "chunk2"}], [{"type": "figure", "artifact_id": "f-1"}]),
    ]
    mock_register.side_effect = [
        {
            "callback": {"status": "ok"},
            "upload_stats": {"candidates": 1, "uploaded": 0, "skipped": 1, "failed": 0},
        },
        {
            "callback": {"status": "ok"},
            "upload_stats": {"candidates": 1, "uploaded": 1, "skipped": 0, "failed": 0},
        },
    ]
    mock_emb.return_value = [
        {"content": "chunk1", "embedding": [0.1]},
        {"content": "chunk2", "embedding": [0.2]},
    ]
    mock_push.return_value = 2

    with patch.object(run_now_document_indexing, "update_state"):
        result = run_now_document_indexing.run(
            "now_guid",
            ["/tmp/file1.pdf", "/tmp/file2.pdf"],
            [{"document_manager_guid": "doc1"}, {"document_manager_guid": "doc2"}],
        )

    assert result["artifact_uploads"] == {"candidates": 2, "uploaded": 1, "skipped": 1, "failed": 0}


def test_run_now_document_indexing_enriches_artifact_chunks_with_uploaded_document(mock_search_client, mock_indexing):
    mock_del, mock_ext, mock_register, mock_emb, mock_push = mock_indexing

    mock_ext.return_value = (
        [{"content": "chunk1", "artifact_id": "t-1", "artifact_type": "table"}],
        [{"type": "table", "artifact_id": "t-1"}],
    )
    mock_register.return_value = {
        "callback": {"status": "ok"},
        "upload_stats": {"candidates": 1, "uploaded": 1, "skipped": 0, "failed": 0},
        "artifact_documents": [
            {
                "artifact_id": "t-1",
                "document_manager_guid": "artifact-doc-guid",
                "object_store_path": "permits/now/object.png",
            }
        ],
    }
    mock_emb.return_value = [{"content": "chunk1", "embedding": [0.1]}]
    mock_push.return_value = 1

    with patch.object(run_now_document_indexing, "update_state"):
        run_now_document_indexing.run(
            "now_guid",
            ["/tmp/file1.pdf"],
            [{"document_manager_guid": "doc1", "mine_guid": "mine1"}],
        )

    emb_input_chunks = mock_emb.call_args.args[0]
    assert emb_input_chunks[0]["artifact_document_manager_guid"] == "artifact-doc-guid"
    assert emb_input_chunks[0]["artifact_object_store_path"] == "permits/now/object.png"


def test_run_now_document_indexing_logs_partial_callback_warning(mock_search_client, mock_indexing):
    mock_del, mock_ext, mock_register, mock_emb, mock_push = mock_indexing

    mock_ext.return_value = ([{"content": "chunk1"}], [{"type": "table", "artifact_id": "t-1"}])
    mock_register.return_value = {
        "callback": {"status": "partial", "counts": {"rejected": 1}},
        "upload_stats": {"candidates": 1, "uploaded": 0, "skipped": 1, "failed": 0},
    }
    mock_emb.return_value = [{"content": "chunk1", "embedding": [0.1]}]
    mock_push.return_value = 1

    with patch.object(run_now_document_indexing, "update_state"), \
         patch("app.tasks.tasks.logger.warning") as mock_logger_warning:
        run_now_document_indexing.run(
            "now_guid",
            ["/tmp/file1.pdf"],
            [{"document_manager_guid": "doc1"}],
        )

    assert any(
        "Artifact registration partial" in str(call.args[0])
        for call in mock_logger_warning.call_args_list
    )

def test_run_now_document_indexing_no_chunks(mock_search_client, mock_indexing):
    mock_del, mock_ext, mock_register, mock_emb, mock_push = mock_indexing
    
    mock_ext.return_value = ([], [])
    
    with patch.object(run_now_document_indexing, "update_state"):
        result = run_now_document_indexing.run("now_guid", ["/tmp/f1"], [{"document_manager_guid": "d1"}])
        
        assert result == {"succeeded": 0, "chunk_count": 0}
        mock_register.assert_not_called()
        mock_push.assert_not_called()

def test_run_now_document_indexing_cleanup(mock_search_client, mock_indexing):
    mock_del, mock_ext, mock_register, mock_emb, mock_push = mock_indexing

    mock_ext.return_value = ([], [])
    
    with patch.object(run_now_document_indexing, "update_state"):
        with patch("os.unlink") as mock_unlink:
            run_now_document_indexing.run("now_guid", ["/tmp/f1"], [{"document_manager_guid": "d1"}])
            mock_unlink.assert_called_once_with("/tmp/f1")

def test_run_now_document_indexing_error_cleanup(mock_search_client, mock_indexing):
    mock_del, mock_ext, mock_register, mock_emb, mock_push = mock_indexing
    mock_ext.side_effect = Exception("error")
    
    with patch.object(run_now_document_indexing, "update_state"):
        with patch("os.unlink") as mock_unlink:
            with pytest.raises(Exception):
                run_now_document_indexing.run("now_guid", ["/tmp/f1"], [{"document_manager_guid": "d1"}])
            mock_unlink.assert_called_once_with("/tmp/f1")


def test_run_now_document_indexing_from_manifest_downloads_then_indexes(mock_search_client, mock_indexing):
    mock_del, mock_ext, mock_register, mock_emb, mock_push = mock_indexing
    mock_ext.return_value = ([{"content": "chunk1"}], [])
    mock_emb.return_value = [{"content": "chunk1", "embedding": [0.1]}]
    mock_push.return_value = 1

    with patch("app.tasks.tasks._download_manifest_document", return_value="/tmp/downloaded.pdf") as mock_download, \
         patch.object(run_now_document_indexing_from_manifest, "update_state"):
        result = run_now_document_indexing_from_manifest.run(
            "now_guid",
            {"document_manager_guid": "doc1", "document_name": "file.pdf"},
        )

    mock_download.assert_called_once_with({"document_manager_guid": "doc1", "document_name": "file.pdf"})
    mock_ext.assert_called_once_with("/tmp/downloaded.pdf", "now_guid", {"document_manager_guid": "doc1", "document_name": "file.pdf"})
    assert result["succeeded"] == 1

def test_run_permit_condition_pipeline_success():
    from app.tasks.tasks import run_permit_condition_pipeline
    
    mock_pipeline_instance = MagicMock()
    mock_pipeline_instance.run.return_value = {
        "combine_metadata": {
            "conditions": MagicMock(model_dump=lambda: [{"id": 1}])
        }
    }
    
    with patch("app.tasks.tasks.permit_condition_pipeline", return_value=mock_pipeline_instance), \
         patch.object(run_permit_condition_pipeline, "update_state") as mock_update_state:
        
        result = run_permit_condition_pipeline.run("test.pdf", {"mine_guid": "123"})
        
        assert result == [{"id": 1}]
        assert mock_update_state.called
        mock_pipeline_instance.run.assert_called_once()
