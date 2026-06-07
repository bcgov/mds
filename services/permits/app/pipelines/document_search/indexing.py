"""
Shared indexing components and helpers for NoW application document indexing.

This module acts as a stable facade for the indexing pipeline and keeps the
existing imports/patch points used by tasks and tests. Heavy logic is split into
focused modules so each indexing stage is easier to reason about and evolve.
"""

import logging
from functools import partial
from typing import List

from app.pipelines.document_search.artifact_chunk_builder import (
    build_artifact_search_chunks,
    categorize_artifact,
)
from app.pipelines.document_search.artifact_enrichment import (
    enrich_figure_artifacts,
    generate_figure_caption_and_summary,
)
from app.pipelines.document_search.artifact_extraction import (
    extract_caption,
    extract_figure_artifacts,
    extract_footnotes,
    extract_table_artifacts,
)
from app.pipelines.document_search.artifact_region_image import (
    build_region_upload_payload,
    choose_rotation_degrees_from_text,
    extract_page_rotation_hints,
)
from app.pipelines.document_search.components.document_chunker import (
    DocumentChunker,
    DocumentChunkMetadata,
)
from app.pipelines.document_search.config import config
from app.pipelines.document_search.indexing_haystack_pipeline import (
    create_document_indexing_pipeline,
)
from app.pipelines.permit_condition_extraction.components.azure_document_intelligence_converter import (
    AzureDocumentIntelligenceConverter,
)
from azure.search.documents import SearchClient
from openai import AzureOpenAI

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Batch sizes
# ---------------------------------------------------------------------------

# Azure OpenAI embeddings API: up to 2048 items per request.
EMBED_BATCH_SIZE = 100
# Azure Search upload_documents: up to 1000 documents per batch.
# Kept at 100 (vs the 1000 max) so the push phase emits frequent enough progress
# updates for the status endpoint to reflect meaningful movement.
PUSH_BATCH_SIZE = 100
MULTIMODAL_PROMPT_MAX_WORKERS = 4

# ---------------------------------------------------------------------------
# Shared singleton components
# ---------------------------------------------------------------------------

document_intelligence = AzureDocumentIntelligenceConverter(
    endpoint=config.document_intelligence.endpoint,
    api_key=config.document_intelligence.api_key.resolve_value(),
    api_version=config.document_intelligence.api_version,
)

chunker = DocumentChunker()

# Used exclusively for batch embedding during indexing.
openai_client = AzureOpenAI(
    azure_endpoint=config.openai.endpoint.resolve_value(),
    api_key=config.openai.api_key.resolve_value(),
    api_version=config.openai.api_version,
    default_headers={"Authorization": f"Bearer {config.openai.api_key.resolve_value()}"},
)

# Re-export for convenience so callers only need to import from this module.
__all__ = [
    'DocumentChunkMetadata',
    'document_intelligence',
    'chunker',
    'openai_client',
    'delete_document_chunks',
    'embed_chunks',
    'push_to_index',
    'extract_and_chunk_file',
    'EMBED_BATCH_SIZE',
    'PUSH_BATCH_SIZE',
]


# ---------------------------------------------------------------------------
# Pipeline stages (Haystack-style: extract -> transform -> enrich -> index)
# ---------------------------------------------------------------------------

def delete_document_chunks(search_client: SearchClient, document_manager_guid: str) -> int:
    """
    Deletes all indexed chunks for a given document_manager_guid before re-indexing.

    The chunk-count can change between runs (e.g. the plain-text fix produces fewer
    chunks than the old JSON-encoded content did), so overwriting by ID alone leaves
    stale orphan chunks in the index. Deleting first guarantees a clean slate.

    Paginates in batches of 500 to handle large documents safely.
    """
    deleted = 0
    while True:
        results = search_client.search(
            search_text='*',
            filter=f"document_manager_guid eq '{document_manager_guid}'",
            select=['id'],
            top=500,
        )
        ids = [{'id': r['id']} for r in results]
        if not ids:
            break
        delete_results = search_client.delete_documents(documents=ids)
        deleted += sum(1 for r in delete_results if r.succeeded)

    if deleted:
        logger.info('Deleted %d stale chunks for document %s', deleted, document_manager_guid)
    return deleted


def embed_chunks(chunks: List[dict], on_progress=None) -> List[dict]:
    """
    Generates embeddings for all chunks and attaches them in-place.
    Batches calls to stay within Azure OpenAI request limits.
    Returns the same list with an 'embedding' key added to each dict.

    *on_progress(done, total)* is called after each batch if provided.
    """
    texts = [chunk['content'] for chunk in chunks]

    embeddings: List[List[float]] = []
    for i in range(0, len(texts), EMBED_BATCH_SIZE):
        batch = texts[i : i + EMBED_BATCH_SIZE]
        response = openai_client.embeddings.create(
            input=batch,
            model=config.openai.embedding_model,
        )
        embeddings.extend(item.embedding for item in response.data)
        if on_progress:
            on_progress(min(i + EMBED_BATCH_SIZE, len(texts)), len(texts))

    for chunk, embedding in zip(chunks, embeddings):
        chunk['embedding'] = embedding

    return chunks


def push_to_index(search_client: SearchClient, chunks: List[dict], on_progress=None) -> int:
    """
    Pushes all chunks to Azure AI Search in batches.
    Returns the total number of successfully indexed documents.

    *on_progress(done, total)* is called after each batch if provided.
    """
    succeeded = 0
    for i in range(0, len(chunks), PUSH_BATCH_SIZE):
        batch = chunks[i : i + PUSH_BATCH_SIZE]
        results = search_client.upload_documents(documents=batch)
        succeeded += sum(1 for r in results if r.succeeded)
        if on_progress:
            on_progress(min(i + PUSH_BATCH_SIZE, len(chunks)), len(chunks))
    return succeeded


def extract_and_chunk_file(
    tmp_path: str,
    now_application_guid: str,
    doc_meta: dict,
) -> tuple[List[dict], List[dict]]:
    """
    Runs Document Intelligence on *tmp_path*, then builds text and artifact chunks.
    Returns chunk dicts ready for embedding and extracted artifact payloads.
    """
    logger.info(
        "Processing document '%s' for NoW application %s",
        doc_meta.get('document_name', ''),
        now_application_guid,
    )

    pipeline = create_document_indexing_pipeline(
        run_document_intelligence_fn=document_intelligence.run_document_intelligence,
        add_metadata_to_document_fn=document_intelligence.add_metadata_to_document,
        chunk_documents_fn=chunker.run,
        extract_page_rotation_hints_fn=extract_page_rotation_hints,
        extract_table_artifacts_fn=partial(
            extract_table_artifacts,
            build_table_upload_payload_fn=partial(
                build_region_upload_payload,
                logger=logger,
                choose_rotation_degrees_from_text_fn=choose_rotation_degrees_from_text,
            ),
            extract_caption_fn=extract_caption,
            extract_footnotes_fn=extract_footnotes,
        ),
        extract_figure_artifacts_fn=partial(
            extract_figure_artifacts,
            build_figure_upload_payload_fn=partial(
                build_region_upload_payload,
                logger=logger,
                choose_rotation_degrees_from_text_fn=choose_rotation_degrees_from_text,
            ),
            extract_caption_fn=extract_caption,
            extract_footnotes_fn=extract_footnotes,
        ),
        enrich_figure_artifacts_fn=partial(
            enrich_figure_artifacts,
            multimodal_enrichment_enabled=config.multimodal_enrichment_enabled,
            multimodal_summary_max_chars=config.multimodal_summary_max_chars,
            max_workers=MULTIMODAL_PROMPT_MAX_WORKERS,
            categorize_artifact_fn=categorize_artifact,
            generate_figure_caption_and_summary_fn=partial(
                generate_figure_caption_and_summary,
                openai_client=openai_client,
                config=config,
            ),
            logger=logger,
        ),
        build_artifact_search_chunks_fn=build_artifact_search_chunks,
    )

    result = pipeline.run(
        {
            'metadata_builder': {
                'now_application_guid': now_application_guid,
                'doc_meta': doc_meta,
            },
            'analyzer': {
                'tmp_path': tmp_path,
            },
            'artifact_extractor': {
                'doc_meta': doc_meta,
                'tmp_path': tmp_path,
            },
        }
    )

    return result['chunk_merger']['chunks'], result['chunk_merger']['artifacts']
