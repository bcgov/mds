"""
Shared indexing components and helpers for NoW application document indexing.

This module acts as a stable facade for the indexing pipeline and keeps the
existing imports/patch points used by tasks and tests. Heavy logic is split into
focused modules so each indexing stage is easier to reason about and evolve.
"""

import logging
from pathlib import Path
from typing import Any, List, Optional

import fitz
from app.pipelines.document_search.artifact_chunk_builder import (
    MULTIMODAL_CATEGORY_VALUES,
    build_artifact_search_chunks,
    build_table_markdown,
    categorize_artifact,
    clean_text,
    coerce_float,
    make_artifact_chunk_id,
    normalize_generated_category,
    parse_json_object,
    sanitize_markdown_cell,
    truncate_summary,
)
from app.pipelines.document_search.artifact_enrichment import (
    enrich_figure_artifacts,
    generate_figure_caption_and_summary,
)
from app.pipelines.document_search.artifact_extraction import (
    extract_caption,
    extract_figure_artifacts,
    extract_figure_description,
    extract_footnotes,
    extract_table_artifacts,
    is_figure_binary_upload_enabled,
    is_table_binary_upload_enabled,
)
from app.pipelines.document_search.artifact_region_image import (
    build_region_upload_payload,
    choose_rotation_degrees_from_text,
    determine_rotation_degrees,
    extract_page_rotation_hints,
    extract_primary_region_metadata,
    normalize_di_angle_to_quadrant,
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
        chunk_documents_fn=lambda paragraph_documents, chunk_metadata: chunker.run(
            documents=paragraph_documents,
            metadata=chunk_metadata,
        ),
        extract_page_rotation_hints_fn=_extract_page_rotation_hints,
        extract_table_artifacts_fn=lambda analyze_result, meta, path, hints: _extract_table_artifacts(
            analyze_result,
            meta,
            path,
            hints,
        ),
        extract_figure_artifacts_fn=lambda analyze_result, meta, path, hints: _extract_figure_artifacts(
            analyze_result,
            meta,
            path,
            hints,
        ),
        enrich_figure_artifacts_fn=_enrich_figure_artifacts,
        build_artifact_search_chunks_fn=_build_artifact_search_chunks,
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


# ---------------------------------------------------------------------------
# Compatibility wrappers (private symbols used by tests/callers)
# ---------------------------------------------------------------------------

def _build_artifact_search_chunks(artifacts: List[dict], chunk_metadata: DocumentChunkMetadata) -> List[dict]:
    return build_artifact_search_chunks(artifacts, chunk_metadata)


def _make_artifact_chunk_id(
    now_application_guid: str,
    document_manager_guid: str,
    artifact_type: str,
    artifact_id: str,
) -> str:
    return make_artifact_chunk_id(now_application_guid, document_manager_guid, artifact_type, artifact_id)


def _extract_table_artifacts(
    analyze_result,
    doc_meta: dict,
    source_pdf_path: Optional[str] = None,
    page_rotation_hints: Optional[dict[int, int]] = None,
) -> List[dict]:
    return extract_table_artifacts(
        analyze_result=analyze_result,
        doc_meta=doc_meta,
        source_pdf_path=source_pdf_path,
        page_rotation_hints=page_rotation_hints,
        extract_primary_region_metadata_fn=_extract_primary_region_metadata,
        build_table_markdown_fn=_build_table_markdown,
        build_table_upload_payload_fn=_build_table_upload_payload,
        extract_caption_fn=_extract_caption,
        extract_footnotes_fn=_extract_footnotes,
        logger=logger,
    )


def _extract_figure_artifacts(
    analyze_result,
    doc_meta: dict,
    source_pdf_path: Optional[str] = None,
    page_rotation_hints: Optional[dict[int, int]] = None,
) -> List[dict]:
    return extract_figure_artifacts(
        analyze_result=analyze_result,
        doc_meta=doc_meta,
        source_pdf_path=source_pdf_path,
        page_rotation_hints=page_rotation_hints,
        extract_primary_region_metadata_fn=_extract_primary_region_metadata,
        build_figure_upload_payload_fn=_build_figure_upload_payload,
        extract_caption_fn=_extract_caption,
        extract_footnotes_fn=_extract_footnotes,
    )


def _enrich_figure_artifacts(figure_artifacts: List[dict]) -> None:
    enrich_figure_artifacts(
        figure_artifacts,
        multimodal_enrichment_enabled=config.multimodal_enrichment_enabled,
        multimodal_summary_max_chars=config.multimodal_summary_max_chars,
        max_workers=MULTIMODAL_PROMPT_MAX_WORKERS,
        categorize_artifact_fn=_categorize_artifact,
        generate_figure_caption_and_summary_fn=_generate_figure_caption_and_summary,
        logger=logger,
    )


def _generate_figure_caption_and_summary(
    image_payload: Optional[dict],
    page_number: Optional[int],
    description: Optional[str],
    footnotes: List[str],
) -> dict:
    return generate_figure_caption_and_summary(
        image_payload=image_payload,
        page_number=page_number,
        description=description,
        footnotes=footnotes,
        openai_client=openai_client,
        config=config,
    )


def _normalize_generated_category(value: Any) -> Optional[str]:
    return normalize_generated_category(value)


def _parse_json_object(text: str) -> dict:
    return parse_json_object(text)


def _clean_text(value: Any) -> Optional[str]:
    return clean_text(value)


def _truncate_summary(text: str) -> str:
    return truncate_summary(text, config.multimodal_summary_max_chars)


def _build_table_markdown(headers: List[str], row_payload: List[dict]) -> Optional[str]:
    return build_table_markdown(headers, row_payload)


def _sanitize_markdown_cell(value: Any) -> str:
    return sanitize_markdown_cell(value)


def _extract_primary_region_metadata(bounding_regions: List) -> tuple:
    return extract_primary_region_metadata(bounding_regions)


def _build_table_upload_payload(
    source_pdf_path: Optional[str],
    artifact_id: str,
    page_number: Optional[int],
    bounding_box: Optional[dict],
    page_rotation_hints: Optional[dict[int, int]] = None,
) -> Optional[dict]:
    return _build_region_upload_payload(
        source_pdf_path=source_pdf_path,
        artifact_id=artifact_id,
        page_number=page_number,
        bounding_box=bounding_box,
        page_rotation_hints=page_rotation_hints,
    )


def _build_figure_upload_payload(
    source_pdf_path: Optional[str],
    artifact_id: str,
    page_number: Optional[int],
    bounding_box: Optional[dict],
    page_rotation_hints: Optional[dict[int, int]] = None,
) -> Optional[dict]:
    return _build_region_upload_payload(
        source_pdf_path=source_pdf_path,
        artifact_id=artifact_id,
        page_number=page_number,
        bounding_box=bounding_box,
        page_rotation_hints=page_rotation_hints,
    )


def _build_region_upload_payload(
    source_pdf_path: Optional[str],
    artifact_id: str,
    page_number: Optional[int],
    bounding_box: Optional[dict],
    page_rotation_hints: Optional[dict[int, int]] = None,
) -> Optional[dict]:
    return build_region_upload_payload(
        source_pdf_path=source_pdf_path,
        artifact_id=artifact_id,
        page_number=page_number,
        bounding_box=bounding_box,
        page_rotation_hints=page_rotation_hints,
        logger=logger,
        choose_rotation_degrees_from_text_fn=_choose_rotation_degrees_from_text,
    )


def _coerce_float(value) -> Optional[float]:
    return coerce_float(value)


def _extract_page_rotation_hints(analyze_result) -> dict[int, int]:
    return extract_page_rotation_hints(analyze_result)


def _normalize_di_angle_to_quadrant(angle, deadband_degrees: float = 10.0) -> Optional[int]:
    return normalize_di_angle_to_quadrant(angle, deadband_degrees)


def _determine_rotation_degrees(
    page,
    clip_rect,
    page_number: Optional[int],
    page_rotation_hints: Optional[dict[int, int]],
) -> tuple[int, str]:
    return determine_rotation_degrees(
        page,
        clip_rect,
        page_number,
        page_rotation_hints,
        choose_rotation_degrees_from_text_fn=_choose_rotation_degrees_from_text,
    )


def _choose_rotation_degrees_from_text(page: fitz.Page, clip_rect: fitz.Rect) -> tuple[int, str]:
    return choose_rotation_degrees_from_text(page, clip_rect)


def _is_figure_binary_upload_enabled() -> bool:
    return is_figure_binary_upload_enabled()


def _is_table_binary_upload_enabled() -> bool:
    return is_table_binary_upload_enabled()


def _extract_caption(table_or_figure):
    return extract_caption(table_or_figure)


def _extract_footnotes(table_or_figure):
    return extract_footnotes(table_or_figure)


def _extract_figure_description(figure, paragraphs) -> Optional[str]:
    return extract_figure_description(figure, paragraphs)


def _categorize_artifact(
    artifact_type: Optional[str],
    caption: Optional[str],
    description: Optional[str],
    summary: Optional[str],
    footnotes: Optional[List[str]] = None,
) -> str:
    return categorize_artifact(artifact_type, caption, description, summary, footnotes)
