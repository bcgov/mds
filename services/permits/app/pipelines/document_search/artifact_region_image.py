import io
from typing import Optional

import fitz
from app.pipelines.document_search.artifact_chunk_builder import coerce_float
from PIL import Image


def extract_primary_region_metadata(bounding_regions: list) -> tuple:
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


def build_region_upload_payload(
    source_pdf_path: Optional[str],
    artifact_id: str,
    page_number: Optional[int],
    bounding_box: Optional[dict],
    page_rotation_hints: Optional[dict[int, int]] = None,
    *,
    logger,
    choose_rotation_degrees_from_text_fn,
) -> Optional[dict]:
    if not source_pdf_path or not page_number or not bounding_box:
        logger.warning(
            'Skipping region upload payload for artifact_id=%s: missing source_pdf_path/page_number/bounding_box.',
            artifact_id,
        )
        return None

    left = coerce_float(bounding_box.get('left'))
    top = coerce_float(bounding_box.get('top'))
    right = coerce_float(bounding_box.get('right'))
    bottom = coerce_float(bounding_box.get('bottom'))
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
            rotation_degrees, rotation_source = determine_rotation_degrees(
                page=page,
                clip_rect=clip,
                page_number=page_number,
                page_rotation_hints=page_rotation_hints,
                choose_rotation_degrees_from_text_fn=choose_rotation_degrees_from_text_fn,
            )
            if rotation_degrees:
                image = Image.frombytes('RGB', [pixmap.width, pixmap.height], pixmap.samples)
                image = image.rotate(rotation_degrees, expand=True)
                png_buffer = io.BytesIO()
                image.save(png_buffer, format='PNG')
                png_bytes = png_buffer.getvalue()
            else:
                png_bytes = pixmap.tobytes('png')

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


def extract_page_rotation_hints(analyze_result) -> dict[int, int]:
    hints: dict[int, int] = {}
    for page in getattr(analyze_result, 'pages', None) or []:
        page_number = getattr(page, 'page_number', None)
        if not page_number:
            continue

        normalized = normalize_di_angle_to_quadrant(getattr(page, 'angle', None))
        if normalized is None:
            continue
        hints[int(page_number)] = normalized

    return hints


def normalize_di_angle_to_quadrant(angle, deadband_degrees: float = 10.0) -> Optional[int]:
    try:
        raw_angle = float(angle)
    except (TypeError, ValueError):
        return None

    normalized_angle = ((raw_angle + 180.0) % 360.0) - 180.0
    if abs(normalized_angle) <= deadband_degrees:
        return 0

    snapped = int(round(normalized_angle / 90.0) * 90)
    return snapped % 360


def determine_rotation_degrees(
    page,
    clip_rect,
    page_number: Optional[int],
    page_rotation_hints: Optional[dict[int, int]],
    choose_rotation_degrees_from_text_fn,
) -> tuple[int, str]:
    if page_number and page_rotation_hints and page_number in page_rotation_hints:
        return int(page_rotation_hints[page_number]), 'di_page_angle'

    fallback_rotation, reason = choose_rotation_degrees_from_text_fn(page, clip_rect)
    if fallback_rotation:
        return fallback_rotation, reason

    return 0, 'none'


def choose_rotation_degrees_from_text(page: fitz.Page, clip_rect: fitz.Rect) -> tuple[int, str]:
    text_dict = page.get_text('dict', clip=clip_rect)
    vector_x = 0.0
    vector_y = 0.0
    weighted_line_count = 0

    for block in text_dict.get('blocks', []):
        if int(block.get('type', 1)) != 0:
            continue

        for line in block.get('lines', []):
            direction = line.get('dir', (1.0, 0.0))
            if not isinstance(direction, (list, tuple)) or len(direction) != 2:
                continue

            dx = float(direction[0])
            dy = float(direction[1])
            text_length = sum(len(str(span.get('text', '')).strip()) for span in line.get('spans', []))
            if text_length <= 0:
                continue

            vector_x += dx * text_length
            vector_y += dy * text_length
            weighted_line_count += text_length

    if weighted_line_count > 0:
        if abs(vector_y) > abs(vector_x):
            if vector_y > 0:
                return 90, 'text_direction_vertical_down'
            return 270, 'text_direction_vertical_up'
        return 0, 'text_direction_left_to_right'

    if clip_rect.height > clip_rect.width:
        return 90, 'aspect_ratio_fallback'
    return 0, 'no_rotation_needed'
