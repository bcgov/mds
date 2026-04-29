import json
import logging
import os
import tempfile
import uuid
from pathlib import Path
from typing import AsyncIterator, List

import redis as redis_lib

from app.celery import CACHE_REDIS_URL
from app.pipelines.document_search.document_search_pipeline import (
    now_document_search_retrieval_pipeline,
    now_document_search_search_client,
)
from app.pipelines.permit_condition_search.models.search_models import (
    IndexingResponse,
    IndexStats,
    SearchParams,
)
from app.pipelines.document_search.config import config
from azure.search.documents import SearchClient
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from haystack.dataclasses import ChatMessage
from openai import BadRequestError
from sse_starlette import ServerSentEvent
from sse_starlette.sse import EventSourceResponse

router = APIRouter()
logger = logging.getLogger(__name__)

FILE_UPLOAD_PATH = os.environ.get("FILE_UPLOAD_PATH", "/file-uploads")

# ---------------------------------------------------------------------------
# Redis — stores now_application_guid → Celery task_id so the status endpoint
# can report "running" / "success" / "failed" without polling Azure Search for
# every in-flight request.
# ---------------------------------------------------------------------------
_redis = redis_lib.Redis.from_url(CACHE_REDIS_URL, decode_responses=True)
_TASK_KEY_PREFIX = "now_doc_index:"
_TASK_KEY_TTL = 60 * 60 * 24 * 7  # 7 days


def _task_key(now_application_guid: str) -> str:
    return f"{_TASK_KEY_PREFIX}{now_application_guid}"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _validate_guid(value: str, label: str) -> None:
    try:
        uuid.UUID(value)
    except ValueError:
        raise HTTPException(400, f"{label} must be a valid UUID")


def _get_task_status(task_id: str) -> str:
    """Returns the Celery task state string for *task_id*."""
    from app.tasks.tasks import run_now_document_indexing
    result = run_now_document_indexing.app.AsyncResult(task_id)
    return result.state  # PENDING, STARTED, PROGRESS, SUCCESS, FAILURE, REVOKED


def _is_task_running(task_id: str) -> bool:
    state = _get_task_status(task_id)
    return state in ("PENDING", "STARTED", "PROGRESS", "RETRY")


# ---------------------------------------------------------------------------
# Indexing endpoint
# ---------------------------------------------------------------------------

@router.post("/document_search/{now_application_guid}/index")
async def index_now_application_documents(
    now_application_guid: str,
    files: List[UploadFile] = File(...),
    metadata: str = Form(...),
) -> IndexingResponse:
    """
    Enqueue an async indexing job for all documents belonging to a NoW application.

    Accepts one or more files (PDFs and other Document Intelligence-supported formats)
    alongside a JSON metadata array. Each metadata entry corresponds positionally to
    a file and must include:
        document_manager_guid, document_name, document_type,
        mine_guid, submitted_date (optional)

    Returns immediately with status="running". The actual work (Document Intelligence,
    embedding, Azure Search push) happens inside a Celery worker. Poll the status
    endpoint to track progress.

    Because chunk IDs are deterministic (sha256 of guid + document_manager_guid + index),
    re-indexing the same documents always overwrites the same records, avoiding duplicates.
    """
    _validate_guid(now_application_guid, "now_application_guid")
    if now_document_search_search_client is None:
        raise HTTPException(503, "Search client is not available in this environment")

    # Reject duplicate concurrent runs.
    existing_task_id = _redis.get(_task_key(now_application_guid))
    if existing_task_id and _is_task_running(existing_task_id):
        raise HTTPException(409, "Indexing already in progress for this application. Please wait for it to complete.")

    try:
        doc_metadata_list = json.loads(metadata)
    except json.JSONDecodeError:
        raise HTTPException(400, "metadata must be a valid JSON array")

    if len(files) != len(doc_metadata_list):
        raise HTTPException(
            400,
            f"files count ({len(files)}) must match metadata count ({len(doc_metadata_list)})",
        )

    # Write uploads to the shared fileuploads volume so the Celery worker can read them.
    tmp_paths: List[str] = []
    try:
        for file in files:
            tmp = tempfile.NamedTemporaryFile(
                dir=FILE_UPLOAD_PATH, delete=False, suffix=Path(file.filename or "doc").suffix
            )
            tmp_paths.append(tmp.name)
            contents = await file.read()
            with open(tmp.name, "wb") as f:
                f.write(contents)
    except Exception as e:
        # Clean up any files we managed to write before failing.
        for path in tmp_paths:
            try:
                os.unlink(path)
            except OSError:
                pass
        logger.error("Failed to write upload files for NoW application %s: %s", now_application_guid, e)
        raise HTTPException(500, f"Failed to store uploaded files: {e}")

    # Enqueue the Celery task and record its ID in Redis.
    from app.tasks.tasks import run_now_document_indexing
    task = run_now_document_indexing.delay(now_application_guid, tmp_paths, doc_metadata_list)
    _redis.setex(_task_key(now_application_guid), _TASK_KEY_TTL, task.id)

    logger.info(
        "Enqueued indexing task %s for NoW application %s (%d files)",
        task.id,
        now_application_guid,
        len(files),
    )

    return IndexingResponse(id=now_application_guid, status="running")


# ---------------------------------------------------------------------------
# Search endpoint
# ---------------------------------------------------------------------------

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
    _validate_guid(now_application_guid, "now_application_guid")
    if now_document_search_retrieval_pipeline is None:
        raise HTTPException(503, "Search pipeline is not available in this environment")
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

        # Always inject the now_application_guid filter — this is the isolation guarantee.
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

        # Merge any caller-supplied filters under an AND with the guid filter.
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
        message = err.get("error", {}).get("message", "Search failed. Please try again.")
        yield _format_event("error", {"message": message})

    except Exception as e:
        logger.exception("Error during NoW document search: %s", str(e))
        yield _format_event("error", {"message": "Search failed. Please try again."})


async def _process_documents(documents):
    doc_list = []
    facets = None

    if documents and "facets" in documents[0].meta:
        facets = documents[0].meta["facets"]
        for doc in documents:
            doc.meta.pop("facets")

    for doc in documents:
        doc_list.append({
            "id": doc.id,
            "content": doc.content,
            "meta": doc.meta,
            "score": doc.score,
        })

    yield _format_event("documents", {"documents": doc_list, "facets": facets})
    yield _format_event("ai_start", {})


async def _process_llm_output(replies: list[ChatMessage]):
    for reply in replies:
        yield _format_event("prompt", {"answers": [reply.text]})
    yield _format_event("ai_complete", {})


def _format_event(event_type: str, data) -> ServerSentEvent:
    return ServerSentEvent(json.dumps(data), event=event_type)


# ---------------------------------------------------------------------------
# Status endpoint
# ---------------------------------------------------------------------------

@router.get("/document_search/{now_application_guid}/index/status")
async def get_indexing_status(now_application_guid: str):
    """
    Returns the indexing status for a NoW application.

    Checks Redis for a Celery task ID first (written at enqueue time), then maps
    Celery task state to the canonical status vocabulary:
      running    — task is PENDING / STARTED / PROGRESS / RETRY
      success    — task succeeded; items_processed comes from the task result
      failed     — task raised an unhandled exception
      never_run  — no task found in Redis AND no documents in the index

    If no task ID is in Redis but documents exist in the index (e.g. after a server
    restart or a legacy index run), the status is inferred from the Azure Search count.
    """
    _validate_guid(now_application_guid, "now_application_guid")
    if now_document_search_search_client is None:
        raise HTTPException(503, "Search client is not available in this environment")

    task_id = _redis.get(_task_key(now_application_guid))

    if task_id:
        from app.tasks.tasks import run_now_document_indexing
        result = run_now_document_indexing.app.AsyncResult(task_id)
        state = result.state

        if state in ("PENDING", "STARTED", "PROGRESS", "RETRY"):
            meta = result.info or {}
            return {
                "status": "running",
                "items_processed": 0,
                "error_count": 0,
                "last_run_start": None,
                "last_run_end": None,
                "error_message": None,
                "stage": meta.get("stage"),
            }

        if state == "SUCCESS":
            task_result = result.result or {}
            return {
                "status": "success",
                "items_processed": task_result.get("succeeded", 0),
                "error_count": 0,
                "last_run_start": None,
                "last_run_end": None,
                "error_message": None,
            }

        if state == "FAILURE":
            return {
                "status": "failed",
                "items_processed": 0,
                "error_count": 1,
                "last_run_start": None,
                "last_run_end": None,
                "error_message": str(result.result),
            }

        # REVOKED or unknown — fall through to Azure Search count below.

    # No task in Redis (or task in an unknown terminal state) — derive status
    # from what's actually present in the index.
    try:
        results = now_document_search_search_client.search(
            search_text="*",
            filter=f"now_application_guid eq '{now_application_guid}'",
            select=["id"],
            include_total_count=True,
            top=0,
        )
        count = results.get_count() or 0
    except Exception as e:
        logger.error(
            "Failed to fetch index status for NoW application %s: %s", now_application_guid, e
        )
        raise HTTPException(502, "Could not retrieve status from Azure Search")

    if count == 0:
        return {
            "status": "never_run",
            "items_processed": 0,
            "error_count": 0,
            "last_run_start": None,
            "last_run_end": None,
            "error_message": None,
        }

    return {
        "status": "success",
        "items_processed": count,
        "error_count": 0,
        "last_run_start": None,
        "last_run_end": None,
        "error_message": None,
    }


def _merge_filters(base: dict, extra: dict | None) -> dict:
    """
    Combines the mandatory guid filter with any additional caller-supplied filters.
    Both are wrapped under a top-level AND so neither can be bypassed.
    """
    if not extra:
        return base

    return {
        "operator": "AND",
        "conditions": [base, extra],
    }
