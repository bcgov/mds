"""
Shared indexing components and helpers for NoW application document indexing.

Extracted here so that both the FastAPI resource and the Celery task can import
them without circular dependencies. All heavy objects (Document Intelligence,
chunker, OpenAI client) are initialised once at module load time.
"""
import hashlib
import json
import logging
import os
import re
import time
from base64 import b64encode
from pathlib import Path
from typing import Any, List, Optional

import fitz
from app.pipelines.document_search.components.document_chunker import (
    DocumentChunker,
    DocumentChunkMetadata,
)
from app.pipelines.document_search.config import config
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
    "DocumentChunkMetadata",
    "document_intelligence",
    "chunker",
    "openai_client",
    "delete_document_chunks",
    "embed_chunks",
    "push_to_index",
    "EMBED_BATCH_SIZE",
    "PUSH_BATCH_SIZE",
]


# ---------------------------------------------------------------------------
# Helper functions
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
            search_text="*",
            filter=f"document_manager_guid eq '{document_manager_guid}'",
            select=["id"],
            top=500,
        )
        ids = [{"id": r["id"]} for r in results]
        if not ids:
            break
        delete_results = search_client.delete_documents(documents=ids)
        deleted += sum(1 for r in delete_results if r.succeeded)

    if deleted:
        logger.info("Deleted %d stale chunks for document %s", deleted, document_manager_guid)
    return deleted


def embed_chunks(chunks: List[dict], on_progress=None) -> List[dict]:
    """
    Generates embeddings for all chunks and attaches them in-place.
    Batches calls to stay within Azure OpenAI request limits.
    Returns the same list with an 'embedding' key added to each dict.

    *on_progress(done, total)* is called after each batch if provided.
    """
    texts = [chunk["content"] for chunk in chunks]

    embeddings: List[List[float]] = []
    for i in range(0, len(texts), EMBED_BATCH_SIZE):
        batch = texts[i: i + EMBED_BATCH_SIZE]
        response = openai_client.embeddings.create(
            input=batch,
            model=config.openai.embedding_model,
        )
        embeddings.extend(item.embedding for item in response.data)
        if on_progress:
            on_progress(min(i + EMBED_BATCH_SIZE, len(texts)), len(texts))

    for chunk, embedding in zip(chunks, embeddings):
        chunk["embedding"] = embedding

    return chunks


def push_to_index(search_client: SearchClient, chunks: List[dict], on_progress=None) -> int:
    """
    Pushes all chunks to Azure AI Search in batches.
    Returns the total number of successfully indexed documents.

    *on_progress(done, total)* is called after each batch if provided.
    """
    succeeded = 0
    for i in range(0, len(chunks), PUSH_BATCH_SIZE):
        batch = chunks[i: i + PUSH_BATCH_SIZE]
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
    Runs Document Intelligence on *tmp_path*, then chunks the result.
    Returns a list of chunk dicts ready for embedding.
    """
    chunk_metadata = DocumentChunkMetadata(
        now_application_guid=now_application_guid,
        mine_guid=doc_meta.get("mine_guid", ""),
        document_manager_guid=doc_meta.get("document_manager_guid", ""),
        document_name=doc_meta.get("document_name", ""),
        document_type=doc_meta.get("document_type", ""),
        submitted_date=doc_meta.get("submitted_date"),
    )

    logger.info(
        "Processing document '%s' for NoW application %s",
        chunk_metadata.document_name,
        now_application_guid,
    )

    analyze_result = document_intelligence.run_document_intelligence(Path(tmp_path))
    paragraph_documents = [
        document_intelligence.add_metadata_to_document(idx, paragraph)
        for idx, paragraph in enumerate(analyze_result.paragraphs or [])
    ]

    chunk_result = chunker.run(documents=paragraph_documents, metadata=chunk_metadata)
    artifacts = _extract_table_artifacts(analyze_result, doc_meta, tmp_path)
    figure_artifacts = _extract_figure_artifacts(analyze_result, doc_meta, tmp_path)
    _enrich_figure_artifacts(figure_artifacts)
    artifacts.extend(figure_artifacts)
    artifact_chunks = _build_artifact_search_chunks(artifacts, chunk_metadata)
    chunks = chunk_result["chunks"] + artifact_chunks
    return chunks, artifacts


def _build_artifact_search_chunks(artifacts: List[dict], chunk_metadata: DocumentChunkMetadata) -> List[dict]:
    chunks = []
    for artifact in artifacts:
        artifact_type = artifact.get('type')
        artifact_label = (artifact_type or 'artifact').title()
        content = artifact.get('content') or {}
        page_number = artifact.get('page_number')

        text_parts = []

        table_markdown = None

        if artifact_type == 'table':
            headers = content.get('headers') or []
            rows = content.get('rows') or []
            caption = content.get('caption')
            table_markdown = content.get('markdown') or _build_table_markdown(headers, rows)

            if caption:
                text_parts.append(f"Table caption: {caption}")
            if page_number:
                text_parts.append(f"Page: {page_number}")
            if headers:
                text_parts.append(f"Headers: {', '.join(str(header) for header in headers if header)}")
            for row in rows:
                row_text = ", ".join(f"{key}: {value}" for key, value in row.items())
                if row_text:
                    text_parts.append(row_text)
        else:
            caption = content.get('caption')
            summary = content.get('summary')
            description = content.get('description')
            footnotes = content.get('footnotes') or []
            if summary:
                text_parts.append(f"{artifact_label} summary: {summary}")
            if caption:
                text_parts.append(f"{artifact_label} caption: {caption}")
            if description:
                text_parts.append(f"{artifact_label} description: {description}")
            if page_number:
                text_parts.append(f"Page: {page_number}")
            for footnote in footnotes:
                if footnote:
                    text_parts.append(f"Footnote: {footnote}")

        content_text = "\n".join(text_parts).strip()
        if not content_text:
            continue

        chunk_id = _make_artifact_chunk_id(
            chunk_metadata.now_application_guid,
            chunk_metadata.document_manager_guid,
            artifact_type or 'artifact',
            artifact.get('artifact_id', ''),
        )
        chunks.append({
            'id': chunk_id,
            'content': content_text,
            'now_application_guid': chunk_metadata.now_application_guid,
            'mine_guid': chunk_metadata.mine_guid,
            'document_manager_guid': chunk_metadata.document_manager_guid,
            'document_name': chunk_metadata.document_name,
            'document_type': chunk_metadata.document_type,
            'submitted_date': chunk_metadata.submitted_date or None,
            'artifact_type': artifact_type,
            'artifact_id': artifact.get('artifact_id'),
            'artifact_page_number': page_number,
            'artifact_table_markdown': table_markdown,
            'artifact_caption': content.get('caption'),
            'artifact_summary': content.get('summary'),
            'caption_source': content.get('caption_source'),
            'summary_source': content.get('summary_source'),
        })

    return chunks


def _make_artifact_chunk_id(
    now_application_guid: str,
    document_manager_guid: str,
    artifact_type: str,
    artifact_id: str,
) -> str:
    key = f"{now_application_guid}:{document_manager_guid}:{artifact_type}:{artifact_id}"
    return hashlib.sha256(key.encode()).hexdigest()[:16]


def _extract_table_artifacts(analyze_result, doc_meta: dict, source_pdf_path: Optional[str] = None) -> List[dict]:
    table_artifacts = []
    document_manager_guid = doc_meta.get('document_manager_guid', '')

    for index, table in enumerate(analyze_result.tables or []):
        row_count = getattr(table, 'row_count', 0) or 0
        column_count = getattr(table, 'column_count', 0) or 0
        grid = [["" for _ in range(column_count)] for _ in range(row_count)]

        for cell in getattr(table, 'cells', []) or []:
            row_idx = getattr(cell, 'row_index', None)
            col_idx = getattr(cell, 'column_index', None)
            if row_idx is None or col_idx is None:
                continue
            if 0 <= row_idx < row_count and 0 <= col_idx < column_count:
                grid[row_idx][col_idx] = getattr(cell, 'content', '') or ''

        headers = grid[0] if row_count > 0 else []
        body_rows = grid[1:] if row_count > 1 else []
        row_payload = []
        for row in body_rows:
            row_payload.append({
                (headers[col_idx] or f"column_{col_idx + 1}"): row[col_idx]
                for col_idx in range(column_count)
            })

        page_number, bounding_box = _extract_primary_region_metadata(
            getattr(table, 'bounding_regions', None) or []
        )

        artifact_id = f"{document_manager_guid}_p{page_number or 0}_t{index + 1}"
        table_markdown = _build_table_markdown(headers, row_payload)
        upload_payload = None
        if _is_table_binary_upload_enabled():
            upload_payload = _build_table_upload_payload(
                source_pdf_path=source_pdf_path,
                artifact_id=artifact_id,
                page_number=page_number,
                bounding_box=bounding_box,
            )
            if not upload_payload:
                logger.warning(
                    'Unable to build table image upload payload for artifact_id=%s; skipping artifact upload.',
                    artifact_id,
                )

        table_artifact = {
            'type': 'table',
            'artifact_id': artifact_id,
            'page_number': page_number,
            'bounding_box': bounding_box,
            'content': {
                'table_index': index,
                'headers': headers,
                'rows': row_payload,
                'markdown': table_markdown,
                'caption': _extract_caption(table),
                'footnotes': _extract_footnotes(table),
            },
            'metadata': {
                'row_count': row_count,
                'column_count': column_count,
            },
            'extractor': {
                'name': 'di_layout_table_extractor',
                'version': 'v1',
            },
        }

        # Internal use by permits callback: optional docman upload payload.
        if upload_payload:
            table_artifact['_artifact_upload'] = upload_payload

        table_artifacts.append(table_artifact)

    return table_artifacts


def _extract_figure_artifacts(analyze_result, doc_meta: dict, source_pdf_path: Optional[str] = None) -> List[dict]:
    figure_artifacts = []
    document_manager_guid = doc_meta.get('document_manager_guid', '')
    paragraphs = getattr(analyze_result, 'paragraphs', None) or []

    for index, figure in enumerate(getattr(analyze_result, 'figures', None) or []):
        page_number, bounding_box = _extract_primary_region_metadata(
            getattr(figure, 'bounding_regions', None) or []
        )
        artifact_id = f"{document_manager_guid}_p{page_number or 0}_f{index + 1}"
        caption = _extract_caption(figure)
        description = _extract_figure_description(figure, paragraphs) or caption

        figure_artifacts.append({
            'type': 'figure',
            'artifact_id': artifact_id,
            'page_number': page_number,
            'bounding_box': bounding_box,
            'content': {
                'figure_index': index,
                'caption': caption,
                'description': description,
                'footnotes': _extract_footnotes(figure),
            },
            'metadata': {
                'element_count': len(getattr(figure, 'elements', None) or []),
            },
            'extractor': {
                'name': 'di_layout_figure_extractor',
                'version': 'v1',
            },
        })

        if _is_figure_binary_upload_enabled():
            upload_payload = _build_figure_upload_payload(
                source_pdf_path=source_pdf_path,
                artifact_id=artifact_id,
                page_number=page_number,
                bounding_box=bounding_box,
            )
            if upload_payload:
                figure_artifacts[-1]['_artifact_upload'] = upload_payload

    return figure_artifacts


def _enrich_figure_artifacts(figure_artifacts: List[dict]) -> None:
    if not figure_artifacts:
        return

    if not config.multimodal_enrichment_enabled:
        for artifact in figure_artifacts:
            content = artifact.get('content') or {}
            caption = content.get('caption')
            if caption:
                content['caption_source'] = 'di'
            artifact['content'] = content
        return

    totals = {
        'processed': 0,
        'di_caption_missing': 0,
        'generated_caption': 0,
        'generated_summary': 0,
        'failed': 0,
    }
    total_latency_s = 0.0

    for artifact in figure_artifacts:
        content = artifact.get('content') or {}
        caption = _clean_text(content.get('caption'))
        description = _clean_text(content.get('description'))
        footnotes = content.get('footnotes') or []

        totals['processed'] += 1
        if not caption:
            totals['di_caption_missing'] += 1

        start = time.perf_counter()
        try:
            generated = _generate_figure_caption_and_summary(
                image_payload=artifact.get('_artifact_upload'),
                page_number=artifact.get('page_number'),
                description=description,
                footnotes=footnotes,
            )
            total_latency_s += (time.perf_counter() - start)

            generated_caption = _clean_text(generated.get('caption'))
            generated_summary = _clean_text(generated.get('summary'))

            if caption:
                content['caption'] = caption
                content['caption_source'] = 'di'
            elif generated_caption:
                content['caption'] = generated_caption
                content['caption_source'] = 'generated'
                totals['generated_caption'] += 1

            if generated_summary:
                content['summary'] = _truncate_summary(generated_summary)
                content['summary_source'] = 'generated'
                totals['generated_summary'] += 1
        except Exception as exc:  # noqa: BLE001 - enrichment must be non-blocking
            totals['failed'] += 1
            logger.warning(
                'Figure enrichment failed for artifact_id=%s: %s',
                artifact.get('artifact_id'),
                exc,
            )
            if caption:
                content['caption'] = caption
                content['caption_source'] = 'di'

        artifact['content'] = content

    avg_latency_ms = int((total_latency_s / totals['processed']) * 1000) if totals['processed'] else 0
    logger.info(
        'Figure enrichment stats: processed=%d di_caption_missing=%d generated_caption=%d generated_summary=%d failed=%d avg_latency_ms=%d',
        totals['processed'],
        totals['di_caption_missing'],
        totals['generated_caption'],
        totals['generated_summary'],
        totals['failed'],
        avg_latency_ms,
    )


def _generate_figure_caption_and_summary(
    image_payload: Optional[dict],
    page_number: Optional[int],
    description: Optional[str],
    footnotes: List[str],
) -> dict:
    summary_limit = max(80, config.multimodal_summary_max_chars)
    user_context_parts = []
    if page_number:
        user_context_parts.append(f'Page number: {page_number}')
    if description:
        user_context_parts.append(f'Document text near figure: {description}')
    if footnotes:
        user_context_parts.append(f"Figure footnotes: {' | '.join(str(note) for note in footnotes if note)}")

    context_text = "\n".join(user_context_parts) if user_context_parts else "No additional context available."

    prompt_text = (
        'Generate JSON only with keys caption and summary. '
        'caption: max 20 words, concrete, no speculation. '
        f'summary: max {summary_limit} characters, 1-3 concise sentences, search-friendly. '
        'Do not include markdown. Use empty string when uncertain.\n\n'
        f'{context_text}'
    )

    user_content: List[dict[str, Any]] = [{"type": "text", "text": prompt_text}]
    if image_payload and image_payload.get('content_bytes'):
        image_b64 = b64encode(image_payload['content_bytes']).decode('ascii')
        user_content.append(
            {
                'type': 'image_url',
                'image_url': {'url': f'data:image/png;base64,{image_b64}'},
            }
        )

    messages: List[dict[str, Any]] = [
        {
            'role': 'system',
            'content': 'Return strict JSON with keys caption and summary only.',
        },
        {'role': 'user', 'content': user_content},
    ]

    response = openai_client.chat.completions.create(
        model=config.openai.deployment_name,
        temperature=0,
        response_format={'type': 'json_object'},
        messages=messages,  # type: ignore[arg-type]
    )

    content_text = ((response.choices or [])[0].message.content or '').strip()
    payload = _parse_json_object(content_text)
    if not isinstance(payload, dict):
        return {'caption': '', 'summary': ''}

    return {
        'caption': _clean_text(payload.get('caption')) or '',
        'summary': _clean_text(payload.get('summary')) or '',
    }


def _parse_json_object(text: str) -> dict:
    if not text:
        return {}

    stripped = text.strip()
    try:
        return json.loads(stripped)
    except json.JSONDecodeError:
        match = re.search(r'\{.*\}', stripped, flags=re.DOTALL)
        if not match:
            return {}
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            return {}


def _clean_text(value: Any) -> Optional[str]:
    if value is None:
        return None
    cleaned = re.sub(r'\s+', ' ', str(value)).strip()
    return cleaned or None


def _truncate_summary(text: str) -> str:
    limit = max(80, config.multimodal_summary_max_chars)
    if len(text) <= limit:
        return text
    trimmed = text[:limit].rstrip(' .')
    return f'{trimmed}...'


def _build_table_markdown(headers: List[str], row_payload: List[dict]) -> Optional[str]:
    raw_headers = [
        (header if header else f"column_{idx + 1}")
        for idx, header in enumerate(headers or [])
    ]

    if not raw_headers and row_payload:
        raw_headers = list(row_payload[0].keys())

    if not raw_headers:
        return None

    normalized_headers = [_sanitize_markdown_cell(header) for header in raw_headers]

    rows = [
        "| " + " | ".join(normalized_headers) + " |",
        "| " + " | ".join(["---"] * len(normalized_headers)) + " |",
    ]

    for row in row_payload:
        row_cells = [
            _sanitize_markdown_cell(row.get(field, ""))
            for field in raw_headers
        ]
        rows.append("| " + " | ".join(row_cells) + " |")

    return "\n".join(rows)
def _sanitize_markdown_cell(value) -> str:
    text = str(value or "")
    text = text.replace("|", "\\|")
    text = " ".join(text.splitlines())
    return text


def _extract_primary_region_metadata(bounding_regions: List) -> tuple:
    page_number = None
    bounding_box = None
    if bounding_regions:
        page_number = getattr(bounding_regions[0], 'page_number', None)
        polygon = getattr(bounding_regions[0], 'polygon', None)
        if polygon and len(polygon) >= 8:
            xs = polygon[0::2]
            ys = polygon[1::2]
            bounding_box = {
                'left': min(xs),
                'top': min(ys),
                'right': max(xs),
                'bottom': max(ys),
                'polygon': polygon,
            }
    return page_number, bounding_box


def _build_table_upload_payload(
    source_pdf_path: Optional[str],
    artifact_id: str,
    page_number: Optional[int],
    bounding_box: Optional[dict],
) -> Optional[dict]:
    return _build_region_upload_payload(
        source_pdf_path=source_pdf_path,
        artifact_id=artifact_id,
        page_number=page_number,
        bounding_box=bounding_box,
    )


def _build_figure_upload_payload(
    source_pdf_path: Optional[str],
    artifact_id: str,
    page_number: Optional[int],
    bounding_box: Optional[dict],
) -> Optional[dict]:
    return _build_region_upload_payload(
        source_pdf_path=source_pdf_path,
        artifact_id=artifact_id,
        page_number=page_number,
        bounding_box=bounding_box,
    )


def _build_region_upload_payload(
    source_pdf_path: Optional[str],
    artifact_id: str,
    page_number: Optional[int],
    bounding_box: Optional[dict],
) -> Optional[dict]:
    if not source_pdf_path or not page_number or not bounding_box:
        logger.warning(
            'Skipping region upload payload for artifact_id=%s: missing source_pdf_path/page_number/bounding_box.',
            artifact_id,
        )
        return None

    left = bounding_box.get('left')
    top = bounding_box.get('top')
    right = bounding_box.get('right')
    bottom = bounding_box.get('bottom')
    left = _coerce_float(left)
    top = _coerce_float(top)
    right = _coerce_float(right)
    bottom = _coerce_float(bottom)
    if left is None or top is None or right is None or bottom is None:
        logger.warning(
            'Skipping region upload payload for artifact_id=%s: invalid bounding box values (%s).',
            artifact_id,
            bounding_box,
        )
        return None

    try:
        with fitz.open(str(source_pdf_path)) as document:
            if page_number < 1 or page_number > document.page_count:
                logger.warning(
                    'Skipping region upload payload for artifact_id=%s: page %s out of range (page_count=%s).',
                    artifact_id,
                    page_number,
                    document.page_count,
                )
                return None

            page = document[page_number - 1]
            clip = fitz.Rect(left * 72, top * 72, right * 72, bottom * 72) & page.rect
            if clip.width <= 0 or clip.height <= 0:
                logger.warning(
                    'Skipping region upload payload for artifact_id=%s: empty clip after intersection (clip=%s page_rect=%s).',
                    artifact_id,
                    clip,
                    page.rect,
                )
                return None

            pixmap = page.get_pixmap(matrix=fitz.Matrix(2, 2), clip=clip, alpha=False)
            png_bytes = pixmap.tobytes("png")
            if not png_bytes:
                return None

            return {
                'file_name': f'{artifact_id}.png',
                'mime_type': 'image/png',
                'content_bytes': png_bytes,
            }
    except Exception as exc:  # noqa: BLE001 - best-effort artifact image capture
        logger.warning('Unable to build region upload payload for artifact_id=%s: %s', artifact_id, exc)
        return None


def _coerce_float(value) -> Optional[float]:
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _is_figure_binary_upload_enabled() -> bool:
    value = os.getenv('DOCUMENT_ARTIFACT_ENABLE_FIGURE_BINARY_UPLOAD', 'true').strip().lower()
    return value in {'1', 'true', 'yes', 'on'}


def _is_table_binary_upload_enabled() -> bool:
    value = os.getenv('DOCUMENT_ARTIFACT_ENABLE_TABLE_BINARY_UPLOAD', 'true').strip().lower()
    return value in {'1', 'true', 'yes', 'on'}


def _extract_caption(table):
    caption = getattr(table, 'caption', None)
    if not caption:
        return None
    content = getattr(caption, 'content', None) or getattr(caption, 'text', None)
    return content


def _extract_footnotes(table):
    footnotes = []
    for note in getattr(table, 'footnotes', None) or []:
        content = getattr(note, 'content', None) or getattr(note, 'text', None)
        if content:
            footnotes.append(content)
    return footnotes


def _extract_figure_description(figure, paragraphs) -> Optional[str]:
    figure_elements = getattr(figure, 'elements', None) or []
    description_parts = []

    for element_ref in figure_elements:
        if not isinstance(element_ref, str):
            continue

        match = re.search(r'/paragraphs/(\d+)$', element_ref)
        if not match:
            continue

        paragraph_index = int(match.group(1))
        if paragraph_index < 0 or paragraph_index >= len(paragraphs):
            continue

        paragraph = paragraphs[paragraph_index]
        paragraph_text = getattr(paragraph, 'content', None) or getattr(paragraph, 'text', None)
        if paragraph_text:
            description_parts.append(paragraph_text.strip())

    if description_parts:
        return "\n".join(part for part in description_parts if part)

    return None
