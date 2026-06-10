import io
import logging
from typing import Optional

import fitz
from app.pipelines.document_search.artifact_chunk_builder import coerce_float
from PIL import Image

logger = logging.getLogger(__name__)
PDF_POINTS_PER_INCH = 72
RENDER_SCALE = 2


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
) -> Optional[dict]:
    """Render a cropped artifact region from the source PDF as PNG bytes.

    Bounding boxes from Document Intelligence are in inches, while PyMuPDF
    coordinates are in points, so we convert using 72 points per inch.
    """
    if not source_pdf_path or not page_number or not bounding_box:
        logger.warning(
            'Skipping region upload payload for artifact_id=%s: missing source_pdf_path/page_number/bounding_box.',
            artifact_id,
        )
        return None

    clip = _build_clip_rect(bounding_box)
    if clip is None:
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
            clip = clip & page.rect
            if clip.width <= 0 or clip.height <= 0:
                logger.warning(
                    'Skipping region upload payload for artifact_id=%s: empty clip after intersection (clip=%s page_rect=%s).',
                    artifact_id,
                    clip,
                    page.rect,
                )
                return None

            # Render at 2x to preserve text legibility for multimodal prompts.
            pixmap = page.get_pixmap(matrix=fitz.Matrix(RENDER_SCALE, RENDER_SCALE), clip=clip, alpha=False)
            rotation_degrees, rotation_source = determine_rotation_degrees(
                page=page,
                clip_rect=clip,
                page_number=page_number,
                page_rotation_hints=page_rotation_hints,
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


def _build_clip_rect(bounding_box: dict) -> Optional[fitz.Rect]:
    left = coerce_float(bounding_box.get('left'))
    top = coerce_float(bounding_box.get('top'))
    right = coerce_float(bounding_box.get('right'))
    bottom = coerce_float(bounding_box.get('bottom'))
    if left is None or top is None or right is None or bottom is None:
        return None

    return fitz.Rect(
        left * PDF_POINTS_PER_INCH,
        top * PDF_POINTS_PER_INCH,
        right * PDF_POINTS_PER_INCH,
        bottom * PDF_POINTS_PER_INCH,
    )


def extract_page_rotation_hints(analyze_result) -> dict[int, int]:
    """Extract per-page rotation hints from DI page angles.

    Returned values are snapped to right angles (0/90/180/270) so downstream
    rendering can apply deterministic rotations.
    """
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
    """Normalize a raw DI angle to the nearest right-angle quadrant.

    Small offsets around 0 degrees are treated as unrotated via deadband to
    avoid unnecessary image rotations caused by minor OCR noise.
    """
    try:
        raw_angle = float(angle)
    except (TypeError, ValueError):
        return None

    # Fold into [-180, 180) so snapping works consistently for any input angle.
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
) -> tuple[int, str]:
    """Choose rotation source with explicit precedence.

    Prefer DI page-angle hints when available; otherwise infer from text
    direction inside the clipped region.
    """
    if page_number and page_rotation_hints and page_number in page_rotation_hints:
        return int(page_rotation_hints[page_number]), 'di_page_angle'

    fallback_rotation, reason = choose_rotation_degrees_from_text(page, clip_rect)
    if fallback_rotation:
        return fallback_rotation, reason

    return 0, 'none'


def choose_rotation_degrees_from_text(page: fitz.Page, clip_rect: fitz.Rect) -> tuple[int, str]:
    """Infer rotation by aggregating line direction vectors from extracted text.

    We weight each line by visible text length so tiny labels do not dominate the
    decision. If no text is available, fall back to region aspect ratio.
    """
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
        # Dominant vertical vector indicates portrait text flow that needs
        # rotation for model-friendly left-to-right reading.
        if abs(vector_y) > abs(vector_x):
            if vector_y > 0:
                return 90, 'text_direction_vertical_down'
            return 270, 'text_direction_vertical_up'
        return 0, 'text_direction_left_to_right'

    # Last-resort heuristic when no text is detectable in the clip.
    if clip_rect.height > clip_rect.width:
        return 90, 'aspect_ratio_fallback'
    return 0, 'no_rotation_needed'
