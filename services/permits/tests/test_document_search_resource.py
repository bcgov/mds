import json
from unittest.mock import MagicMock, patch, AsyncMock
import pytest
import uuid

from fastapi import HTTPException, UploadFile
from app.pipelines.document_search.resources.document_search_resource import (
    index_now_application_documents,
    cancel_indexing,
    search_now_application_documents,
    get_indexing_status,
    _stream_search_results,
    _process_documents,
    _process_llm_output,
    _merge_filters
)
from app.pipelines.permit_condition_search.models.search_models import SearchParams
from haystack.dataclasses import ChatMessage

@pytest.fixture
def mock_redis():
    with patch("app.pipelines.document_search.resources.document_search_resource._redis") as mock_r:
        yield mock_r

@pytest.fixture
def valid_guid():
    return str(uuid.uuid4())

class TestDocumentSearchResource:
    
    def test_merge_filters(self):
        base = {"operator": "==", "field": "a", "value": "1"}
        # No extra
        assert _merge_filters(base, None) == base
        
        # Extra
        extra = {"operator": "==", "field": "b", "value": "2"}
        merged = _merge_filters(base, extra)
        assert merged["operator"] == "AND"
        assert len(merged["conditions"]) == 2

    @pytest.mark.asyncio
    @patch("app.pipelines.document_search.resources.document_search_resource.now_document_search_search_client")
    @patch("app.pipelines.document_search.resources.document_search_resource._is_task_running")
    @patch("app.pipelines.document_search.resources.document_search_resource.tempfile.NamedTemporaryFile")
    @patch("app.tasks.tasks.run_now_document_indexing.delay")
    async def test_index_now_application_documents_success(
        self, mock_delay, mock_temp, mock_is_running, mock_search_client, mock_redis, valid_guid
    ):
        mock_redis.get.return_value = None
        mock_is_running.return_value = False
        
        mock_file = MagicMock(spec=UploadFile)
        mock_file.filename = "test.pdf"
        mock_file.read = AsyncMock(return_value=b"content")
        
        mock_temp_instance = MagicMock()
        mock_temp_instance.name = "/tmp/test.pdf"
        mock_temp.return_value = mock_temp_instance
        
        mock_task = MagicMock()
        mock_task.id = "task-123"
        mock_delay.return_value = mock_task
        
        metadata = json.dumps([{"document_manager_guid": "123", "document_name": "test.pdf", "document_type": "doc", "mine_guid": "mine1"}])
        
        with patch("builtins.open", MagicMock()):
            response = await index_now_application_documents(valid_guid, [mock_file], metadata)
            
        assert response.status == "running"
        assert response.id == valid_guid
        mock_delay.assert_called_once()
        mock_redis.setex.assert_called_once()

    @pytest.mark.asyncio
    async def test_index_now_application_documents_invalid_guid(self):
        with pytest.raises(HTTPException) as exc:
            await index_now_application_documents("not-a-guid", [], "[]")
        assert exc.value.status_code == 400

    @pytest.mark.asyncio
    @patch("app.pipelines.document_search.resources.document_search_resource.now_document_search_search_client")
    async def test_index_now_application_documents_duplicate(self, mock_search_client, mock_redis, valid_guid):
        mock_redis.get.return_value = "task-123"
        with patch("app.pipelines.document_search.resources.document_search_resource._is_task_running", return_value=True):
            with pytest.raises(HTTPException) as exc:
                await index_now_application_documents(valid_guid, [], "[]")
            assert exc.value.status_code == 409

    @pytest.mark.asyncio
    @patch("app.tasks.tasks.run_now_document_indexing")
    async def test_cancel_indexing_success(self, mock_task, mock_redis, valid_guid):
        mock_redis.get.return_value = "task-123"
        mock_app = MagicMock()
        mock_task.app = mock_app
        
        res = await cancel_indexing(valid_guid)
        assert res["status"] == "cancelled"
        mock_app.control.revoke.assert_called_once_with("task-123", terminate=True)
        mock_redis.delete.assert_called_once()

    @pytest.mark.asyncio
    async def test_cancel_indexing_not_found(self, mock_redis, valid_guid):
        mock_redis.get.return_value = None
        with pytest.raises(HTTPException) as exc:
            await cancel_indexing(valid_guid)
        assert exc.value.status_code == 404

    @pytest.mark.asyncio
    @patch("app.pipelines.document_search.resources.document_search_resource.now_document_search_search_client")
    @patch("app.tasks.tasks.run_now_document_indexing")
    async def test_get_indexing_status_success(self, mock_task, mock_search_client, mock_redis, valid_guid):
        mock_redis.get.return_value = "task-123"
        mock_result = MagicMock()
        mock_result.state = "SUCCESS"
        mock_result.result = {"succeeded": 10}
        mock_task.app.AsyncResult.return_value = mock_result
        
        res = await get_indexing_status(valid_guid)
        assert res["status"] == "success"
        assert res["items_processed"] == 10

    @pytest.mark.asyncio
    @patch("app.pipelines.document_search.resources.document_search_resource.now_document_search_search_client")
    @patch("app.tasks.tasks.run_now_document_indexing")
    async def test_get_indexing_status_running(self, mock_task, mock_search_client, mock_redis, valid_guid):
        mock_redis.get.return_value = "task-123"
        mock_result = MagicMock()
        mock_result.state = "PROGRESS"
        mock_result.info = {"percent": 50, "stage": "embedding"}
        mock_task.app.AsyncResult.return_value = mock_result
        
        res = await get_indexing_status(valid_guid)
        assert res["status"] == "running"
        assert res["percent"] == 50
        assert res["stage"] == "embedding"

    @pytest.mark.asyncio
    @patch("app.pipelines.document_search.resources.document_search_resource.now_document_search_search_client")
    async def test_get_indexing_status_never_run(self, mock_search_client, mock_redis, valid_guid):
        mock_redis.get.return_value = None
        mock_search_results = MagicMock()
        mock_search_results.get_count.return_value = 0
        mock_search_client.search.return_value = mock_search_results
        
        res = await get_indexing_status(valid_guid)
        assert res["status"] == "never_run"

    @pytest.mark.asyncio
    @patch("app.pipelines.document_search.resources.document_search_resource.now_document_search_retrieval_pipeline")
    async def test_search_now_application_documents(self, mock_pipeline, valid_guid):
        params = SearchParams(query="test", filters=None)
        res = await search_now_application_documents(valid_guid, params)
        assert res.media_type == "text/event-stream"

    @pytest.mark.asyncio
    @patch("app.pipelines.document_search.resources.document_search_resource.now_document_search_retrieval_pipeline")
    async def test_stream_search_results(self, mock_pipeline, valid_guid):
        params = SearchParams(query="test", filters=None)
        
        mock_doc = MagicMock()
        mock_doc.id = "1"
        mock_doc.content = "test"
        mock_doc.meta = {"facets": {"f": "v"}}
        mock_doc.score = 1.0

        async def mock_generator(data, include_outputs_from):
            yield {"retriever": {"documents": [mock_doc]}}
            yield {"llm": {"replies": [ChatMessage.from_assistant("reply")]}}
            
        mock_pipeline.run_async_generator.return_value = mock_generator({}, {})
        
        events = []
        async for e in _stream_search_results(valid_guid, params):
            events.append(e)
            
        assert len(events) == 5
        assert events[0].event == "status"
        assert events[1].event == "documents"
        assert events[2].event == "ai_start"
        assert events[3].event == "prompt"
        assert events[4].event == "ai_complete"

    @pytest.mark.asyncio
    @patch("app.pipelines.document_search.resources.document_search_resource.now_document_search_retrieval_pipeline")
    async def test_stream_search_results_error(self, mock_pipeline, valid_guid):
        params = SearchParams(query="test", filters=None)
        mock_pipeline.run_async_generator.side_effect = Exception("failed")
        
        events = []
        async for e in _stream_search_results(valid_guid, params):
            events.append(e)
            
        assert len(events) == 2
        assert events[0].event == "status"
        assert events[1].event == "error"
