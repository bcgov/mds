"""
Shared indexing components and helpers for NoW application document indexing.

Extracted here so that both the FastAPI resource and the Celery task can import
them without circular dependencies. All heavy objects (Document Intelligence,
chunker, OpenAI client) are initialised once at module load time.
"""
import hashlib
import io
import json
import logging
import os
import re
import time
from base64 import b64encode
from concurrent.futures import ThreadPoolExecutor, as_completed
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
from PIL import Image

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
MULTIMODAL_CATEGORY_VALUES = {
    'map',
    'site_photo',
    'cross_section',
    'plan_view',
    'diagram',
    'chart_graph',
    'technical_drawing',
    'other',
}

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
    page_rotation_hints = _extract_page_rotation_hints(analyze_result)
    artifacts = _extract_table_artifacts(analyze_result, doc_meta, tmp_path, page_rotation_hints)
    figure_artifacts = _extract_figure_artifacts(analyze_result, doc_meta, tmp_path, page_rotation_hints)
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
        bounding_box = artifact.get('bounding_box') or {}

        text_parts = []

        table_markdown = None

        if artifact_type == 'table':
            headers = content.get('headers') or []
            rows = content.get('rows') or []
            caption = content.get('caption')
            category = content.get('category')
            table_markdown = content.get('markdown') or _build_table_markdown(headers, rows)

            if caption:
                text_parts.append(f"Table caption: {caption}")
            if category:
                text_parts.append(f"Table category: {category}")
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
            category = content.get('category')
            footnotes = content.get('footnotes') or []
            if summary:
                text_parts.append(f"{artifact_label} summary: {summary}")
            if caption:
                text_parts.append(f"{artifact_label} caption: {caption}")
            if category:
                text_parts.append(f"{artifact_label} category: {category}")
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
            'artifact_bounding_box_left': _coerce_float(bounding_box.get('left')),
            'artifact_bounding_box_top': _coerce_float(bounding_box.get('top')),
            'artifact_bounding_box_right': _coerce_float(bounding_box.get('right')),
            'artifact_bounding_box_bottom': _coerce_float(bounding_box.get('bottom')),
            'artifact_table_markdown': table_markdown,
            'artifact_category': content.get('category'),
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


def _extract_table_artifacts(
    analyze_result,
    doc_meta: dict,
    source_pdf_path: Optional[str] = None,
    page_rotation_hints: Optional[dict[int, int]] = None,
) -> List[dict]:
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
                page_rotation_hints=page_rotation_hints,
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
                'category': 'table',
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


def _extract_figure_artifacts(
    analyze_result,
    doc_meta: dict,
    source_pdf_path: Optional[str] = None,
    page_rotation_hints: Optional[dict[int, int]] = None,
) -> List[dict]:
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
                'category': _categorize_artifact(
                    artifact_type='figure',
                    caption=caption,
                    description=description,
                    summary=None,
                    footnotes=_extract_footnotes(figure),
                ),
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
                page_rotation_hints=page_rotation_hints,
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
            content['category'] = _categorize_artifact(
                artifact_type='figure',
                caption=_clean_text(content.get('caption')),
                description=_clean_text(content.get('description')),
                summary=_clean_text(content.get('summary')),
                footnotes=content.get('footnotes') or [],
            )
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

    enrichment_requests = []
    for artifact in figure_artifacts:
        content = artifact.get('content') or {}
        caption = _clean_text(content.get('caption'))
        description = _clean_text(content.get('description'))
        footnotes = content.get('footnotes') or []

        totals['processed'] += 1
        if not caption:
            totals['di_caption_missing'] += 1

        enrichment_requests.append(
            {
                'artifact': artifact,
                'content': content,
                'caption': caption,
                'description': description,
                'footnotes': footnotes,
            }
        )

    max_workers = min(MULTIMODAL_PROMPT_MAX_WORKERS, len(enrichment_requests))
    if max_workers <= 0:
        return

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        future_to_request = {}
        for request in enrichment_requests:
            request['start_time'] = time.perf_counter()
            future = executor.submit(
                _generate_figure_caption_and_summary,
                image_payload=request['artifact'].get('_artifact_upload'),
                page_number=request['artifact'].get('page_number'),
                description=request['description'],
                footnotes=request['footnotes'],
            )
            future_to_request[future] = request

        for future in as_completed(future_to_request):
            request = future_to_request[future]
            artifact = request['artifact']
            content = request['content']
            caption = request['caption']

            try:
                generated = future.result()
                total_latency_s += (time.perf_counter() - request['start_time'])

                generated_caption = _clean_text(generated.get('caption'))
                generated_summary = _clean_text(generated.get('summary'))
                generated_category = _normalize_generated_category(generated.get('category'))

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

                if generated_category:
                    content['category'] = generated_category
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

            if not content.get('category'):
                content['category'] = _categorize_artifact(
                    artifact_type='figure',
                    caption=_clean_text(content.get('caption')),
                    description=_clean_text(content.get('description')),
                    summary=_clean_text(content.get('summary')),
                    footnotes=content.get('footnotes') or [],
                )

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
        'Generate JSON only with keys caption, summary, and category. '
        'Do not add any other keys. Do not include markdown.\n\n'
        'General rules:\n'
        '- Ground all statements in visible evidence and provided context.\n'
        '- No speculation, legal conclusions, or inferred intent.\n'
        '- If uncertain, omit uncertain details and use empty string when needed.\n\n'
        'Caption rules:\n'
        '- Exactly one sentence, max 20 words, concrete and visual.\n'
        '- Prefer nouns over adjectives; avoid generic filler.\n'
        '- Include image type only when visible (map, photo, diagram, chart, table image, technical drawing).\n\n'
        '- If the figure contains a readable embedded title/type label, include the most specific one in the caption.\n\n'
        'Caption rules by image type:\n'
        '- Map: name map subject and 1-2 visible elements (for example pit boundary, haul roads, watercourse, labels, legend, north arrow, scale bar). Include readable map-type text (for example site map, location map, orthophoto) when present. Use place names or coordinates only if readable.\n'
        '- Scenery photo: name scene type and dominant visible features (for example terrain, vegetation, roads, equipment, facilities, disturbed ground). Mention viewpoint only if obvious.\n'
        '- Other: for diagram/chart/table image/technical drawing, state figure type and primary visible components, variables, or labeled elements. Include readable figure-type labels (for example cross-section, plan view, workflow) when present.\n\n'
        'Summary rules for search:\n'
        f'- Max {summary_limit} characters, 1-3 concise sentences, search-friendly.\n'
        '- Include high-value searchable terms visible in the image and context (site features, mining infrastructure, activity type, environmental features, labels, units).\n'
        '- Keep concise; no narrative.\n\n'
        'Category rules:\n'
        '- Choose exactly one category from this list: map, site_photo, cross_section, plan_view, diagram, chart_graph, technical_drawing, other.\n'
        '- Prefer map/site_photo when clearly visible; use other only when none fit.\n\n'
        'Suggested process: classify image as map, scenery photo, or other; then apply the corresponding caption rule.\n\n'
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
            'content': 'Return strict JSON with keys caption, summary, and category only. Output must be valid JSON.',
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
        return {'caption': '', 'summary': '', 'category': ''}

    return {
        'caption': _clean_text(payload.get('caption')) or '',
        'summary': _clean_text(payload.get('summary')) or '',
        'category': _normalize_generated_category(payload.get('category')) or '',
    }


def _normalize_generated_category(value: Any) -> Optional[str]:
    cleaned = _clean_text(value)
    if not cleaned:
        return None

    normalized = cleaned.strip().lower().replace('-', '_').replace(' ', '_')
    if normalized in MULTIMODAL_CATEGORY_VALUES:
        return normalized
    return None


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
            rotation_degrees, rotation_source = _determine_rotation_degrees(
                page=page,
                clip_rect=clip,
                page_number=page_number,
                page_rotation_hints=page_rotation_hints,
            )
            if rotation_degrees:
                image = Image.frombytes("RGB", [pixmap.width, pixmap.height], pixmap.samples)
                image = image.rotate(rotation_degrees, expand=True)
                png_buffer = io.BytesIO()
                image.save(png_buffer, format="PNG")
                png_bytes = png_buffer.getvalue()
            else:
                png_bytes = pixmap.tobytes("png")

            logger.debug(
                'Artifact upload rotation decision artifact_id=%s page_number=%s source=%s degrees=%s',
                artifact_id,
                page_number,
                rotation_source,
                rotation_degrees,
            )
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


def _extract_page_rotation_hints(analyze_result) -> dict[int, int]:
    hints: dict[int, int] = {}
    for page in getattr(analyze_result, 'pages', None) or []:
        page_number = getattr(page, 'page_number', None)
        if not page_number:
            continue

        normalized = _normalize_di_angle_to_quadrant(getattr(page, 'angle', None))
        if normalized is None:
            continue
        hints[int(page_number)] = normalized

    return hints


def _normalize_di_angle_to_quadrant(angle, deadband_degrees: float = 10.0) -> Optional[int]:
    try:
        raw_angle = float(angle)
    except (TypeError, ValueError):
        return None

    normalized_angle = ((raw_angle + 180.0) % 360.0) - 180.0
    if abs(normalized_angle) <= deadband_degrees:
        return 0

    snapped = int(round(normalized_angle / 90.0) * 90)
    return snapped % 360


def _determine_rotation_degrees(
    page,
    clip_rect,
    page_number: Optional[int],
    page_rotation_hints: Optional[dict[int, int]],
) -> tuple[int, str]:
    if page_number and page_rotation_hints and page_number in page_rotation_hints:
        return int(page_rotation_hints[page_number]), 'di_page_angle'

    fallback_rotation, reason = _choose_rotation_degrees_from_text(page, clip_rect)
    if fallback_rotation:
        return fallback_rotation, reason

    return 0, 'none'


def _choose_rotation_degrees_from_text(page: fitz.Page, clip_rect: fitz.Rect) -> tuple[int, str]:
    text_dict = page.get_text("dict", clip=clip_rect)
    vector_x = 0.0
    vector_y = 0.0
    weighted_line_count = 0

    for block in text_dict.get("blocks", []):
        if int(block.get("type", 1)) != 0:
            continue

        for line in block.get("lines", []):
            direction = line.get("dir", (1.0, 0.0))
            if not isinstance(direction, (list, tuple)) or len(direction) != 2:
                continue

            dx = float(direction[0])
            dy = float(direction[1])
            text_length = sum(
                len(str(span.get("text", "")).strip())
                for span in line.get("spans", [])
            )
            if text_length <= 0:
                continue

            vector_x += dx * text_length
            vector_y += dy * text_length
            weighted_line_count += text_length

    if weighted_line_count > 0:
        if abs(vector_y) > abs(vector_x):
            if vector_y > 0:
                return 90, "text_direction_vertical_down"
            return 270, "text_direction_vertical_up"
        return 0, "text_direction_left_to_right"

    if clip_rect.height > clip_rect.width:
        return 90, "aspect_ratio_fallback"
    return 0, "no_rotation_needed"


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


def _categorize_artifact(
    artifact_type: Optional[str],
    caption: Optional[str],
    description: Optional[str],
    summary: Optional[str],
    footnotes: Optional[List[str]] = None,
) -> str:
    if artifact_type == 'table':
        return 'table'

    text_parts = [caption, description, summary]
    if footnotes:
        text_parts.extend(str(note) for note in footnotes if note)
    normalized_text = " ".join(part for part in text_parts if part).lower()
    if not normalized_text:
        return 'other'

    if re.search(
        r'\b(map|site map|location map|orthophoto|aerial map|topographic|north arrow|scale bar|legend)\b',
        normalized_text,
    ):
        return 'map'
    if re.search(
        r'\b(photo|photograph|site photo|ground-level|ground level|landscape|scenery|drone)\b',
        normalized_text,
    ):
        return 'site_photo'
    if re.search(r'\b(cross-section|cross section|profile)\b', normalized_text):
        return 'cross_section'
    if re.search(r'\b(plan view|site plan|layout plan|general arrangement)\b', normalized_text):
        return 'plan_view'
    if re.search(r'\b(flowchart|workflow|process flow|schematic|diagram)\b', normalized_text):
        return 'diagram'
    if re.search(r'\b(chart|graph|plot|histogram|trend)\b', normalized_text):
        return 'chart_graph'
    if re.search(r'\b(drawing|elevation|detail drawing|technical drawing)\b', normalized_text):
        return 'technical_drawing'

    return 'other'
