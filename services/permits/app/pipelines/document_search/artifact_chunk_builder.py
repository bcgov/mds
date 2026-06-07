import hashlib
import json
import re
from typing import Any, List, Optional

from tabulate import tabulate

from app.pipelines.document_search.components.document_chunker import (
    DocumentChunkMetadata,
)

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


def build_artifact_search_chunks(artifacts: List[dict], chunk_metadata: DocumentChunkMetadata) -> List[dict]:
    chunks = []
    for artifact in artifacts:
        if artifact.get('type') == 'table':
            chunk = build_table_chunk(artifact, chunk_metadata)
        else:
            chunk = build_figure_chunk(artifact, chunk_metadata)
        if not chunk:
            continue
        chunks.append(chunk)

    return chunks


def build_table_chunk(artifact: dict, chunk_metadata: DocumentChunkMetadata) -> Optional[dict]:
    content = artifact.get('content') or {}
    headers = content.get('headers') or []
    rows = content.get('rows') or []
    table_markdown = content.get('markdown') or build_table_markdown(headers, rows)
    content_text = _table_content_text(content, headers, rows, artifact.get('page_number'))
    if not content_text:
        return None
    return _artifact_chunk(artifact, chunk_metadata, content_text, table_markdown)


def build_figure_chunk(artifact: dict, chunk_metadata: DocumentChunkMetadata) -> Optional[dict]:
    content = artifact.get('content') or {}
    content_text = _figure_content_text(artifact.get('type') or 'artifact', content, artifact.get('page_number'))
    if not content_text:
        return None
    return _artifact_chunk(artifact, chunk_metadata, content_text, None)


def _table_content_text(content: dict, headers: List[str], rows: List[dict], page_number) -> str:
    text_parts = []
    if content.get('caption'):
        text_parts.append(f"Table caption: {content.get('caption')}")
    if content.get('category'):
        text_parts.append(f"Table category: {content.get('category')}")
    if page_number:
        text_parts.append(f'Page: {page_number}')
    if headers:
        text_parts.append(f"Headers: {', '.join(str(header) for header in headers if header)}")
    for row in rows:
        row_text = ', '.join(f'{key}: {value}' for key, value in row.items())
        if row_text:
            text_parts.append(row_text)
    return '\n'.join(text_parts).strip()


def _figure_content_text(artifact_type: str, content: dict, page_number) -> str:
    artifact_label = artifact_type.title()
    text_parts = []
    for field_name, label in (
        ('summary', 'summary'),
        ('caption', 'caption'),
        ('category', 'category'),
        ('description', 'description'),
    ):
        if content.get(field_name):
            text_parts.append(f'{artifact_label} {label}: {content.get(field_name)}')
    if page_number:
        text_parts.append(f'Page: {page_number}')
    for footnote in content.get('footnotes') or []:
        if footnote:
            text_parts.append(f'Footnote: {footnote}')
    return '\n'.join(text_parts).strip()


def _artifact_chunk(
    artifact: dict,
    chunk_metadata: DocumentChunkMetadata,
    content_text: str,
    table_markdown: Optional[str],
) -> dict:
    content = artifact.get('content') or {}
    bounding_box = artifact.get('bounding_box') or {}
    artifact_type = artifact.get('type')
    return {
        'id': make_artifact_chunk_id(
            chunk_metadata.now_application_guid,
            chunk_metadata.document_manager_guid,
            artifact_type or 'artifact',
            artifact.get('artifact_id', ''),
        ),
        'content': content_text,
        'now_application_guid': chunk_metadata.now_application_guid,
        'mine_guid': chunk_metadata.mine_guid,
        'document_manager_guid': chunk_metadata.document_manager_guid,
        'document_name': chunk_metadata.document_name,
        'document_type': chunk_metadata.document_type,
        'submitted_date': chunk_metadata.submitted_date or None,
        'artifact_type': artifact_type,
        'artifact_id': artifact.get('artifact_id'),
        'artifact_page_number': artifact.get('page_number'),
        'artifact_bounding_box_left': coerce_float(bounding_box.get('left')),
        'artifact_bounding_box_top': coerce_float(bounding_box.get('top')),
        'artifact_bounding_box_right': coerce_float(bounding_box.get('right')),
        'artifact_bounding_box_bottom': coerce_float(bounding_box.get('bottom')),
        'artifact_table_markdown': table_markdown,
        'artifact_category': content.get('category'),
        'artifact_caption': content.get('caption'),
        'artifact_summary': content.get('summary'),
        'caption_source': content.get('caption_source'),
        'summary_source': content.get('summary_source'),
    }


def make_artifact_chunk_id(
    now_application_guid: str,
    document_manager_guid: str,
    artifact_type: str,
    artifact_id: str,
) -> str:
    key = f'{now_application_guid}:{document_manager_guid}:{artifact_type}:{artifact_id}'
    return hashlib.sha256(key.encode()).hexdigest()[:16]


def build_table_markdown(headers: List[str], row_payload: List[dict]) -> Optional[str]:
    raw_headers = [(header if header else f'column_{idx + 1}') for idx, header in enumerate(headers or [])]

    if not raw_headers and row_payload:
        raw_headers = list(row_payload[0].keys())

    if not raw_headers:
        return None

    rows = [[row.get(field, '') for field in raw_headers] for row in row_payload]
    return tabulate(rows, headers=raw_headers, tablefmt='github', disable_numparse=True)


def coerce_float(value: Any) -> Optional[float]:
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def clean_text(value: Any) -> Optional[str]:
    if value is None:
        return None
    cleaned = re.sub(r'\s+', ' ', str(value)).strip()
    return cleaned or None


def truncate_summary(text: str, summary_max_chars: int) -> str:
    limit = max(80, summary_max_chars)
    if len(text) <= limit:
        return text
    trimmed = text[:limit].rstrip(' .')
    return f'{trimmed}...'


def normalize_generated_category(value: Any) -> Optional[str]:
    cleaned = clean_text(value)
    if not cleaned:
        return None

    normalized = cleaned.strip().lower().replace('-', '_').replace(' ', '_')
    if normalized in MULTIMODAL_CATEGORY_VALUES:
        return normalized
    return None


def parse_json_object(text: str) -> dict:
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


def categorize_artifact(
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
    normalized_text = ' '.join(part for part in text_parts if part).lower()
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
