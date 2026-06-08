import logging
import os
import re
from typing import Callable, List, Optional

from app.pipelines.document_search.artifact_chunk_builder import (
    build_table_markdown,
    categorize_artifact,
)
from app.pipelines.document_search.artifact_region_image import (
    extract_primary_region_metadata,
)

logger = logging.getLogger(__name__)


def extract_table_artifacts(
    analyze_result,
    doc_meta: dict,
    source_pdf_path: Optional[str] = None,
    page_rotation_hints: Optional[dict[int, int]] = None,
    *,
    build_table_upload_payload_fn: Callable,
    extract_caption_fn: Callable,
    extract_footnotes_fn: Callable,
) -> List[dict]:
    table_artifacts = []
    document_manager_guid = doc_meta.get('document_manager_guid', '')

    for index, table in enumerate(analyze_result.tables or []):
        table_model = normalize_table(table)
        headers, row_payload = table_rows_for_artifact(table_model)

        page_number, bounding_box = extract_primary_region_metadata(getattr(table, 'bounding_regions', None) or [])

        artifact_id = f'{document_manager_guid}_p{page_number or 0}_t{index + 1}'
        table_markdown = build_table_markdown(headers, row_payload)
        upload_payload = None
        if is_table_binary_upload_enabled():
            upload_payload = build_table_upload_payload_fn(
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
                'caption': extract_caption_fn(table),
                'footnotes': extract_footnotes_fn(table),
                'cells': table_model['cells'],
            },
            'metadata': {
                'row_count': table_model['row_count'],
                'column_count': table_model['column_count'],
            },
            'extractor': {
                'name': 'di_layout_table_extractor',
                'version': 'v1',
            },
        }

        if upload_payload:
            table_artifact['_artifact_upload'] = upload_payload

        table_artifacts.append(table_artifact)

    return table_artifacts


def normalize_table(table) -> dict:
    row_count = getattr(table, 'row_count', 0) or 0
    column_count = getattr(table, 'column_count', 0) or 0
    grid = [['' for _ in range(column_count)] for _ in range(row_count)]
    cells = []

    for cell in getattr(table, 'cells', []) or []:
        normalized = normalize_table_cell(cell)
        cells.append(normalized)
        row_idx = normalized['row_index']
        col_idx = normalized['column_index']
        if row_idx is None or col_idx is None:
            continue
        if 0 <= row_idx < row_count and 0 <= col_idx < column_count:
            grid[row_idx][col_idx] = normalized['content']

    return {
        'row_count': row_count,
        'column_count': column_count,
        'grid': grid,
        'cells': cells,
    }


def normalize_table_cell(cell) -> dict:
    return {
        'row_index': getattr(cell, 'row_index', None),
        'column_index': getattr(cell, 'column_index', None),
        'row_span': getattr(cell, 'row_span', 1) or 1,
        'column_span': getattr(cell, 'column_span', 1) or 1,
        'kind': getattr(cell, 'kind', None),
        'content': getattr(cell, 'content', '') or '',
    }


def table_rows_for_artifact(table_model: dict) -> tuple[list, list]:
    grid = table_model['grid']
    column_count = table_model['column_count']
    header_indexes = header_row_indexes(table_model)
    header_row_index = header_indexes[-1] if header_indexes else 0
    headers = grid[header_row_index] if grid else []
    body_rows = [
        row for idx, row in enumerate(grid)
        if idx not in set(header_indexes or [header_row_index])
    ]
    return headers, [
        {(headers[col_idx] or f'column_{col_idx + 1}'): row[col_idx] for col_idx in range(column_count)}
        for row in body_rows
    ]


def header_row_indexes(table_model: dict) -> list:
    indexes = sorted({
        cell['row_index']
        for cell in table_model['cells']
        if cell.get('kind') in {'columnHeader', 'stubHead'} and cell.get('row_index') is not None
    })
    return indexes


def extract_figure_artifacts(
    analyze_result,
    doc_meta: dict,
    source_pdf_path: Optional[str] = None,
    page_rotation_hints: Optional[dict[int, int]] = None,
    *,
    build_figure_upload_payload_fn: Callable,
    extract_caption_fn: Callable,
    extract_footnotes_fn: Callable,
) -> List[dict]:
    figure_artifacts = []
    document_manager_guid = doc_meta.get('document_manager_guid', '')
    paragraphs = getattr(analyze_result, 'paragraphs', None) or []

    for index, figure in enumerate(getattr(analyze_result, 'figures', None) or []):
        page_number, bounding_box = extract_primary_region_metadata(getattr(figure, 'bounding_regions', None) or [])
        artifact_id = f'{document_manager_guid}_p{page_number or 0}_f{index + 1}'
        caption = extract_caption_fn(figure)
        description = extract_figure_description(figure, paragraphs) or caption
        footnotes = extract_footnotes_fn(figure)

        figure_artifacts.append(
            {
                'type': 'figure',
                'artifact_id': artifact_id,
                'page_number': page_number,
                'bounding_box': bounding_box,
                'content': {
                    'figure_index': index,
                    'caption': caption,
                    'description': description,
                    'footnotes': footnotes,
                    'category': categorize_artifact(
                        artifact_type='figure',
                        caption=caption,
                        description=description,
                        summary=None,
                        footnotes=footnotes,
                    ),
                },
                'metadata': {
                    'element_count': len(getattr(figure, 'elements', None) or []),
                },
                'extractor': {
                    'name': 'di_layout_figure_extractor',
                    'version': 'v1',
                },
            }
        )

        if is_figure_binary_upload_enabled():
            upload_payload = build_figure_upload_payload_fn(
                source_pdf_path=source_pdf_path,
                artifact_id=artifact_id,
                page_number=page_number,
                bounding_box=bounding_box,
                page_rotation_hints=page_rotation_hints,
            )
            if upload_payload:
                figure_artifacts[-1]['_artifact_upload'] = upload_payload

    return figure_artifacts


def extract_caption(table_or_figure):
    caption = getattr(table_or_figure, 'caption', None)
    if not caption:
        return None
    content = getattr(caption, 'content', None) or getattr(caption, 'text', None)
    return content


def extract_footnotes(table_or_figure):
    footnotes = []
    for note in getattr(table_or_figure, 'footnotes', None) or []:
        content = getattr(note, 'content', None) or getattr(note, 'text', None)
        if content:
            footnotes.append(content)
    return footnotes


def extract_figure_description(figure, paragraphs) -> Optional[str]:
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
        return '\n'.join(part for part in description_parts if part)

    return None


def is_figure_binary_upload_enabled() -> bool:
    value = os.getenv('DOCUMENT_ARTIFACT_ENABLE_FIGURE_BINARY_UPLOAD', 'true').strip().lower()
    return value in {'1', 'true', 'yes', 'on'}


def is_table_binary_upload_enabled() -> bool:
    value = os.getenv('DOCUMENT_ARTIFACT_ENABLE_TABLE_BINARY_UPLOAD', 'true').strip().lower()
    return value in {'1', 'true', 'yes', 'on'}
