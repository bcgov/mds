import json
from unittest.mock import MagicMock, patch

import pytest
from app.pipelines.permit_condition_search.models.search_models import (
    IndexingResponse,
    SearchParams,
)
from app.pipelines.permit_condition_search.resources.permit_condition_search_resource import (
    _process_documents,
    index_permit_conditions,
    search_permit_conditions_endpoint,
    stream_search_results,
)
from fastapi import HTTPException, UploadFile
from sse_starlette import ServerSentEvent


@pytest.fixture(autouse=True)
def mock_config():
    with patch("app.pipelines.permit_condition_search.permit_condition_search_pipeline.config") as mock_conf:
        # Set up mock config values
        mock_conf.storage.connection_string = "mock_connection_string"
        mock_conf.storage.container_name = "mock_container"
        mock_conf.search.endpoint = "mock_endpoint"
        mock_conf.search.api_key.resolve_value.return_value = "mock_api_key"
        mock_conf.openai.endpoint = "mock_openai_endpoint"
        mock_conf.openai.api_key = "mock_openai_key"
        yield mock_conf

class TestPermitConditionSearchResource:

    

    @pytest.mark.asyncio
    async def test_process_documents_with_facets(self):
        mock_document1 = MagicMock()
        mock_document1.id = "1"
        mock_document1.content = "Test content 1"
        mock_document1.meta = {"facets": {"category": ["mining", "environment"]}, "other_meta": "data1"}
        mock_document1.score = 0.9

        mock_document2 = MagicMock()
        mock_document2.id = "2"
        mock_document2.content = "Test content 2"
        mock_document2.meta = {"facets": {"category": ["mining", "environment"]}, "other_meta": "data2"}
        mock_document2.score = 0.8

        documents = [mock_document1, mock_document2]
        
        events = []
        async for event in _process_documents(documents):
            events.append(event)
        
        assert len(events) == 2  # documents event and ai_start event
        
        documents_event = events[0]
        assert documents_event.event == "documents"
        
        event_data = json.loads(documents_event.data)
        assert "documents" in event_data
        assert "facets" in event_data
        assert event_data["facets"] == {"category": ["mining", "environment"]}
        
        assert len(event_data["documents"]) == 2
        assert event_data["documents"][0]["id"] == "1"
        assert event_data["documents"][0]["content"] == "Test content 1"
        assert event_data["documents"][0]["meta"] == {"other_meta": "data1"}
        assert event_data["documents"][0]["score"] == 0.9
        
        assert event_data["documents"][1]["id"] == "2"
        assert event_data["documents"][1]["content"] == "Test content 2"
        assert event_data["documents"][1]["meta"] == {"other_meta": "data2"}
        assert event_data["documents"][1]["score"] == 0.8
        
        ai_start_event = events[1]
        assert ai_start_event.event == "ai_start"
        assert json.loads(ai_start_event.data) == {}

    @pytest.mark.asyncio
    async def test_process_documents_without_facets(self):
        mock_document = MagicMock()
        mock_document.id = "1"
        mock_document.content = "Test content"
        mock_document.meta = {"other_meta": "data"}
        mock_document.score = 0.95

        documents = [mock_document]
        
        events = []
        async for event in _process_documents(documents):
            events.append(event)
        
        assert len(events) == 2
        
        documents_event = events[0]
        assert documents_event.event == "documents"
        
        event_data = json.loads(documents_event.data)
        assert "documents" in event_data
        assert "facets" in event_data
        assert event_data["facets"] is None
        
        assert len(event_data["documents"]) == 1
        assert event_data["documents"][0]["id"] == "1"
        assert event_data["documents"][0]["content"] == "Test content"
        assert event_data["documents"][0]["meta"] == {"other_meta": "data"}
        assert event_data["documents"][0]["score"] == 0.95

    @pytest.mark.asyncio
    async def test_process_empty_documents(self):
        documents = []
        
        events = []
        async for event in _process_documents(documents):
            events.append(event)
        
        assert len(events) == 2
        
        documents_event = events[0]
        assert documents_event.event == "documents"
        
        event_data = json.loads(documents_event.data)
        assert "documents" in event_data
        assert "facets" in event_data
        assert event_data["facets"] is None
        assert event_data["documents"] == []

    @pytest.mark.asyncio
    @patch("app.pipelines.permit_condition_search.resources.permit_condition_search_resource.store_temporary")
    @patch("app.pipelines.permit_condition_search.resources.permit_condition_search_resource.permit_condition_search_indexing_pipeline")
    async def test_index_permit_conditions_success(self, mock_pipeline, mock_store_temp):
        mock_file = MagicMock(spec=UploadFile)
        mock_file.filename = "test.csv"
        mock_file.content_type = "text/csv"
        
        mock_temp_file = MagicMock()
        mock_store_temp.return_value = mock_temp_file
        
        pipeline_result = {
            "indexer_runner": {
                "status": "succeeded",
                "stats": {
                    "document_count": 100,
                    "success_count": 100,
                    "error_count": 0,
                }
            }
        }
        mock_pipeline.run.return_value = pipeline_result
        
        response = await index_permit_conditions(mock_file)
        
        assert isinstance(response, IndexingResponse)
        assert response.status == "succeeded"
        assert response.stats is not None
        assert response.stats.document_count == 100
        assert response.stats.success_count == 100
        assert response.stats.error_count == 0
        
        mock_store_temp.assert_called_once_with(mock_file, suffix=".csv")
        mock_pipeline.run.assert_called_once()
        mock_temp_file.close.assert_called_once()

    @pytest.mark.asyncio
    async def test_index_permit_conditions_invalid_file_type(self):
        mock_file = MagicMock(spec=UploadFile)
        mock_file.filename = "test.pdf"
        mock_file.content_type = "application/pdf"
        
        with pytest.raises(HTTPException) as exc_info:
            await index_permit_conditions(mock_file)
        
        assert exc_info.value.status_code == 400
        assert "Invalid file type" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    @patch("app.pipelines.permit_condition_search.resources.permit_condition_search_resource.store_temporary")
    @patch("app.pipelines.permit_condition_search.resources.permit_condition_search_resource.permit_condition_search_indexing_pipeline")
    async def test_index_permit_conditions_pipeline_error(self, mock_pipeline, mock_store_temp):
        mock_file = MagicMock(spec=UploadFile)
        mock_file.filename = "test.csv"
        mock_file.content_type = "text/csv"
        
        mock_temp_file = MagicMock()
        mock_store_temp.return_value = mock_temp_file
        
        mock_pipeline.run.side_effect = Exception("Pipeline error")
        
        with pytest.raises(HTTPException) as exc_info:
            await index_permit_conditions(mock_file)
        
        assert exc_info.value.status_code == 500
        assert "Error during indexing" in str(exc_info.value.detail)
        mock_temp_file.close.assert_called_once()

    @pytest.mark.asyncio
    @patch("app.pipelines.permit_condition_search.resources.permit_condition_search_resource.permit_condition_search_retrieval_pipeline")
    async def test_stream_search_results_success(self, mock_retrieval_pipeline):
        search_params = SearchParams(query="mining permit", filters={})
        
        mock_document = MagicMock()
        mock_document.id = "doc1"
        mock_document.content = "Sample content"
        mock_document.meta = {"key": "value"}
        mock_document.score = 0.95
        
        async def mock_generator(data, include_outputs_from):
            yield {"context_enricher": {"documents": [mock_document]}}
            yield {"llm": {"replies": ["This is a generated answer"]}}
        
        mock_retrieval_pipeline.run_async_generator.return_value = mock_generator({}, {})
        
        events = []
        async for event in stream_search_results(search_params):
            events.append(event)
        
        assert len(events) == 5  # status, documents, ai_start, prompt, ai_complete
        
        assert events[0].event == "status"
        status_data = json.loads(events[0].data)
        assert "message" in status_data
        
        assert events[1].event == "documents"
        doc_data = json.loads(events[1].data)
        assert "documents" in doc_data
        
        assert events[2].event == "ai_start"
        assert events[3].event == "prompt"
        prompt_data = json.loads(events[3].data)
        assert "answers" in prompt_data
        assert prompt_data["answers"][0] == "This is a generated answer"
        
        assert events[4].event == "ai_complete"
        ai_complete_data = json.loads(events[4].data)
        assert ai_complete_data == {}

    @pytest.mark.asyncio
    @patch("app.pipelines.permit_condition_search.resources.permit_condition_search_resource.permit_condition_search_retrieval_pipeline")
    async def test_stream_search_results_error(self, mock_retrieval_pipeline):
        search_params = SearchParams(query="mining permit", filters={})
        mock_retrieval_pipeline.run_async_generator.side_effect = Exception("Search failed")
        
        events = []
        async for event in stream_search_results(search_params):
            events.append(event)
        
        assert len(events) == 2  # status, error
        assert events[0].event == "status"
        assert events[1].event == "error"
        
        error_data = json.loads(events[1].data)
        assert "message" in error_data
        assert "Search failed" in error_data["message"]

    @pytest.mark.asyncio
    @patch("app.pipelines.permit_condition_search.resources.permit_condition_search_resource.permit_condition_search_retrieval_pipeline")
    @patch("app.pipelines.permit_condition_search.resources.permit_condition_search_resource.stream_search_results")
    async def test_search_permit_conditions_endpoint(self, mock_stream_search, mock_pipeline):
        search_params = SearchParams(query="mining permit", filters={})
        
        mock_event1 = ServerSentEvent(data='{"message": "Starting search..."}', event="status")
        mock_event2 = ServerSentEvent(data='{"documents": []}', event="documents")
        
        async def mock_stream():
            yield mock_event1
            yield mock_event2
        
        mock_stream_search.return_value = mock_stream()
        
        response = await search_permit_conditions_endpoint(search_params)
        
        assert response.status_code == 200
        assert response.media_type == "text/event-stream"
        
        headers = response.headers
        assert headers["Cache-Control"] == "no-cache, no-transform"
        assert headers["Connection"] == "keep-alive"
        assert headers["Content-Type"] == "text/event-stream"
        
        mock_stream_search.assert_called_once_with(search_params)