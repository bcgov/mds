import logging
import os
from contextlib import contextmanager

from app.celery import celery_app
from app.common.types.context import context
from app.pipelines.document_search.indexing import (
    embed_chunks,
    extract_and_chunk_file,
    push_to_index,
)
from app.pipelines.document_search.document_search_pipeline import (
    now_document_search_search_client,
)
from app.pipelines.permit_condition_extraction.permit_condition_pipeline import (
    permit_condition_pipeline,
)

logger = logging.getLogger(__name__)


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
        self.update_state(state="PROGRESS", meta={"stage": "extracting", "now_application_guid": now_application_guid})
        logger.info("Indexing task started for NoW application %s (%d files)", now_application_guid, len(tmp_paths))

        all_chunks = []
        for tmp_path, doc_meta in zip(tmp_paths, doc_metadata_list):
            chunks = extract_and_chunk_file(tmp_path, now_application_guid, doc_meta)
            all_chunks.extend(chunks)

        if not all_chunks:
            logger.warning("No indexable content found for NoW application %s", now_application_guid)
            return {"succeeded": 0, "chunk_count": 0}

        logger.info("Embedding %d chunks for NoW application %s", len(all_chunks), now_application_guid)
        self.update_state(state="PROGRESS", meta={"stage": "embedding", "chunk_count": len(all_chunks)})
        chunks_with_embeddings = embed_chunks(all_chunks)

        logger.info("Pushing %d chunks to index for NoW application %s", len(all_chunks), now_application_guid)
        self.update_state(state="PROGRESS", meta={"stage": "pushing", "chunk_count": len(all_chunks)})
        succeeded = push_to_index(now_document_search_search_client, chunks_with_embeddings)

        logger.info("Indexed %d/%d chunks for NoW application %s", succeeded, len(all_chunks), now_application_guid)
        return {"succeeded": succeeded, "chunk_count": len(all_chunks)}

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
