from unittest.mock import MagicMock, patch

import pytest
from app.tasks.tasks import run_now_document_indexing


@pytest.fixture
def mock_search_client():
    with patch("app.tasks.tasks.now_document_search_search_client") as m:
        yield m

@pytest.fixture
def mock_indexing():
    with patch("app.tasks.tasks.delete_document_chunks") as m_del, \
         patch("app.tasks.tasks.extract_and_chunk_file") as m_ext, \
         patch("app.tasks.tasks.embed_chunks") as m_emb, \
         patch("app.tasks.tasks.push_to_index") as m_push:
        yield m_del, m_ext, m_emb, m_push

def test_run_now_document_indexing_success(mock_search_client, mock_indexing):
    mock_del, mock_ext, mock_emb, mock_push = mock_indexing
    
    # Setup mocks
    mock_ext.return_value = ([{"content": "chunk1"}], [])
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
            "artifact_uploads": {
                "candidates": 0,
                "uploaded": 0,
                "skipped": 0,
                "failed": 0,
            },
        }
        mock_del.assert_called_once()
        mock_ext.assert_called_once()
        mock_emb.assert_called_once()
        mock_push.assert_called_once()
        assert mock_update_state.called

def test_run_now_document_indexing_no_chunks(mock_search_client, mock_indexing):
    mock_del, mock_ext, mock_emb, mock_push = mock_indexing
    
    mock_ext.return_value = ([], [])
    
    with patch.object(run_now_document_indexing, "update_state"):
        result = run_now_document_indexing.run("now_guid", ["/tmp/f1"], [{"document_manager_guid": "d1"}])
        
        assert result == {"succeeded": 0, "chunk_count": 0}
        mock_push.assert_not_called()

def test_run_now_document_indexing_cleanup(mock_search_client, mock_indexing):
    mock_del, mock_ext, mock_emb, mock_push = mock_indexing
    mock_ext.return_value = ([], [])
    
    with patch.object(run_now_document_indexing, "update_state"):
        with patch("os.unlink") as mock_unlink:
            run_now_document_indexing.run("now_guid", ["/tmp/f1"], [{"document_manager_guid": "d1"}])
            mock_unlink.assert_called_once_with("/tmp/f1")

def test_run_now_document_indexing_error_cleanup(mock_search_client, mock_indexing):
    mock_del, mock_ext, mock_emb, mock_push = mock_indexing
    mock_ext.side_effect = Exception("error")
    
    with patch.object(run_now_document_indexing, "update_state"):
        with patch("os.unlink") as mock_unlink:
            with pytest.raises(Exception):
                run_now_document_indexing.run("now_guid", ["/tmp/f1"], [{"document_manager_guid": "d1"}])
            mock_unlink.assert_called_once_with("/tmp/f1")

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
