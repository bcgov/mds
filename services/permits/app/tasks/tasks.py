import logging
import os
import time
from contextlib import contextmanager
from dataclasses import dataclass, field
from typing import Dict, List

import redis as redis_lib
from app.celery import CACHE_REDIS_URL, celery_app
from app.common.types.context import context
from app.pipelines.document_search.artifact_registration_client import (
    register_document_artifacts,
)
from app.pipelines.document_search.document_search_pipeline import (
    now_document_search_search_client,
)
from app.pipelines.document_search.indexing import (
    delete_document_chunks,
    embed_chunks,
    extract_and_chunk_file,
    push_to_index,
)
from app.pipelines.permit_condition_extraction.permit_condition_pipeline import (
    permit_condition_pipeline,
)
from celery.canvas import group

logger = logging.getLogger(__name__)

_redis = redis_lib.Redis.from_url(CACHE_REDIS_URL, decode_responses=True)
_TASK_SET_PREFIX = "now_doc_index_tasks:"
_TASK_KEY_TTL = 60 * 60 * 24 * 7  # 7 days


@dataclass
class _ParentIndexingState:
    total_files: int
    child_task_ids: List[str] = field(default_factory=list)
    completed_files: int = 0
    failed_documents: List[dict] = field(default_factory=list)
    total_succeeded: int = 0
    total_chunks: int = 0
    artifact_upload_totals: Dict[str, int] = field(
        default_factory=lambda: {
            "candidates": 0,
            "uploaded": 0,
            "skipped": 0,
            "failed": 0,
        }
    )


def _empty_parent_result() -> dict:
    return {
        "succeeded": 0,
        "chunk_count": 0,
        "artifact_uploads": {"candidates": 0, "uploaded": 0, "skipped": 0, "failed": 0},
        "failed_count": 0,
        "failed_documents": [],
        "child_task_ids": [],
    }


def _resolve_parent_max_concurrency() -> int:
    raw_concurrency = os.getenv("NOW_DOCUMENT_INDEXING_PARENT_MAX_CONCURRENCY", "3")
    try:
        return max(1, min(int(raw_concurrency), 4))
    except ValueError:
        return 3


def _register_child_task_id(now_application_guid: str, task_id: str) -> None:
    task_set_key = _task_set_key(now_application_guid)
    _redis.sadd(task_set_key, task_id)
    _redis.expire(task_set_key, _TASK_KEY_TTL)


def _dispatch_group_batch(
    now_application_guid: str,
    batch_items: list,
    undispatched_paths: set,
    running: Dict[str, dict],
    child_task_ids: List[str],
) -> int:
    signatures = [
        run_now_document_indexing.s(now_application_guid, [tmp_path], [doc_meta])
        for tmp_path, doc_meta in batch_items
    ]

    try:
        group_result = group(signatures).apply_async()
    except Exception:
        for tmp_path, _ in batch_items:
            try:
                os.unlink(tmp_path)
            except OSError:
                pass
        raise

    child_results = list(getattr(group_result, "results", []) or [])
    for child_result, (tmp_path, doc_meta) in zip(child_results, batch_items):
        doc_guid = doc_meta.get("document_manager_guid", "")
        undispatched_paths.discard(tmp_path)
        child_task_ids.append(child_result.id)
        running[child_result.id] = {
            "task": child_result,
            "doc_guid": doc_guid,
        }

        try:
            _register_child_task_id(now_application_guid, child_result.id)
        except Exception as exc:  # noqa: BLE001 - non-blocking redis update
            logger.warning(
                "Unable to register child task %s in Redis for NoW application %s: %s",
                child_result.id,
                now_application_guid,
                exc,
            )

    return len(batch_items)


def _reconcile_running_children(running: Dict[str, dict], state: _ParentIndexingState) -> int:
    terminal_task_ids = []
    running_progress = []

    for task_id, info in running.items():
        task_result = info["task"]
        task_state = task_result.state

        if task_state in {"SUCCESS", "FAILURE", "REVOKED"}:
            terminal_task_ids.append(task_id)
            state.completed_files += 1

            if task_state == "SUCCESS":
                payload = task_result.result or {}
                state.total_succeeded += int(payload.get("succeeded", 0) or 0)
                state.total_chunks += int(payload.get("chunk_count", 0) or 0)

                upload_stats = payload.get("artifact_uploads") or {}
                for key in state.artifact_upload_totals:
                    state.artifact_upload_totals[key] += int(upload_stats.get(key, 0) or 0)
            else:
                state.failed_documents.append(
                    {
                        "document_manager_guid": info.get("doc_guid"),
                        "task_id": task_id,
                        "state": task_state,
                        "error": str(task_result.result),
                    }
                )
        else:
            meta = task_result.info or {}
            running_progress.append(int(meta.get("percent", 0) or 0))

    for task_id in terminal_task_ids:
        running.pop(task_id, None)

    done_percent_sum = state.completed_files * 100
    running_percent_sum = sum(running_progress)
    return int((done_percent_sum + running_percent_sum) / state.total_files)


def _task_set_key(now_application_guid: str) -> str:
    return f"{_TASK_SET_PREFIX}{now_application_guid}"


def _enrich_artifact_chunks_with_uploaded_documents(chunks: List[dict], artifact_documents: List[dict]) -> None:
    artifact_documents_by_id: Dict[str, dict] = {
        (artifact_doc.get('artifact_id') or ''): artifact_doc
        for artifact_doc in (artifact_documents or [])
        if artifact_doc.get('artifact_id')
    }
    if not artifact_documents_by_id:
        return

    for chunk in chunks:
        artifact_id = chunk.get('artifact_id')
        if not artifact_id:
            continue

        artifact_doc = artifact_documents_by_id.get(artifact_id)
        if not artifact_doc:
            continue

        chunk['artifact_document_manager_guid'] = artifact_doc.get('document_manager_guid')
        chunk['artifact_object_store_path'] = artifact_doc.get('object_store_path')


def _phase_percent(phase_start: int, phase_end: int, done: int, total: int) -> int:
    if total == 0:
        return phase_end
    return phase_start + int((done / total) * (phase_end - phase_start))


def _update_task_progress(task, stage: str, percent: int, **meta) -> None:
    payload = {
        "stage": stage,
        "percent": percent,
    }
    payload.update(meta)
    task.update_state(state="PROGRESS", meta=payload)


def _accumulate_upload_totals(target: Dict[str, int], source: Dict[str, int]) -> None:
    for key in target:
        target[key] += int(source.get(key, 0) or 0)


def _register_artifacts_for_document(
    *,
    now_application_guid: str,
    doc_meta: dict,
    artifacts: List[dict],
    all_chunks: List[dict],
    artifact_upload_totals: Dict[str, int],
) -> None:
    if not artifacts:
        return

    registration_result = register_document_artifacts(
        source_document_manager_guid=doc_meta.get('document_manager_guid'),
        mine_guid=doc_meta.get('mine_guid'),
        now_application_guid=now_application_guid,
        now_application_document_xref_guid=doc_meta.get('now_application_document_xref_guid'),
        artifacts=artifacts,
        include_upload_stats=True,
    )
    if not isinstance(registration_result, dict):
        return

    upload_stats = registration_result.get('upload_stats') or {}
    _accumulate_upload_totals(artifact_upload_totals, upload_stats)

    _enrich_artifact_chunks_with_uploaded_documents(
        all_chunks,
        registration_result.get('artifact_documents') or [],
    )

    callback_payload = registration_result.get('callback') or {}
    if callback_payload.get('status') == 'partial':
        rejected = (callback_payload.get('counts') or {}).get('rejected', 0)
        logger.warning(
            "Artifact registration partial for document %s in NoW application %s (rejected=%s)",
            doc_meta.get('document_manager_guid'),
            now_application_guid,
            rejected,
        )


def _collect_document_chunks(
    *,
    task,
    now_application_guid: str,
    tmp_paths: list,
    doc_metadata_list: list,
) -> tuple[List[dict], Dict[str, int]]:
    total_files = len(tmp_paths)
    all_chunks: List[dict] = []
    artifact_upload_totals: Dict[str, int] = {
        'candidates': 0,
        'uploaded': 0,
        'skipped': 0,
        'failed': 0,
    }

    for idx, (tmp_path, doc_meta) in enumerate(zip(tmp_paths, doc_metadata_list)):
        doc_guid = doc_meta.get("document_manager_guid", "")

        _update_task_progress(
            task,
            "deleting",
            _phase_percent(0, 15, idx, total_files),
            files_processed=idx,
            total_files=total_files,
        )
        if doc_guid and now_document_search_search_client:
            delete_document_chunks(now_document_search_search_client, doc_guid)

        _update_task_progress(
            task,
            "extracting",
            _phase_percent(15, 30, idx, total_files),
            files_processed=idx,
            total_files=total_files,
        )
        chunks, artifacts = extract_and_chunk_file(tmp_path, now_application_guid, doc_meta)
        all_chunks.extend(chunks)

        _register_artifacts_for_document(
            now_application_guid=now_application_guid,
            doc_meta=doc_meta,
            artifacts=artifacts,
            all_chunks=all_chunks,
            artifact_upload_totals=artifact_upload_totals,
        )

    return all_chunks, artifact_upload_totals


def _embed_chunk_batch(*, task, all_chunks: List[dict]) -> List[dict]:
    def on_embed_progress(done: int, total: int) -> None:
        _update_task_progress(
            task,
            "embedding",
            _phase_percent(30, 75, done, total),
            chunk_count=total,
            chunks_embedded=done,
        )

    return embed_chunks(all_chunks, on_progress=on_embed_progress)


def _push_chunk_batch(*, task, chunks_with_embeddings: List[dict]) -> int:
    def on_push_progress(done: int, total: int) -> None:
        _update_task_progress(
            task,
            "pushing",
            _phase_percent(75, 100, done, total),
            chunk_count=total,
            chunks_pushed=done,
        )

    return push_to_index(now_document_search_search_client, chunks_with_embeddings, on_progress=on_push_progress)


@contextmanager
def task_context(task):
    # Creates a context that is bound to the given task so the task can be accessed
    # by each step of the pipeline (for example to update the task state / meta (e.g. for a progress indicator))
    # usage:
    # with task_context(self):
    #  ....
    # from app.pipelines.common.types.context import context
    # context.get().update_state(state="PROGRESS", meta={"stage": "pdf_to_text_converter"})

    t = context.set(task)

    try:
        yield
    finally:
        context.reset(t)


@celery_app.task(bind=True)
def run_now_document_indexing(self, now_application_guid: str, tmp_paths: list, doc_metadata_list: list):
    """
    Celery task: extract text, embed, and push all NoW application documents to Azure Search.

    *tmp_paths* is a list of absolute paths on the shared ``fileuploads`` volume.
    Each path corresponds positionally to an entry in *doc_metadata_list*.
    Temp files are always deleted in the finally block, whether the task succeeds or fails.
    """
    try:
        total_files = len(tmp_paths)
        logger.info("Indexing task started for NoW application %s (%d files)", now_application_guid, total_files)

        all_chunks, artifact_upload_totals = _collect_document_chunks(
            task=self,
            now_application_guid=now_application_guid,
            tmp_paths=tmp_paths,
            doc_metadata_list=doc_metadata_list,
        )

        if not all_chunks:
            logger.warning("No indexable content found for NoW application %s", now_application_guid)
            return {"succeeded": 0, "chunk_count": 0}

        total_chunks = len(all_chunks)
        logger.info("Embedding %d chunks for NoW application %s", total_chunks, now_application_guid)

        chunks_with_embeddings = _embed_chunk_batch(task=self, all_chunks=all_chunks)

        logger.info("Pushing %d chunks to index for NoW application %s", total_chunks, now_application_guid)

        succeeded = _push_chunk_batch(task=self, chunks_with_embeddings=chunks_with_embeddings)

        logger.info(
            "Indexed %d/%d chunks for NoW application %s (artifact uploads: candidates=%d uploaded=%d skipped=%d failed=%d)",
            succeeded,
            total_chunks,
            now_application_guid,
            artifact_upload_totals['candidates'],
            artifact_upload_totals['uploaded'],
            artifact_upload_totals['skipped'],
            artifact_upload_totals['failed'],
        )
        return {
            "succeeded": succeeded,
            "chunk_count": total_chunks,
            "artifact_uploads": artifact_upload_totals,
        }

    finally:
        for path in tmp_paths:
            try:
                os.unlink(path)
            except OSError:
                pass


@celery_app.task(bind=True)
def run_now_document_indexing_parent(self, now_application_guid: str, tmp_paths: list, doc_metadata_list: list):
    """
    Parent Celery task for NoW document indexing.

    Fans out one child indexing task per document and aggregates progress/results.
    Best-effort semantics: failures in one document do not stop remaining documents.
    """
    if len(tmp_paths) != len(doc_metadata_list):
        raise ValueError(
            f"tmp_paths count ({len(tmp_paths)}) must match doc_metadata_list count ({len(doc_metadata_list)})"
        )

    total_files = len(tmp_paths)
    if total_files == 0:
        return _empty_parent_result()

    max_concurrency = _resolve_parent_max_concurrency()

    work_items = list(zip(tmp_paths, doc_metadata_list))
    undispatched_paths = {path for path in tmp_paths}
    running: Dict[str, dict] = {}
    next_dispatch_index = 0
    state = _ParentIndexingState(total_files=total_files)

    logger.info(
        "Parent indexing task started for NoW application %s (%d files, max_concurrency=%d)",
        now_application_guid,
        total_files,
        max_concurrency,
    )

    try:
        while next_dispatch_index < total_files or running:
            while next_dispatch_index < total_files and len(running) < max_concurrency:
                available_slots = max_concurrency - len(running)
                batch_items = work_items[next_dispatch_index: next_dispatch_index + available_slots]
                if not batch_items:
                    break
                next_dispatch_index += _dispatch_group_batch(
                    now_application_guid=now_application_guid,
                    batch_items=batch_items,
                    undispatched_paths=undispatched_paths,
                    running=running,
                    child_task_ids=state.child_task_ids,
                )

            overall_percent = _reconcile_running_children(running=running, state=state)

            self.update_state(
                state="PROGRESS",
                meta={
                    "stage": "running_children",
                    "percent": min(overall_percent, 99) if (next_dispatch_index < total_files or running) else 100,
                    "total_files": total_files,
                    "files_completed": state.completed_files,
                    "files_running": len(running),
                    "failed_files": len(state.failed_documents),
                    "child_task_ids": state.child_task_ids,
                },
            )

            if next_dispatch_index < total_files or running:
                time.sleep(0.5)

        logger.info(
            "Parent indexing task completed for NoW application %s (files=%d completed=%d failed=%d chunks=%d)",
            now_application_guid,
            total_files,
            state.completed_files,
            len(state.failed_documents),
            state.total_chunks,
        )
        return {
            "succeeded": state.total_succeeded,
            "chunk_count": state.total_chunks,
            "artifact_uploads": state.artifact_upload_totals,
            "failed_count": len(state.failed_documents),
            "failed_documents": state.failed_documents,
            "child_task_ids": state.child_task_ids,
        }
    finally:
        for path in undispatched_paths:
            try:
                os.unlink(path)
            except OSError:
                pass


@celery_app.task(bind=True)
def run_permit_condition_pipeline(self, file_name: str, meta: dict):
    with task_context(self):
        pipeline = permit_condition_pipeline()

        self.update_state(
            state="PROGRESS", meta={"stage": "start", file_name: file_name, **meta}
        )

        result = pipeline.run(
            {
                "pdf_converter": {"file_path": file_name},
            }
        )["combine_metadata"]

        conditions = result["conditions"]

        return conditions.model_dump()
