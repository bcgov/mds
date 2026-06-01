import json
import uuid
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from app.pipelines.document_search.resources.document_search_resource import (
    _merge_filters,
    _process_documents,
    _process_llm_output,
    _stream_search_results,
    cancel_indexing,
    get_indexing_status,
    index_now_application_documents,
    search_now_application_documents,
)
from app.pipelines.permit_condition_search.models.search_models import SearchParams
from fastapi import HTTPException, UploadFile
from haystack.dataclasses import ChatMessage
from openai import BadRequestError


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
    @patch("app.pipelines.document_search.resources.document_search_resource.anyio.open_file", new_callable=AsyncMock)
    @patch("app.tasks.tasks.run_now_document_indexing.delay")
    async def test_index_now_application_documents_success(
        self, mock_delay, mock_anyio_open, mock_is_running, mock_search_client, mock_redis, valid_guid
    ):
        mock_redis.get.return_value = None
        mock_is_running.return_value = False

        mock_file = MagicMock(spec=UploadFile)
        mock_file.filename = "test.pdf"
        # Mock read(size) to return content then None to end the loop
        mock_file.read = AsyncMock(side_effect=[b"content", b""])

        mock_f = AsyncMock()
        # anyio.open_file is an AsyncMock, its return value (the context manager) 
        # must also have an AsyncMock for __aenter__
        mock_anyio_open.return_value.__aenter__.return_value = mock_f

        mock_task = MagicMock()
        mock_task.id = "task-123"
        mock_delay.return_value = mock_task

        metadata = json.dumps([{"document_manager_guid": "123", "document_name": "test.pdf", "document_type": "doc", "mine_guid": "mine1"}])

        response = await index_now_application_documents(valid_guid, [mock_file], metadata)

        assert response.status == "running"
        assert response.id == valid_guid
        mock_delay.assert_called_once()
        mock_redis.setex.assert_called_once()
        mock_anyio_open.assert_called_once()
        assert mock_f.write.called

    @pytest.mark.asyncio
    async def test_index_now_application_documents_invalid_guid(self):
        with pytest.raises(HTTPException) as exc:
            await index_now_application_documents("not-a-guid", [], "[]")
        assert exc.value.status_code == 400

    @pytest.mark.asyncio
    @patch("app.pipelines.document_search.resources.document_search_resource.now_document_search_search_client")
    async def test_index_now_application_documents_duplicate(self, mock_search_client, mock_redis, valid_guid):
        mock_redis.get.return_value = "task-123"
        metadata = json.dumps([{"document_manager_guid": "doc-123"}])
        with patch("app.pipelines.document_search.resources.document_search_resource._is_task_running", return_value=True):
            with pytest.raises(HTTPException) as exc:
                await index_now_application_documents(valid_guid, [MagicMock(spec=UploadFile)], metadata)
            assert exc.value.status_code == 409

    @pytest.mark.asyncio
    @patch("app.pipelines.document_search.resources.document_search_resource.now_document_search_search_client")
    @patch("app.pipelines.document_search.indexing.delete_document_chunks")
    @patch("app.tasks.tasks.run_now_document_indexing")
    async def test_cancel_indexing_success(self, mock_task, mock_delete_chunks, mock_search_client, mock_redis, valid_guid):
        mock_redis.smembers.return_value = {"task-123"}
        mock_redis.keys.return_value = [f"now_doc_index:{valid_guid}:doc-123"]
        mock_redis.get.return_value = "task-123"
        mock_app = MagicMock()
        mock_task.app = mock_app
        
        res = await cancel_indexing(valid_guid)
        assert res["status"] == "cancelled"
        mock_app.control.revoke.assert_called_once_with("task-123", terminate=True)
        mock_delete_chunks.assert_called_once_with(mock_search_client, "doc-123")
        mock_redis.delete.assert_any_call(f"now_doc_index:{valid_guid}:doc-123")
        mock_redis.delete.assert_any_call(f"now_doc_index_tasks:{valid_guid}")

    @pytest.mark.asyncio
    async def test_cancel_indexing_not_found(self, mock_redis, valid_guid):
        mock_redis.smembers.return_value = set()
        with pytest.raises(HTTPException) as exc:
            await cancel_indexing(valid_guid)
        assert exc.value.status_code == 404

    @pytest.mark.asyncio
    @patch("app.pipelines.document_search.resources.document_search_resource.now_document_search_search_client")
    @patch("app.tasks.tasks.run_now_document_indexing")
    async def test_get_indexing_status_success(self, mock_task, mock_search_client, mock_redis, valid_guid):
        mock_redis.smembers.return_value = {"task-123"}
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
        mock_redis.smembers.return_value = {"task-123"}
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
        mock_redis.smembers.return_value = set()
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
    @patch("app.pipelines.document_search.resources.document_search_resource.now_document_search_search_client")
    @patch("app.pipelines.document_search.resources.document_search_resource._is_task_running")
    @patch("app.pipelines.document_search.resources.document_search_resource.anyio.open_file", new_callable=AsyncMock)
    async def test_index_now_application_documents_write_error(
        self, mock_anyio_open, mock_is_running, mock_search_client, mock_redis, valid_guid
    ):
        mock_redis.get.return_value = None
        mock_is_running.return_value = False

        mock_file = MagicMock(spec=UploadFile)
        mock_file.filename = "test.pdf"
        mock_file.read = AsyncMock(return_value=b"content")

        mock_anyio_open.side_effect = Exception("Disk full")

        metadata = json.dumps([{"document_manager_guid": "123"}])

        with patch("os.unlink") as mock_unlink:
            with pytest.raises(HTTPException) as exc:
                await index_now_application_documents(valid_guid, [mock_file], metadata)
            assert exc.value.status_code == 500
            assert "Disk full" in str(exc.value.detail)

    @pytest.mark.asyncio
    @patch("app.pipelines.document_search.resources.document_search_resource.now_document_search_search_client")
    @patch("app.tasks.tasks.run_now_document_indexing")
    async def test_get_indexing_status_failed(self, mock_task, mock_search_client, mock_redis, valid_guid):
        mock_redis.smembers.return_value = {"task-123"}
        mock_result = MagicMock()
        mock_result.state = "FAILURE"
        mock_result.result = Exception("indexing failed")
        mock_task.app.AsyncResult.return_value = mock_result
        
        res = await get_indexing_status(valid_guid)
        assert res["status"] == "failed"
        assert res["error_message"] == "indexing failed"

    def test_is_task_running(self, mock_redis):
        from app.pipelines.document_search.resources.document_search_resource import (
            _is_task_running,
        )
        from app.tasks.tasks import run_now_document_indexing
        
        with patch("app.tasks.tasks.run_now_document_indexing.app.AsyncResult") as mock_async_result:
            mock_res = MagicMock()
            mock_res.state = "PROGRESS"
            mock_async_result.return_value = mock_res
            
            assert _is_task_running("task-1") is True
            
            mock_res.state = "SUCCESS"
            assert _is_task_running("task-1") is False

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

    @pytest.mark.asyncio
    @patch("app.pipelines.document_search.resources.document_search_resource.now_document_search_retrieval_pipeline")
    async def test_stream_search_results_bad_request(self, mock_pipeline, valid_guid):
        params = SearchParams(query="test", filters=None)
        
        mock_response = MagicMock()
        mock_response.json.return_value = {"error": {"message": "Invalid API key"}}
        mock_pipeline.run_async_generator.side_effect = BadRequestError(
            message="bad", response=mock_response, body=None
        )
        
        events = []
        async for e in _stream_search_results(valid_guid, params):
            events.append(e)
            
        assert len(events) == 2
        assert events[1].event == "error"
        assert "Invalid API key" in events[1].data

    @pytest.mark.asyncio
    async def test_process_documents_preserves_artifact_document_manager_guid(self):
        doc = MagicMock()
        doc.id = "doc-1"
        doc.content = "figure content"
        doc.meta = {
            "artifact_type": "figure",
            "artifact_document_manager_guid": "artifact-guid-123",
            "artifact_bounding_box_left": 1.1,
            "artifact_bounding_box_top": 2.2,
            "artifact_bounding_box_right": 3.3,
            "artifact_bounding_box_bottom": 4.4,
        }
        doc.score = 0.9

        events = []
        async for event in _process_documents([doc]):
            events.append(event)

        assert len(events) == 2
        payload = json.loads(events[0].data)
        assert (
            payload["documents"][0]["meta"]["artifact_document_manager_guid"]
            == "artifact-guid-123"
        )
        assert payload["documents"][0]["meta"]["artifact_bounding_box_left"] == 1.1
        assert payload["documents"][0]["meta"]["artifact_bounding_box_top"] == 2.2
        assert payload["documents"][0]["meta"]["artifact_bounding_box_right"] == 3.3
        assert payload["documents"][0]["meta"]["artifact_bounding_box_bottom"] == 4.4
        assert "artifact_presigned_url" not in payload["documents"][0]["meta"]

    @pytest.mark.asyncio
    async def test_index_now_application_documents_no_client(self, valid_guid):
        with patch("app.pipelines.document_search.resources.document_search_resource.now_document_search_search_client", None):
            with pytest.raises(HTTPException) as exc:
                await index_now_application_documents(valid_guid, [], "[]")
            assert exc.value.status_code == 503

    @pytest.mark.asyncio
    @patch("app.pipelines.document_search.resources.document_search_resource.now_document_search_search_client")
    async def test_index_now_application_documents_invalid_json(self, mock_client, valid_guid):
        with pytest.raises(HTTPException) as exc:
            await index_now_application_documents(valid_guid, [MagicMock()], "invalid-json")
        assert exc.value.status_code == 400

    @pytest.mark.asyncio
    @patch("app.pipelines.document_search.resources.document_search_resource.now_document_search_search_client")
    async def test_index_now_application_documents_count_mismatch(self, mock_client, valid_guid):
        with pytest.raises(HTTPException) as exc:
            await index_now_application_documents(valid_guid, [MagicMock()], "[]")
        assert exc.value.status_code == 400

    @pytest.mark.asyncio
    @patch("app.pipelines.document_search.resources.document_search_resource.now_document_search_search_client")
    @patch("app.pipelines.document_search.indexing.delete_document_chunks")
    @patch("app.tasks.tasks.run_now_document_indexing")
    async def test_cancel_indexing_backend_error(self, mock_task, mock_delete_chunks, mock_search_client, mock_redis, valid_guid):
        mock_redis.smembers.return_value = {"task-123"}
        mock_redis.keys.return_value = [f"now_doc_index:{valid_guid}:doc-123"]
        mock_redis.get.return_value = "task-123"
        mock_app = MagicMock()
        mock_app.backend.store_result.side_effect = Exception("Backend down")
        mock_task.app = mock_app
        
        res = await cancel_indexing(valid_guid)
        assert res["status"] == "cancelled"

    @pytest.mark.asyncio
    async def test_get_indexing_status_no_client(self, valid_guid):
        with patch("app.pipelines.document_search.resources.document_search_resource.now_document_search_search_client", None):
            with pytest.raises(HTTPException) as exc:
                await get_indexing_status(valid_guid)
            assert exc.value.status_code == 503
