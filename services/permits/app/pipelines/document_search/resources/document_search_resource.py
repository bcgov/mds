import json
import logging
from typing import AsyncIterator

from app.pipelines.document_search.document_search_pipeline import (
    now_document_search_retrieval_pipeline,
)
from app.pipelines.permit_condition_search.models.search_models import SearchParams
from fastapi import APIRouter, HTTPException
from openai import BadRequestError
from sse_starlette import ServerSentEvent
from sse_starlette.sse import EventSourceResponse

router = APIRouter()
logger = logging.getLogger(__name__)


def _format_event(event: str, data: dict) -> ServerSentEvent:
    return ServerSentEvent(event=event, data=json.dumps(data))


@router.post("/document_search/{now_application_guid}/search")
async def search_now_application_documents(
    now_application_guid: str, params: SearchParams
) -> EventSourceResponse:
    """
    Search documents within a specific NoW application and stream results via SSE.

    The now_application_guid from the URL path is injected as a mandatory AND filter
    before the query reaches Azure Search. Any additional filters in the request body
    are merged on top. This guarantees that results are scoped exclusively to the
    requested application — documents from other applications can never appear.
    """
    if now_document_search_retrieval_pipeline is None:
        raise HTTPException(503, "Search client is not available in this environment")
    return EventSourceResponse(
        _stream_search_results(now_application_guid, params),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream",
            "X-Accel-Buffering": "no",
            "Transfer-Encoding": "chunked",
        },
    )


async def _stream_search_results(
    now_application_guid: str, params: SearchParams
) -> AsyncIterator[ServerSentEvent]:
    try:
        yield _format_event("status", {"message": "Starting search..."})

        guid_filter = {
            "operator": "AND",
            "conditions": [
                {
                    "field": "now_application_guid",
                    "operator": "==",
                    "value": now_application_guid,
                }
            ],
        }

        combined_filters = _merge_filters(guid_filter, params.filters)

        inputs = {
            "text_embedder": {"text": params.query},
            "retriever": {"query": params.query, "filters": combined_filters},
            "prompt_builder": {"question": params.query},
        }

        async for partial_output in now_document_search_retrieval_pipeline.run_async_generator(
            data=inputs,
            include_outputs_from={"retriever", "llm"},
        ):
            if "retriever" in partial_output:
                async for event in _process_documents(partial_output["retriever"]["documents"]):
                    yield event

            if "llm" in partial_output:
                async for event in _process_llm_output(partial_output["llm"]["replies"]):
                    yield event

    except BadRequestError as e:
        err = e.response.json() or {}
        message = err.get("error", {}).get("message", str(e))
        yield _format_event("error", {"error": message})
    except Exception as e:
        logger.exception("Search failed for NoW application %s", now_application_guid)
        yield _format_event("error", {"error": str(e)})


async def _process_documents(documents) -> AsyncIterator[ServerSentEvent]:
    payload = {
        "documents": [
            {
                "id": doc.id,
                "content": doc.content,
                "meta": doc.meta,
                "score": doc.score,
            }
            for doc in documents
        ]
    }
    yield _format_event("documents", payload)


async def _process_llm_output(replies) -> AsyncIterator[ServerSentEvent]:
    for reply in replies:
        yield _format_event("ai_complete", {"reply": reply.content})


def _merge_filters(base_filter: dict, additional_filter: dict | None) -> dict:
    if not additional_filter:
        return base_filter
    return {
        "operator": "AND",
        "conditions": [base_filter, additional_filter],
    }
