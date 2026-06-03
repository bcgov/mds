import json
import logging
import os
import uuid
from pathlib import Path
from typing import AsyncIterator, List

import anyio
import redis as redis_lib
from app.celery import CACHE_REDIS_URL
from app.common.utils.logging import sanitize_log
from app.pipelines.document_search.config import config
from app.pipelines.document_search.document_search_pipeline import (
    now_document_search_retrieval_pipeline,
    now_document_search_search_client,
)
from app.pipelines.permit_condition_search.models.search_models import (
    IndexingResponse,
    IndexStats,
    SearchParams,
)
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
# Redis key scheme:
#   now_doc_index_parent:{now_guid}      — parent orchestration task_id for an application
#   now_doc_index:{now_guid}:{doc_guid}  — child task_id for a single document
#   now_doc_index_tasks:{now_guid}       — Redis set of child task_ids for an application
#
# The index endpoint enqueues one parent task per application batch; the parent
# fans out child tasks per document with bounded concurrency. The status/cancel
# endpoints use parent + child keys for aggregation and control.
# ---------------------------------------------------------------------------
_redis = redis_lib.Redis.from_url(CACHE_REDIS_URL, decode_responses=True)
_TASK_KEY_PREFIX = "now_doc_index:"
_TASK_SET_PREFIX = "now_doc_index_tasks:"
_PARENT_TASK_KEY_PREFIX = "now_doc_index_parent:"
_TASK_KEY_TTL = 60 * 60 * 24 * 7  # 7 days

_RUNNING_STATES = {"PENDING", "STARTED", "PROGRESS", "RETRY"}


def _task_key(now_application_guid: str, document_manager_guid: str) -> str:
    return f"{_TASK_KEY_PREFIX}{now_application_guid}:{document_manager_guid}"


def _task_set_key(now_application_guid: str) -> str:
    return f"{_TASK_SET_PREFIX}{now_application_guid}"


def _parent_task_key(now_application_guid: str) -> str:
    return f"{_PARENT_TASK_KEY_PREFIX}{now_application_guid}"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _validate_guid(value: str, label: str) -> None:
    try:
        uuid.UUID(value)
    except ValueError:
        raise HTTPException(400, f"{label} must be a valid UUID")


def _is_task_running(task_id: str) -> bool:
    from app.tasks.tasks import run_now_document_indexing_parent

    return run_now_document_indexing_parent.app.AsyncResult(task_id).state in _RUNNING_STATES


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
    Enqueue an async parent indexing task for a NoW application batch.

    The parent task fans out one child task per document and aggregates progress.
    This endpoint supports single-document requests as a subset of batch behavior.

    Accepts a files array and matching JSON metadata array containing:
        document_manager_guid, document_name, document_type,
        mine_guid, submitted_date (optional)

    Returns immediately with status="running". If the application already has an
    active parent indexing task, this endpoint returns 409.

    Because chunk IDs are deterministic (sha256 of guid + document_manager_guid + index),
    re-indexing the same document always overwrites the same records, avoiding duplicates.
    """
    _validate_guid(now_application_guid, "now_application_guid")
    if now_document_search_search_client is None:
        raise HTTPException(503, "Search client is not available in this environment")

    try:
        doc_metadata_list = json.loads(metadata)
    except json.JSONDecodeError:
        raise HTTPException(400, "metadata must be a valid JSON array")

    if len(files) != len(doc_metadata_list):
        raise HTTPException(
            400,
            f"files count ({len(files)}) must match metadata count ({len(doc_metadata_list)})",
        )

    # Reject concurrent parent runs for the same application.
    existing_parent_task_id = _redis.get(_parent_task_key(now_application_guid))
    if existing_parent_task_id and _is_task_running(existing_parent_task_id):
        raise HTTPException(409, f"Indexing already in progress for NoW application {now_application_guid}.")

    doc_guids = [meta.get("document_manager_guid", "") for meta in doc_metadata_list]
    for doc_guid in doc_guids:
        if not doc_guid:
            continue
        existing_task_id = _redis.get(_task_key(now_application_guid, doc_guid))
        if existing_task_id and _is_task_running(existing_task_id):
            raise HTTPException(409, f"Indexing already in progress for document {doc_guid}.")

    # Write uploads to the shared fileuploads volume so the Celery worker can read them.
    tmp_paths: List[str] = []
    try:
        for file in files:
            # Generate a unique path manually to avoid blocking tempfile and open calls.
            # We use uuid.uuid4() to guarantee uniqueness and avoid path injection
            # by ignoring user-provided filenames.
            tmp_path = os.path.join(FILE_UPLOAD_PATH, str(uuid.uuid4()))
            tmp_paths.append(tmp_path)

            async with await anyio.open_file(tmp_path, "wb") as f:
                while chunk := await file.read(1024 * 1024):
                    await f.write(chunk)
    except Exception as e:
        for path in tmp_paths:
            try:
                os.unlink(path)
            except OSError:
                pass
        logger.error("Failed to write upload files for NoW application %s: %s", sanitize_log(now_application_guid), e)
        raise HTTPException(500, f"Failed to store uploaded files: {e}")

    # Enqueue the parent Celery task; child task IDs are added to Redis by the parent.
    from app.tasks.tasks import run_now_document_indexing_parent

    task = run_now_document_indexing_parent.delay(now_application_guid, tmp_paths, doc_metadata_list)

    task_set_key = _task_set_key(now_application_guid)
    _redis.delete(task_set_key)
    _redis.setex(_parent_task_key(now_application_guid), _TASK_KEY_TTL, task.id)

    logger.info(
        "Enqueued parent indexing task %s for %d documents in NoW application %s",
        task.id,
        len(files),
        sanitize_log(now_application_guid),
    )

    return IndexingResponse(id=now_application_guid, status="running")


# ---------------------------------------------------------------------------
# Cancel indexing endpoint
# ---------------------------------------------------------------------------

@router.delete("/document_search/{now_application_guid}/index")
async def cancel_indexing(now_application_guid: str):
    """
    Revoke all active Celery indexing tasks for a NoW application.

    Sends SIGTERM to every worker process handling a document for this application
    and removes the task set from Redis. Safe to call even if tasks have already
    completed — returns 404 if no tasks are tracked for the application.
    """
    _validate_guid(now_application_guid, "now_application_guid")

    parent_task_id = _redis.get(_parent_task_key(now_application_guid))
    task_ids = set(_redis.smembers(_task_set_key(now_application_guid)))
    if parent_task_id:
        task_ids.add(parent_task_id)

    if not task_ids:
        raise HTTPException(404, "No active indexing tasks found for this application")

    from app.tasks.tasks import run_now_document_indexing_parent

    celery_app = run_now_document_indexing_parent.app

    # Identify document GUIDs associated with these tasks to clean up their chunks
    doc_keys = _redis.keys(f"{_TASK_KEY_PREFIX}{now_application_guid}:*")
    doc_guids_to_clean = []
    for key in doc_keys:
        tid = _redis.get(key)
        if tid in task_ids:
            # Key is "now_doc_index:{now_guid}:{doc_guid}"
            parts = key.split(":")
            if len(parts) >= 3:
                doc_guids_to_clean.append(parts[2])

    # Delete any partially-indexed chunks from Azure Search and clear the Redis document task mapping
    if doc_guids_to_clean and now_document_search_search_client:
        from app.pipelines.document_search.indexing import delete_document_chunks
        for doc_guid in doc_guids_to_clean:
            try:
                delete_document_chunks(now_document_search_search_client, doc_guid)
                _redis.delete(f"{_TASK_KEY_PREFIX}{now_application_guid}:{doc_guid}")
            except Exception as e:
                logger.error(
                    "Failed to delete chunks for document %s during cancellation of NoW application %s: %s",
                    doc_guid,
                    sanitize_log(now_application_guid),
                    e
                )

    for task_id in task_ids:
        celery_app.control.revoke(task_id, terminate=True)
        # terminate=True kills the worker before it can write a final state to the
        # backend, so write REVOKED explicitly so Flower reflects reality.
        try:
            celery_app.backend.store_result(task_id, result=None, state="REVOKED")
        except Exception as e:
            logger.warning("Could not update backend state to REVOKED for task %s: %s", task_id, e)

    _redis.delete(_task_set_key(now_application_guid))
    _redis.delete(_parent_task_key(now_application_guid))

    logger.info("Revoked %d indexing tasks for NoW application %s", len(task_ids), sanitize_log(now_application_guid))
    return {"status": "cancelled"}


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
    Returns the aggregated indexing status across all per-document Celery tasks
    for a NoW application.

    Status vocabulary:
      running    — at least one task is still PENDING / STARTED / PROGRESS / RETRY;
                   percent reflects how many documents have completed so far
      success    — all tasks succeeded; items_processed is total chunks indexed
      failed     — at least one task raised an unhandled exception
      never_run  — no tasks in Redis AND no documents in the index

    Falls back to the Azure Search document count when no task IDs are in Redis
    (e.g. after a server restart or the set TTL has expired).
    """
    _validate_guid(now_application_guid, "now_application_guid")
    if now_document_search_search_client is None:
        raise HTTPException(503, "Search client is not available in this environment")

    parent_task_id = _redis.get(_parent_task_key(now_application_guid))
    if parent_task_id:
        from app.tasks.tasks import run_now_document_indexing_parent

        celery_app = run_now_document_indexing_parent.app
        parent_result = celery_app.AsyncResult(parent_task_id)

        if parent_result.state in _RUNNING_STATES:
            meta = parent_result.info or {}
            return {
                "status": "running",
                "items_processed": int(meta.get("files_completed", 0) or 0),
                "error_count": int(meta.get("failed_files", 0) or 0),
                "last_run_start": None,
                "last_run_end": None,
                "error_message": None,
                "stage": meta.get("stage", "indexing"),
                "percent": int(meta.get("percent", 0) or 0),
            }

        if parent_result.state == "FAILURE":
            return {
                "status": "failed",
                "items_processed": 0,
                "error_count": 1,
                "last_run_start": None,
                "last_run_end": None,
                "error_message": str(parent_result.result),
            }

        if parent_result.state == "SUCCESS":
            result = parent_result.result or {}
            return {
                "status": "success",
                "items_processed": int(result.get("succeeded", 0) or 0),
                "error_count": int(result.get("failed_count", 0) or 0),
                "last_run_start": None,
                "last_run_end": None,
                "error_message": None,
            }

    task_ids = _redis.smembers(_task_set_key(now_application_guid))

    if task_ids:
        # Filter out stale/superseded task IDs (e.g. from previous runs) to avoid status poisoning.
        doc_keys = _redis.keys(f"{_TASK_KEY_PREFIX}{now_application_guid}:*")
        latest_task_ids = set()
        for key in doc_keys:
            tid = _redis.get(key)
            if tid:
                latest_task_ids.add(tid)

        stale_task_ids = task_ids - latest_task_ids
        if stale_task_ids:
            _redis.srem(_task_set_key(now_application_guid), *stale_task_ids)
            task_ids = task_ids - stale_task_ids

    if task_ids:
        from app.tasks.tasks import run_now_document_indexing
        celery_app = run_now_document_indexing.app
        task_results = [celery_app.AsyncResult(tid) for tid in task_ids]
        states = [r.state for r in task_results]
        total = len(states)

        if any(s in _RUNNING_STATES for s in states):
            # Weight each task's progress by its chunk count so that larger documents
            # contribute proportionally more to the overall percent. chunk_count is
            # available in task meta once extraction completes; before that we use 1
            # as a placeholder so the task still registers in the weighted average.
            weights_and_progress = []
            for r in task_results:
                if r.state == "SUCCESS":
                    chunk_count = max((r.result or {}).get("chunk_count", 1), 1)
                    weights_and_progress.append((chunk_count, 1.0))
                elif r.state in _RUNNING_STATES:
                    meta = r.info or {}
                    chunk_count = max(meta.get("chunk_count", 1), 1)
                    weights_and_progress.append((chunk_count, meta.get("percent", 0) / 100.0))
                else:
                    weights_and_progress.append((1, 0.0))

            total_weight = sum(w for w, _ in weights_and_progress)
            overall_percent = (
                int(sum(w * p for w, p in weights_and_progress) / total_weight * 100)
                if total_weight > 0 else 0
            )

            # Use the stage from the first running task if available
            current_stage = "indexing"
            running_results = [r for r in task_results if r.state in _RUNNING_STATES]
            if running_results:
                meta = running_results[0].info or {}
                current_stage = meta.get("stage", "indexing")

            return {
                "status": "running",
                "items_processed": sum(1 for s in states if s == "SUCCESS"),
                "error_count": 0,
                "last_run_start": None,
                "last_run_end": None,
                "error_message": None,
                "stage": current_stage,
                "percent": overall_percent,
            }

        # Only return 'failed' if all active tasks are finished and at least one failed.
        if any(s == "FAILURE" for s in states):
            failed_result = next(r for r in task_results if r.state == "FAILURE")
            return {
                "status": "failed",
                "items_processed": 0,
                "error_count": sum(1 for s in states if s == "FAILURE"),
                "last_run_start": None,
                "last_run_end": None,
                "error_message": str(failed_result.result),
            }

        if all(s == "SUCCESS" for s in states):
            total_succeeded = sum(
                (r.result or {}).get("succeeded", 0) for r in task_results
            )
            return {
                "status": "success",
                "items_processed": total_succeeded,
                "error_count": 0,
                "last_run_start": None,
                "last_run_end": None,
                "error_message": None,
            }

        # Mixed terminal states (some REVOKED, etc.) — fall through to Azure Search count.

    # No task set in Redis (or mixed terminal states) — derive status from what's
    # actually present in the index.
    try:
        search_results = now_document_search_search_client.search(
            search_text="*",
            filter=f"now_application_guid eq '{now_application_guid}'",
            select=["id"],
            include_total_count=True,
            top=0,
        )
        count = search_results.get_count() or 0
    except Exception as e:
        logger.error(
            "Failed to fetch index status for NoW application %s: %s", sanitize_log(now_application_guid), e
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
