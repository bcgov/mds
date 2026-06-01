import os
import re
from typing import Callable, List, Optional

from app.pipelines.document_search.artifact_chunk_builder import categorize_artifact


def extract_table_artifacts(
    analyze_result,
    doc_meta: dict,
    source_pdf_path: Optional[str] = None,
    page_rotation_hints: Optional[dict[int, int]] = None,
    *,
    extract_primary_region_metadata_fn: Callable,
    build_table_markdown_fn: Callable,
    build_table_upload_payload_fn: Callable,
    extract_caption_fn: Callable,
    extract_footnotes_fn: Callable,
    logger,
) -> List[dict]:
    table_artifacts = []
    document_manager_guid = doc_meta.get('document_manager_guid', '')

    for index, table in enumerate(analyze_result.tables or []):
        row_count = getattr(table, 'row_count', 0) or 0
        column_count = getattr(table, 'column_count', 0) or 0
        grid = [['' for _ in range(column_count)] for _ in range(row_count)]

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
            row_payload.append(
                {(headers[col_idx] or f'column_{col_idx + 1}'): row[col_idx] for col_idx in range(column_count)}
            )

        page_number, bounding_box = extract_primary_region_metadata_fn(
            getattr(table, 'bounding_regions', None) or []
        )

        artifact_id = f'{document_manager_guid}_p{page_number or 0}_t{index + 1}'
        table_markdown = build_table_markdown_fn(headers, row_payload)
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

        if upload_payload:
            table_artifact['_artifact_upload'] = upload_payload

        table_artifacts.append(table_artifact)

    return table_artifacts


def extract_figure_artifacts(
    analyze_result,
    doc_meta: dict,
    source_pdf_path: Optional[str] = None,
    page_rotation_hints: Optional[dict[int, int]] = None,
    *,
    extract_primary_region_metadata_fn: Callable,
    build_figure_upload_payload_fn: Callable,
    extract_caption_fn: Callable,
    extract_footnotes_fn: Callable,
) -> List[dict]:
    figure_artifacts = []
    document_manager_guid = doc_meta.get('document_manager_guid', '')
    paragraphs = getattr(analyze_result, 'paragraphs', None) or []

    for index, figure in enumerate(getattr(analyze_result, 'figures', None) or []):
        page_number, bounding_box = extract_primary_region_metadata_fn(
            getattr(figure, 'bounding_regions', None) or []
        )
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
