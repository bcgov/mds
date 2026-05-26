import logging
import os
from contextlib import contextmanager
from typing import Dict, List

from app.celery import celery_app
from app.common.types.context import context
from app.pipelines.document_search.indexing import (
    delete_document_chunks,
    embed_chunks,
    extract_and_chunk_file,
    push_to_index,
)
from app.pipelines.document_search.document_search_pipeline import (
    now_document_search_search_client,
)
from app.pipelines.document_search.artifact_registration_client import (
    register_document_artifacts,
)
from app.pipelines.permit_condition_extraction.permit_condition_pipeline import (
    permit_condition_pipeline,
)

logger = logging.getLogger(__name__)


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
    # Phase boundaries (percent) — each phase is visible in the status endpoint.
    #   0 – 15  : deleting stale chunks from the previous index run
    #  15 – 30  : extraction via Azure Document Intelligence
    #  30 – 75  : embedding (batched Azure OpenAI calls)
    #  75 – 100 : pushing to Azure Search (batched uploads)
    total_files = len(tmp_paths)

    def _pct(phase_start: int, phase_end: int, done: int, total: int) -> int:
        if total == 0:
            return phase_end
        return phase_start + int((done / total) * (phase_end - phase_start))

    try:
        logger.info("Indexing task started for NoW application %s (%d files)", now_application_guid, total_files)

        all_chunks = []
        artifact_upload_totals = {
            'candidates': 0,
            'uploaded': 0,
            'skipped': 0,
            'failed': 0,
        }
        for idx, (tmp_path, doc_meta) in enumerate(zip(tmp_paths, doc_metadata_list)):
            doc_guid = doc_meta.get("document_manager_guid", "")

            self.update_state(state="PROGRESS", meta={
                "stage": "deleting",
                "percent": _pct(0, 15, idx, total_files),
                "files_processed": idx,
                "total_files": total_files,
            })
            if doc_guid and now_document_search_search_client:
                delete_document_chunks(now_document_search_search_client, doc_guid)

            self.update_state(state="PROGRESS", meta={
                "stage": "extracting",
                "percent": _pct(15, 30, idx, total_files),
                "files_processed": idx,
                "total_files": total_files,
            })
            chunks, artifacts = extract_and_chunk_file(tmp_path, now_application_guid, doc_meta)
            all_chunks.extend(chunks)

            if artifacts:
                registration_result = register_document_artifacts(
                    source_document_manager_guid=doc_meta.get('document_manager_guid'),
                    mine_guid=doc_meta.get('mine_guid'),
                    now_application_guid=now_application_guid,
                    now_application_document_xref_guid=doc_meta.get('now_application_document_xref_guid'),
                    artifacts=artifacts,
                    include_upload_stats=True,
                )
                if isinstance(registration_result, dict):
                    upload_stats = registration_result.get('upload_stats') or {}
                    for key in artifact_upload_totals:
                        artifact_upload_totals[key] += int(upload_stats.get(key, 0) or 0)

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

        if not all_chunks:
            logger.warning("No indexable content found for NoW application %s", now_application_guid)
            return {"succeeded": 0, "chunk_count": 0}

        total_chunks = len(all_chunks)
        logger.info("Embedding %d chunks for NoW application %s", total_chunks, now_application_guid)

        def on_embed_progress(done: int, total: int) -> None:
            self.update_state(state="PROGRESS", meta={
                "stage": "embedding",
                "percent": _pct(30, 75, done, total),
                "chunk_count": total,
                "chunks_embedded": done,
            })

        chunks_with_embeddings = embed_chunks(all_chunks, on_progress=on_embed_progress)

        logger.info("Pushing %d chunks to index for NoW application %s", total_chunks, now_application_guid)

        def on_push_progress(done: int, total: int) -> None:
            self.update_state(state="PROGRESS", meta={
                "stage": "pushing",
                "percent": _pct(75, 100, done, total),
                "chunk_count": total,
                "chunks_pushed": done,
            })

        succeeded = push_to_index(now_document_search_search_client, chunks_with_embeddings, on_progress=on_push_progress)

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
