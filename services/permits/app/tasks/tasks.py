import logging
import os
import tempfile
from contextlib import contextmanager
from typing import Dict, List

from app.celery import celery_app
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

logger = logging.getLogger(__name__)


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


def _run_now_document_indexing_task(task, now_application_guid: str, tmp_paths: list, doc_metadata_list: list):
    try:
        total_files = len(tmp_paths)
        logger.info("Indexing task started for NoW application %s (%d files)", now_application_guid, total_files)

        all_chunks, artifact_upload_totals = _collect_document_chunks(
            task=task,
            now_application_guid=now_application_guid,
            tmp_paths=tmp_paths,
            doc_metadata_list=doc_metadata_list,
        )

        if not all_chunks:
            logger.warning("No indexable content found for NoW application %s", now_application_guid)
            return {"succeeded": 0, "chunk_count": 0}

        total_chunks = len(all_chunks)
        logger.info("Embedding %d chunks for NoW application %s", total_chunks, now_application_guid)

        chunks_with_embeddings = _embed_chunk_batch(task=task, all_chunks=all_chunks)

        logger.info("Pushing %d chunks to index for NoW application %s", total_chunks, now_application_guid)

        succeeded = _push_chunk_batch(task=task, chunks_with_embeddings=chunks_with_embeddings)

        logger.info(
            (
                "Indexed %d/%d chunks for NoW application %s "
                "(artifact uploads: candidates=%d uploaded=%d skipped=%d failed=%d)"
            ),
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
def run_now_document_indexing(self, now_application_guid: str, tmp_paths: list, doc_metadata_list: list):
    """
    Celery task: extract text, embed, and push all NoW application documents to Azure Search.

    *tmp_paths* is a list of absolute paths on the shared ``fileuploads`` volume.
    Each path corresponds positionally to an entry in *doc_metadata_list*.
    Temp files are always deleted in the finally block, whether the task succeeds or fails.
    """
    return _run_now_document_indexing_task(self, now_application_guid, tmp_paths, doc_metadata_list)


@contextmanager
def task_context(task):
    t = context.set(task)

    try:
        yield
    finally:
        context.reset(t)


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
