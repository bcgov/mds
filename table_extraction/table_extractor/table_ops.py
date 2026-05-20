import re
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional

from .models import (
    CandidateTable,
    ExtractedTable,
    ExtractionProfile,
    FieldDefinition,
    FieldExtraction,
    PDFTableExtractionError,
    ProfileExtractionResult,
    TableQuality,
)


def clean_cell_content(value: Any) -> str:
    if value is None:
        return ""
    return " ".join(str(value).replace("\n", " ").split())


def normalize_token(value: str) -> str:
    lowered = clean_cell_content(value).lower()
    return re.sub(r"[^a-z0-9]+", " ", lowered).strip()


def try_parse_number(value: str) -> Optional[float]:
    cleaned = clean_cell_content(value)
    if not cleaned:
        return None

    normalized = cleaned.replace(",", "")
    normalized = normalized.replace("$", "")
    normalized = normalized.replace("ha", "")
    normalized = normalized.replace("tonnes", "")
    normalized = normalized.replace("tonne", "")
    normalized = normalized.strip()

    if normalized.startswith("(") and normalized.endswith(")"):
        normalized = f"-{normalized[1:-1]}"

    normalized = re.sub(r"\s+", "", normalized)
    if not normalized or normalized in {"", ".", "-", "+"}:
        return None
    if not re.fullmatch(r"[-+]?\d*(?:\.\d+)?", normalized):
        return None

    return float(normalized)


def build_table_grid(table: Any) -> List[List[str]]:
    row_count = getattr(table, "row_count", 0) or 0
    column_count = getattr(table, "column_count", 0) or 0
    grid = [["" for _ in range(column_count)] for _ in range(row_count)]

    for cell in getattr(table, "cells", []) or []:
        content = clean_cell_content(getattr(cell, "content", ""))
        row_index = getattr(cell, "row_index", 0) or 0
        column_index = getattr(cell, "column_index", 0) or 0
        row_span = getattr(cell, "row_span", 1) or 1
        column_span = getattr(cell, "column_span", 1) or 1

        for row_offset in range(row_span):
            for column_offset in range(column_span):
                target_row = row_index + row_offset
                target_column = column_index + column_offset
                if target_row >= row_count or target_column >= column_count:
                    continue
                if not grid[target_row][target_column]:
                    grid[target_row][target_column] = content

    return grid


def collapse_header_parts(parts: List[str]) -> List[str]:
    collapsed = []
    for part in parts:
        if part and part not in collapsed:
            collapsed.append(part)
    return collapsed


def build_headers(grid: List[List[str]], header_rows: int) -> List[str]:
    if not grid:
        return []

    header_depth = max(0, min(header_rows, len(grid)))
    column_count = len(grid[0])
    headers = []

    for column_index in range(column_count):
        parts = [
            clean_cell_content(grid[row_index][column_index])
            for row_index in range(header_depth)
            if column_index < len(grid[row_index])
        ]
        collapsed_parts = collapse_header_parts(parts)
        header = (
            " | ".join(collapsed_parts)
            if collapsed_parts
            else f"column_{column_index + 1}"
        )
        headers.append(header)

    deduped_headers = []
    seen = {}
    for header in headers:
        seen[header] = seen.get(header, 0) + 1
        if seen[header] == 1:
            deduped_headers.append(header)
        else:
            deduped_headers.append(f"{header}__{seen[header]}")

    return deduped_headers


def build_row_dicts(
    grid: List[List[str]], headers: List[str], header_rows: int
) -> List[Dict[str, str]]:
    rows = []
    data_rows = grid[min(max(header_rows, 0), len(grid)) :]

    for row in data_rows:
        normalized_row = [clean_cell_content(value) for value in row]
        if not any(normalized_row):
            continue
        rows.append(
            {header: normalized_row[index] for index, header in enumerate(headers)}
        )

    return rows


def build_markdown_table(headers: List[str], rows: List[Dict[str, str]]) -> str:
    if not headers:
        return ""

    escaped_headers = [header.replace("|", "\\|") for header in headers]
    lines = [
        "| " + " | ".join(escaped_headers) + " |",
        "| " + " | ".join(["---"] * len(headers)) + " |",
    ]

    for row in rows:
        values = [row.get(header, "").replace("|", "\\|") for header in headers]
        lines.append("| " + " | ".join(values) + " |")

    return "\n".join(lines)


def compute_table_quality(
    headers: List[str], rows: List[Dict[str, str]], raw_grid: List[List[str]]
) -> TableQuality:
    flattened_cells = [clean_cell_content(cell) for row in raw_grid for cell in row]
    total_cells = len(flattened_cells)
    empty_cells = sum(1 for cell in flattened_cells if not cell)
    numeric_cells = sum(
        1 for cell in flattened_cells if try_parse_number(cell) is not None
    )
    duplicate_headers = len(headers) - len(set(headers))
    populated_rows = sum(
        1 for row in rows if any(clean_cell_content(value) for value in row.values())
    )

    return TableQuality(
        empty_rate=(empty_cells / total_cells) if total_cells else 0.0,
        numeric_parse_rate=(numeric_cells / total_cells) if total_cells else 0.0,
        duplicate_header_rate=(duplicate_headers / len(headers)) if headers else 0.0,
        populated_row_rate=(populated_rows / len(rows)) if rows else 0.0,
    )


def classify_table_shape(headers: List[str], rows: List[Dict[str, str]]) -> str:
    normalized_headers = [
        normalize_token(header) for header in headers if normalize_token(header)
    ]
    header_text = " ".join(normalized_headers)
    year_header_count = sum(
        1 for header in normalized_headers if re.search(r"\b(?:19|20)\d{2}\b", header)
    )
    numeric_column_count = 0

    for header in headers:
        values = [try_parse_number(row.get(header, "")) for row in rows]
        if any(value is not None for value in values):
            numeric_column_count += 1

    label_header_present = any(
        token in header_text for token in ["metric", "description", "category", "item"]
    )
    if len(headers) <= 2 and label_header_present and numeric_column_count >= 1:
        return "key_value"
    if year_header_count >= 1 and numeric_column_count >= 1:
        return "time_series"
    if len(headers) >= 3 and numeric_column_count >= 2:
        return "matrix"
    if any("date" in header for header in normalized_headers):
        return "schedule"
    return "unknown"


def bounding_region_to_bbox(bounding_regions: List[Any]) -> Optional[List[float]]:
    if not bounding_regions:
        return None

    first_region = bounding_regions[0]
    if isinstance(first_region, dict):
        polygon = first_region.get("polygon")
    else:
        polygon = getattr(first_region, "polygon", None)

    if not polygon:
        return None

    first_point = polygon[0]
    if isinstance(first_point, dict):
        x_values = [point.get("x") for point in polygon]
        y_values = [point.get("y") for point in polygon]
    elif hasattr(first_point, "x"):
        x_values = [point.x for point in polygon]
        y_values = [point.y for point in polygon]
    else:
        x_values = polygon[0::2]
        y_values = polygon[1::2]

    x_values = [x for x in x_values if x is not None]
    y_values = [y for y in y_values if y is not None]

    if not x_values or not y_values:
        return None

    return [min(x_values), min(y_values), max(x_values), max(y_values)]


def to_candidate_table(
    extracted_table: ExtractedTable,
    extractor: str = "azure_document_intelligence",
) -> CandidateTable:
    raw_grid = extracted_table.metadata.get("raw_grid", [])
    quality = compute_table_quality(
        extracted_table.headers, extracted_table.rows, raw_grid
    )
    shape = classify_table_shape(extracted_table.headers, extracted_table.rows)

    return CandidateTable(
        candidate_id=extracted_table.table_id,
        source_file=extracted_table.source_file,
        page_number=extracted_table.page_number,
        table_index=extracted_table.table_index,
        extractor=extractor,
        headers=extracted_table.headers,
        rows=extracted_table.rows,
        raw_grid=raw_grid,
        markdown=extracted_table.markdown,
        bbox=bounding_region_to_bbox(
            extracted_table.metadata.get("bounding_regions", [])
        ),
        quality=quality,
        shape=shape,
        metadata={
            "header_rows": extracted_table.header_rows,
            **extracted_table.metadata,
        },
    )


def build_candidate_tables(
    tables: Iterable[ExtractedTable],
    extractor: str = "azure_document_intelligence",
) -> List[CandidateTable]:
    return [to_candidate_table(table, extractor=extractor) for table in tables]


def get_profile_by_name(profile_name: str) -> ExtractionProfile:
    normalized_profile_name = profile_name.strip().lower()
    if normalized_profile_name != "reclamation_report":
        raise PDFTableExtractionError(f"Unsupported extraction profile: {profile_name}")

    return ExtractionProfile(
        profile_name="reclamation_report",
        table_shapes=["key_value", "time_series", "matrix"],
        fields=[
            FieldDefinition(
                field_name="area_disturbed",
                labels=["disturbed area", "area disturbed", "total disturbance area"],
                required=True,
            ),
            FieldDefinition(
                field_name="area_reclaimed",
                labels=["reclaimed area", "area reclaimed", "total reclaimed area"],
                required=True,
            ),
            FieldDefinition(
                field_name="area_exempt",
                labels=["exempt area", "area exempt"],
            ),
            FieldDefinition(
                field_name="mining_production",
                labels=["mining production"],
                value_column_labels=[
                    "value",
                    "amount",
                    "current",
                    "current report",
                    "production",
                ],
                required=True,
            ),
            FieldDefinition(
                field_name="milling_production",
                labels=["milling production"],
                value_column_labels=[
                    "value",
                    "amount",
                    "current",
                    "current report",
                    "production",
                ],
            ),
            FieldDefinition(
                field_name="liability_estimate",
                labels=["liability estimate", "total liability estimate"],
                value_column_labels=[
                    "value",
                    "amount",
                    "current",
                    "current report",
                    "estimate",
                ],
            ),
        ],
    )


def find_value_column(headers: List[str], candidate_labels: List[str]) -> Optional[str]:
    if not headers:
        return None

    normalized_headers = {header: normalize_token(header) for header in headers}
    normalized_candidates = {normalize_token(label) for label in candidate_labels}

    for header, normalized_header in normalized_headers.items():
        if normalized_header in normalized_candidates:
            return header

    for header, normalized_header in normalized_headers.items():
        if any(candidate in normalized_header for candidate in normalized_candidates):
            return header

    return headers[-1]


def extract_key_value_field(
    candidate_table: CandidateTable,
    field_definition: FieldDefinition,
) -> Optional[FieldExtraction]:
    if not candidate_table.headers or not candidate_table.rows:
        return None

    label_column = candidate_table.headers[0]
    value_column = find_value_column(
        candidate_table.headers[1:] or candidate_table.headers,
        field_definition.value_column_labels,
    )
    if not value_column:
        return None

    normalized_labels = [normalize_token(label) for label in field_definition.labels]
    for row_index, row in enumerate(candidate_table.rows, start=1):
        label_value = normalize_token(row.get(label_column, ""))
        if not label_value:
            continue
        if not any(label in label_value for label in normalized_labels):
            continue

        raw_value = row.get(value_column, "")
        parsed_value = try_parse_number(raw_value)
        if parsed_value is None:
            continue

        confidence = 0.8
        if candidate_table.shape == "key_value":
            confidence += 0.1
        if candidate_table.quality.numeric_parse_rate >= 0.25:
            confidence += 0.05

        return FieldExtraction(
            field_name=field_definition.field_name,
            value=parsed_value,
            source_table_id=candidate_table.candidate_id,
            confidence=min(confidence, 0.99),
            parser=field_definition.parser,
            evidence={
                "page_number": candidate_table.page_number,
                "row_index": row_index,
                "label_column": label_column,
                "value_column": value_column,
                "matched_label": row.get(label_column, ""),
                "raw_value": raw_value,
                "shape": candidate_table.shape,
            },
        )

    return None


def run_profile_extraction(
    candidate_tables: List[CandidateTable],
    profile: ExtractionProfile,
) -> ProfileExtractionResult:
    extracted_fields: List[FieldExtraction] = []

    for field_definition in profile.fields:
        best_match = None
        for candidate_table in candidate_tables:
            if candidate_table.shape not in profile.table_shapes:
                continue

            field_match = extract_key_value_field(candidate_table, field_definition)
            if field_match and (
                best_match is None or field_match.confidence > best_match.confidence
            ):
                best_match = field_match

        if best_match is not None:
            extracted_fields.append(best_match)

    extracted_field_names = {field.field_name for field in extracted_fields}
    missing_required_fields = [
        field.field_name
        for field in profile.fields
        if field.required and field.field_name not in extracted_field_names
    ]

    return ProfileExtractionResult(
        profile_name=profile.profile_name,
        fields=extracted_fields,
        missing_required_fields=missing_required_fields,
    )
