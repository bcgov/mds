import tempfile
from pathlib import Path
from typing import Any, Dict, List, Optional

import fitz
import json
from PIL import Image
from azure.ai.documentintelligence import DocumentIntelligenceClient
from azure.ai.documentintelligence.models import AnalyzeResult
from azure.core.credentials import AzureKeyCredential

from .cache import (
    compute_cache_key,
    compute_file_sha256,
    load_cache_entry,
    safe_as_dict,
    write_cache_entry,
)
from .models import (
    CandidateTable,
    DEFAULT_MODEL_ID,
    ExtractedTable,
    ExtractionProfile,
    PDFTableExtractionError,
    PrefilterResult,
    ProfileExtractionResult,
    candidate_table_from_dict,
    extracted_table_from_dict,
    profile_extraction_result_from_dict,
)
from .table_ops import (
    build_candidate_tables,
    build_headers,
    build_markdown_table,
    build_row_dicts,
    build_table_grid,
    run_profile_extraction,
)


def _clean_context_text(value: Any) -> str:
    return " ".join(str(value or "").split()).strip()


def _normalize_table_note(note: Any) -> Dict[str, Any]:
    note_payload = safe_as_dict(note)
    if isinstance(note_payload, dict):
        content = note_payload.get("content") or note_payload.get("text")
        if content is not None:
            note_payload["content"] = _clean_context_text(content)
        return note_payload
    return {"content": _clean_context_text(note_payload)}


def _extract_table_caption(table: Any) -> Optional[Dict[str, Any]]:
    caption = getattr(table, "caption", None)
    if not caption:
        return None

    caption_payload = _normalize_table_note(caption)
    if not caption_payload.get("content"):
        return None
    return caption_payload


def _extract_table_footnotes(table: Any) -> List[Dict[str, Any]]:
    extracted_footnotes: List[Dict[str, Any]] = []
    for footnote in getattr(table, "footnotes", None) or []:
        footnote_payload = _normalize_table_note(footnote)
        if footnote_payload.get("content"):
            extracted_footnotes.append(footnote_payload)
    return extracted_footnotes


def extract_tables_from_result(
    result: AnalyzeResult,
    source_file: str,
    header_rows: int = 1,
    page_number_map: Optional[Dict[int, int]] = None,
) -> List[ExtractedTable]:
    extracted_tables = []

    for table_index, table in enumerate(result.tables or []):
        grid = build_table_grid(table)
        headers = build_headers(grid, header_rows)
        rows = build_row_dicts(grid, headers, header_rows)
        filtered_page_number = None
        page_number = None
        bounding_regions = getattr(table, "bounding_regions", None) or []
        if bounding_regions:
            filtered_page_number = getattr(bounding_regions[0], "page_number", None)
            if filtered_page_number is not None and page_number_map:
                page_number = page_number_map.get(
                    filtered_page_number, filtered_page_number
                )
            else:
                page_number = filtered_page_number

        table_id = f"{Path(source_file).stem}_p{page_number or 0}_t{table_index + 1}"
        extracted_tables.append(
            ExtractedTable(
                table_id=table_id,
                source_file=source_file,
                page_number=page_number,
                table_index=table_index,
                row_count=getattr(table, "row_count", 0) or 0,
                column_count=getattr(table, "column_count", 0) or 0,
                header_rows=header_rows,
                headers=headers,
                rows=rows,
                markdown=build_markdown_table(headers, rows),
                metadata={
                    "bounding_regions": safe_as_dict(
                        getattr(table, "bounding_regions", [])
                    ),
                    "cell_count": len(getattr(table, "cells", []) or []),
                    "caption": _extract_table_caption(table),
                    "footnotes": _extract_table_footnotes(table),
                    "filtered_page_number": filtered_page_number,
                    "original_page_number": page_number,
                    "raw_grid": grid,
                },
            )
        )

    return extracted_tables


def detect_table_pages(file_path: Path) -> List[int]:
    table_pages = []
    document = fitz.open(file_path)
    try:
        for page_index in range(document.page_count):
            page = document[page_index]
            table_finder = page.find_tables()
            if table_finder and len(table_finder.tables) > 0:
                table_pages.append(page_index + 1)
    finally:
        document.close()

    return table_pages


def build_filtered_pdf(
    source_pdf: Path, page_numbers: List[int], output_pdf: Path
) -> Path:
    source_document = fitz.open(source_pdf)
    filtered_document = fitz.open()
    try:
        for page_number in page_numbers:
            zero_based_page_index = page_number - 1
            filtered_document.insert_pdf(
                source_document,
                from_page=zero_based_page_index,
                to_page=zero_based_page_index,
            )

        filtered_document.save(output_pdf)
    finally:
        filtered_document.close()
        source_document.close()

    return output_pdf


def write_selected_table_images(
    selected_tables: List[CandidateTable],
    source_pdf: Path,
    output_dir: Path,
    include_footnotes: bool = False,
    include_captions: bool = False,
    context_distance_pts: float = 72.0,
    horizontal_tolerance_pts: float = 36.0,
    padding_pts: float = 0.0,
    artifact_suffix: str | None = None,
) -> Optional[Path]:
    if not selected_tables:
        return None

    output_dir.mkdir(parents=True, exist_ok=True)
    suffix = f"_{artifact_suffix}" if artifact_suffix else ""
    image_dir = output_dir / f"{source_pdf.stem}_selected_table_images{suffix}"
    image_dir.mkdir(parents=True, exist_ok=True)
    manifest_path = output_dir / f"{source_pdf.stem}_selected_table_images{suffix}.json"

    manifest: List[Dict[str, Any]] = []
    document = fitz.open(source_pdf)
    try:
        max_context_distance = max(0.0, float(context_distance_pts))
        horizontal_tolerance = max(0.0, float(horizontal_tolerance_pts))
        padding = max(0.0, float(padding_pts))

        def choose_rotation_degrees(
            page: fitz.Page, clip_rect: fitz.Rect
        ) -> tuple[int, str]:
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
                # Rotate to make dominant text flow left-to-right horizontally.
                if abs(vector_y) > abs(vector_x):
                    if vector_y > 0:
                        return 90, "text_direction_vertical_down"
                    return 270, "text_direction_vertical_up"
                return 0, "text_direction_left_to_right"

            if clip_rect.height > clip_rect.width:
                return 90, "aspect_ratio_fallback"
            return 0, "no_rotation_needed"

        for table in selected_tables:
            page_number = table.page_number
            if (
                page_number is None
                or page_number < 1
                or page_number > document.page_count
            ):
                manifest.append(
                    {
                        "table_id": table.candidate_id,
                        "page_number": page_number,
                        "bbox": table.bbox,
                        "image_path": None,
                        "note": "Page number was not available or was out of range.",
                    }
                )
                continue

            page = document[page_number - 1]
            if not table.bbox or len(table.bbox) != 4:
                manifest.append(
                    {
                        "table_id": table.candidate_id,
                        "page_number": page_number,
                        "bbox": table.bbox,
                        "image_path": None,
                        "note": "Table bounding box was not available; table image was not created.",
                    }
                )
                continue

            base_clip = fitz.Rect(
                table.bbox[0] * 72,
                table.bbox[1] * 72,
                table.bbox[2] * 72,
                table.bbox[3] * 72,
            )
            clip = fitz.Rect(base_clip)

            if padding > 0:
                clip = fitz.Rect(
                    clip.x0 - padding,
                    clip.y0 - padding,
                    clip.x1 + padding,
                    clip.y1 + padding,
                )

            included_footnote_blocks = 0
            included_caption_blocks = 0
            if (include_footnotes or include_captions) and max_context_distance > 0:
                for block in page.get_text("blocks"):
                    if len(block) < 7:
                        continue

                    block_type = int(block[6])
                    block_text = str(block[4]).strip()
                    if block_type != 0 or not block_text:
                        continue

                    block_rect = fitz.Rect(block[0], block[1], block[2], block[3])
                    overlap_x = min(
                        clip.x1 + horizontal_tolerance, block_rect.x1
                    ) - max(clip.x0 - horizontal_tolerance, block_rect.x0)
                    if overlap_x <= 0:
                        continue

                    if include_footnotes:
                        below_gap = block_rect.y0 - clip.y1
                        if 0 <= below_gap <= max_context_distance:
                            clip.y1 = max(clip.y1, block_rect.y1)
                            included_footnote_blocks += 1

                    if include_captions:
                        above_gap = clip.y0 - block_rect.y1
                        if 0 <= above_gap <= max_context_distance:
                            clip.y0 = min(clip.y0, block_rect.y0)
                            included_caption_blocks += 1

            clip = clip & page.rect
            if clip.width <= 0 or clip.height <= 0:
                manifest.append(
                    {
                        "table_id": table.candidate_id,
                        "page_number": page_number,
                        "bbox": table.bbox,
                        "image_path": None,
                        "note": "Table bounding box was outside page bounds; table image was not created.",
                    }
                )
                continue

            pixmap = page.get_pixmap(matrix=fitz.Matrix(2, 2), clip=clip, alpha=False)
            image_path = image_dir / f"{table.candidate_id}.png"

            image = Image.frombytes(
                "RGB", [pixmap.width, pixmap.height], pixmap.samples
            )
            rotation_degrees, rotation_reason = choose_rotation_degrees(page, clip)
            if rotation_degrees:
                image = image.rotate(rotation_degrees, expand=True)
            rotated_to_horizontal = rotation_degrees in {90, 270}
            image.save(image_path)

            manifest.append(
                {
                    "table_id": table.candidate_id,
                    "page_number": page_number,
                    "bbox": table.bbox,
                    "crop_bbox_points": [
                        round(clip.x0, 2),
                        round(clip.y0, 2),
                        round(clip.x1, 2),
                        round(clip.y1, 2),
                    ],
                    "crop_bbox": [
                        round(clip.x0 / 72, 4),
                        round(clip.y0 / 72, 4),
                        round(clip.x1 / 72, 4),
                        round(clip.y1 / 72, 4),
                    ],
                    "rotated_to_horizontal": rotated_to_horizontal,
                    "rotation_degrees": rotation_degrees,
                    "rotation_reason": rotation_reason,
                    "image_size_px": [image.width, image.height],
                    "image_path": str(image_path),
                    "note": (
                        "Cropped to table bounding box"
                        + (f" with {padding:.1f}pt padding" if padding > 0 else "")
                        + (
                            f", included {included_footnote_blocks} nearby footnote block(s)"
                            if include_footnotes
                            else ""
                        )
                        + (
                            f", included {included_caption_blocks} nearby caption block(s)"
                            if include_captions
                            else ""
                        )
                        + (
                            f", rotated {rotation_degrees} degrees ({rotation_reason})"
                            if rotation_degrees
                            else ""
                        )
                        + "."
                    ),
                }
            )
    finally:
        document.close()

    with open(manifest_path, "w", encoding="utf-8") as handle:
        json.dump(manifest, handle, indent=2)

    return manifest_path


def prefilter_pdf_to_table_pages(
    source_pdf: Path,
    output_dir: Path,
    use_prefilter: bool,
    cache_dir: Optional[Path] = None,
    use_cache: bool = True,
) -> PrefilterResult:
    if not use_prefilter:
        return PrefilterResult(
            source_pdf=source_pdf,
            analysis_pdf=source_pdf,
            table_pages=[],
            filtered_to_original_page_map={},
            used_prefilter=False,
        )

    table_pages: List[int]
    cache_key = None
    if use_cache and cache_dir is not None:
        cache_key = compute_cache_key(
            "prefilter",
            {
                "source_pdf": str(source_pdf),
                "source_sha256": compute_file_sha256(source_pdf),
                "use_prefilter": use_prefilter,
            },
        )
        cached_payload = load_cache_entry(cache_dir, "prefilter", cache_key)
        if cached_payload is not None:
            table_pages = [
                int(page_number)
                for page_number in cached_payload.get("table_pages", [])
            ]
        else:
            table_pages = detect_table_pages(source_pdf)
            write_cache_entry(
                cache_dir,
                "prefilter",
                cache_key,
                {"table_pages": table_pages},
            )
    else:
        table_pages = detect_table_pages(source_pdf)

    if not table_pages:
        return PrefilterResult(
            source_pdf=source_pdf,
            analysis_pdf=source_pdf,
            table_pages=[],
            filtered_to_original_page_map={},
            used_prefilter=False,
        )

    output_dir.mkdir(parents=True, exist_ok=True)
    filtered_pdf = output_dir / f"{source_pdf.stem}_table_pages_only.pdf"
    build_filtered_pdf(source_pdf, table_pages, filtered_pdf)

    return PrefilterResult(
        source_pdf=source_pdf,
        analysis_pdf=filtered_pdf,
        table_pages=table_pages,
        filtered_to_original_page_map={
            filtered_page_number: original_page_number
            for filtered_page_number, original_page_number in enumerate(
                table_pages, start=1
            )
        },
        used_prefilter=True,
    )


def analyze_pdf_tables(
    file_path: Path,
    endpoint: str,
    api_key: str,
    api_version: str,
    header_rows: int = 1,
    model_id: str = DEFAULT_MODEL_ID,
    use_prefilter: bool = True,
    prefilter_output_dir: Optional[Path] = None,
    prefilter_result: Optional[PrefilterResult] = None,
    cache_dir: Optional[Path] = None,
    use_cache: bool = True,
) -> List[ExtractedTable]:
    if not file_path.exists():
        raise PDFTableExtractionError(f"PDF file does not exist: {file_path}")

    cleanup_analysis_pdf = False
    if prefilter_result is None:
        if prefilter_output_dir is None:
            prefilter_output_dir = Path(tempfile.mkdtemp(prefix="table_prefilter_"))
            cleanup_analysis_pdf = True

        prefilter_result = prefilter_pdf_to_table_pages(
            source_pdf=file_path,
            output_dir=prefilter_output_dir,
            use_prefilter=use_prefilter,
            cache_dir=cache_dir,
            use_cache=use_cache,
        )

    if use_prefilter and not prefilter_result.table_pages:
        # Local table detection can miss scanned/image-only pages. Fall back to
        # sending the full PDF to Document Intelligence so its OCR can still
        # detect tables.
        prefilter_result = PrefilterResult(
            source_pdf=file_path,
            analysis_pdf=file_path,
            table_pages=[],
            filtered_to_original_page_map={},
            used_prefilter=False,
        )

    if not endpoint:
        raise PDFTableExtractionError("DOCUMENTINTELLIGENCE_ENDPOINT is not set")
    if not api_key:
        raise PDFTableExtractionError("DOCUMENTINTELLIGENCE_API_KEY is not set")

    cache_key = None
    if use_cache and cache_dir is not None:
        cache_key = compute_cache_key(
            "document_intelligence",
            {
                "source_pdf": str(file_path),
                "source_sha256": compute_file_sha256(file_path),
                "header_rows": header_rows,
                "model_id": model_id,
                "use_prefilter": use_prefilter,
                "table_pages": prefilter_result.table_pages,
                "page_number_map": prefilter_result.filtered_to_original_page_map,
                "api_version": api_version,
            },
        )
        cached_payload = load_cache_entry(cache_dir, "document_intelligence", cache_key)
        if cached_payload is not None:
            return [
                extracted_table_from_dict(item)
                for item in cached_payload.get("tables", [])
            ]

    client = DocumentIntelligenceClient(
        endpoint=endpoint,
        credential=AzureKeyCredential(api_key),
        api_version=api_version,
    )

    with open(prefilter_result.analysis_pdf, "rb") as handle:
        poller = client.begin_analyze_document(model_id, body=handle)

    try:
        result = poller.result()
        extracted_tables = extract_tables_from_result(
            result,
            source_file=file_path.name,
            header_rows=header_rows,
            page_number_map=prefilter_result.filtered_to_original_page_map,
        )
        if use_cache and cache_dir is not None and cache_key is not None:
            write_cache_entry(
                cache_dir,
                "document_intelligence",
                cache_key,
                {"tables": [table.to_dict() for table in extracted_tables]},
            )
        return extracted_tables
    finally:
        if cleanup_analysis_pdf and prefilter_output_dir is not None:
            if (
                prefilter_result.used_prefilter
                and prefilter_result.analysis_pdf.exists()
            ):
                prefilter_result.analysis_pdf.unlink(missing_ok=True)
            prefilter_output_dir.rmdir()


def build_candidate_tables_cached(
    tables: List[ExtractedTable],
    cache_dir: Optional[Path],
    use_cache: bool,
    extractor: str = "azure_document_intelligence",
) -> List[CandidateTable]:
    if not use_cache or cache_dir is None:
        return build_candidate_tables(tables, extractor=extractor)

    cache_key = compute_cache_key(
        "candidate_tables",
        {
            "extractor": extractor,
            "tables": [table.to_dict() for table in tables],
        },
    )
    cached_payload = load_cache_entry(cache_dir, "candidate_tables", cache_key)
    if cached_payload is not None:
        return [
            candidate_table_from_dict(item)
            for item in cached_payload.get("candidate_tables", [])
        ]

    candidate_tables = build_candidate_tables(tables, extractor=extractor)
    write_cache_entry(
        cache_dir,
        "candidate_tables",
        cache_key,
        {"candidate_tables": [table.to_dict() for table in candidate_tables]},
    )
    return candidate_tables


def run_profile_extraction_cached(
    candidate_tables: List[CandidateTable],
    profile: ExtractionProfile,
    cache_dir: Optional[Path],
    use_cache: bool,
) -> ProfileExtractionResult:
    if not use_cache or cache_dir is None:
        return run_profile_extraction(candidate_tables, profile)

    cache_key = compute_cache_key(
        "profile_extraction",
        {
            "profile_name": profile.profile_name,
            "candidate_tables": [table.to_dict() for table in candidate_tables],
        },
    )
    cached_payload = load_cache_entry(cache_dir, "profile_extraction", cache_key)
    if cached_payload is not None:
        return profile_extraction_result_from_dict(cached_payload["result"])

    result = run_profile_extraction(candidate_tables, profile)
    write_cache_entry(
        cache_dir,
        "profile_extraction",
        cache_key,
        {"result": result.to_dict()},
    )
    return result
