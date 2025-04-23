import json
import logging
from pathlib import Path
from typing import AsyncIterator

from app.helpers.temporary_file import store_temporary
from app.pipelines.permit_condition_search.models.search_models import (
    IndexingResponse,
    IndexStats,
    SearchParams,
)
from app.pipelines.permit_condition_search.permit_condition_search_pipeline import (
    permit_condition_search_indexing_pipeline,
    permit_condition_search_retrieval_pipeline,
)
from fastapi import APIRouter, File, HTTPException, UploadFile
from haystack.dataclasses import ChatMessage
from openai import BadRequestError
from sse_starlette import ServerSentEvent
from sse_starlette.sse import EventSourceResponse

router = APIRouter()

logger = logging.getLogger(__name__)


@router.post("/permit_conditions/search/index")
async def index_permit_conditions(file: UploadFile = File(...)) -> IndexingResponse:
    """
    Asynchronously indexes permit conditions for search from the given CSV file by uploading it to blob storage
    and running the Azure Search indexer.

    Args:
        file (UploadFile): The CSV file containing permit conditions to index.

    Returns:
        IndexingResponse: Status of the indexing job including statistics.

    Raises:
        HTTPException: If file type is invalid or processing fails.
    """
    if file.content_type != "text/csv":
        raise HTTPException(
            400, detail="Invalid file type. Only CSV files are supported."
        )

    tmp = store_temporary(file, suffix=".csv")

    try:
        pipeline = permit_condition_search_indexing_pipeline
        logger.info(f"Starting indexing pipeline for file {file.filename}")

        res = pipeline.run({"blob_uploader": {"file_path": Path(tmp.name)}})
        logger.debug(f"Pipeline response: {res}")

        return IndexingResponse(
            id="",
            status=res["indexer_runner"]["status"],
            stats=(
                IndexStats(**res["indexer_runner"]["stats"])
                if "stats" in res["indexer_runner"]
                else None
            ),
        )

    except Exception as e:
        logger.error(f"Error during indexing: {str(e)}", exc_info=True)
        raise HTTPException(500, f"Error during indexing: {str(e)}")

    finally:
        tmp.close()


@router.post("/permit_conditions/search")
async def search_permit_conditions_endpoint(params: SearchParams) -> EventSourceResponse:
    """Search permit conditions and stream results."""
    logger.info(f"Received search request: {params.query}")
    return EventSourceResponse(
        stream_search_results(params),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream",
            "X-Accel-Buffering": "no",
            "Transfer-Encoding": "chunked",
        },
    )


async def stream_search_results(params: SearchParams) -> AsyncIterator[ServerSentEvent]:
    """
    Stream search results as server-sent events.
    
    Args:
        params: Search parameters
        
    Yields:
        bytes: Formatted SSE events
    """
    try:
        # Start with a keep-alive and status message
        yield _format_event("status", {"message": "Starting search..."})
                
        inputs = {
            "text_embedder": {"text": params.query},
            "retriever": {"query": params.query, "filters": params.filters},
            "prompt_builder": {"question": params.query},
        }

        # 1. Stream results from Azure AI search as soon as they're available
        # 2. Proceed to stream LLM results. This usually takes longer.
        async for partial_output in permit_condition_search_retrieval_pipeline.run_async_generator(
            data=inputs,
            include_outputs_from={"context_enricher", "llm"} 
        ):
            if "context_enricher" in partial_output:
                async for event in _process_documents(partial_output["context_enricher"]["documents"]):
                    yield event

            if "llm" in partial_output:
                async for event in _process_llm_output(partial_output["llm"]["replies"]):
                    yield event
    except BadRequestError as e:
        logger.info(f"Error during search: {str(e)}")

        err = e.response.json() or {}
        message = err.get('error', {}).get('message', 'Search failed. Please try again.')
        yield _format_event("error", {"message": message})

    except Exception as e:
        logger.exception(f"Error during search: {str(e)}")
        yield _format_event("error", {"message": "Search failed. Please try again."})


async def _process_documents(documents):
    """Process document results and extract facets."""
    doc_list = []
    facets = None

    # Azure AI search returns facets as a property on each document. Put them in the top level object instead
    if documents and len(documents) > 0 and "facets" in documents[0].meta:
        facets = documents[0].meta["facets"]
        for doc in documents:
            doc.meta.pop("facets")

    for doc in documents:
        doc_list.append(
            {
                "id": doc.id,
                "content": doc.content,
                "meta": doc.meta,
                "score": doc.score,
            }
        )
    response_data = {"documents": doc_list, "facets": facets}
    yield _format_event("documents", response_data)
    yield _format_event("ai_start", {})


async def _process_llm_output(replies: list[ChatMessage]):
    """Process LLM replies."""
    print(replies)
    for reply in replies:
        yield _format_event("prompt", {"answers": [reply.text]})
    yield _format_event("ai_complete", {})


def _format_event(event_type: str, data) -> ServerSentEvent:
    event_text = json.dumps(data)

    return ServerSentEvent(event_text, event=event_type)
