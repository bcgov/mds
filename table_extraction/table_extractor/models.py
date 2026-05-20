from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional

DEFAULT_MODEL_ID = "prebuilt-layout"
CACHE_VERSION = 2


class PDFTableExtractionError(Exception):
    pass


class TableAnalysisError(PDFTableExtractionError):
    pass


@dataclass
class PrefilterResult:
    source_pdf: Path
    analysis_pdf: Path
    table_pages: List[int]
    filtered_to_original_page_map: Dict[int, int]
    used_prefilter: bool


@dataclass
class ExtractedTable:
    table_id: str
    source_file: str
    page_number: Optional[int]
    table_index: int
    row_count: int
    column_count: int
    header_rows: int
    headers: List[str]
    rows: List[Dict[str, str]]
    markdown: str
    metadata: Dict[str, Any]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "table_id": self.table_id,
            "source_file": self.source_file,
            "page_number": self.page_number,
            "table_index": self.table_index,
            "row_count": self.row_count,
            "column_count": self.column_count,
            "header_rows": self.header_rows,
            "headers": self.headers,
            "rows": self.rows,
            "markdown": self.markdown,
            "metadata": self.metadata,
        }


@dataclass
class TableQuality:
    empty_rate: float
    numeric_parse_rate: float
    duplicate_header_rate: float
    populated_row_rate: float

    def to_dict(self) -> Dict[str, float]:
        return {
            "empty_rate": self.empty_rate,
            "numeric_parse_rate": self.numeric_parse_rate,
            "duplicate_header_rate": self.duplicate_header_rate,
            "populated_row_rate": self.populated_row_rate,
        }


@dataclass
class CandidateTable:
    candidate_id: str
    source_file: str
    page_number: Optional[int]
    table_index: int
    extractor: str
    headers: List[str]
    rows: List[Dict[str, str]]
    raw_grid: List[List[str]]
    markdown: str
    bbox: Optional[List[float]]
    quality: TableQuality
    shape: str
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "candidate_id": self.candidate_id,
            "source_file": self.source_file,
            "page_number": self.page_number,
            "table_index": self.table_index,
            "extractor": self.extractor,
            "headers": self.headers,
            "rows": self.rows,
            "raw_grid": self.raw_grid,
            "markdown": self.markdown,
            "bbox": self.bbox,
            "quality": self.quality.to_dict(),
            "shape": self.shape,
            "metadata": self.metadata,
        }


@dataclass
class FieldDefinition:
    field_name: str
    labels: List[str]
    value_column_labels: List[str] = field(
        default_factory=lambda: ["value", "amount", "current", "current report"]
    )
    parser: str = "number"
    required: bool = False


@dataclass
class ExtractionProfile:
    profile_name: str
    table_shapes: List[str]
    fields: List[FieldDefinition]


@dataclass
class FieldExtraction:
    field_name: str
    value: Optional[Any]
    source_table_id: str
    confidence: float
    parser: str
    evidence: Dict[str, Any]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "field_name": self.field_name,
            "value": self.value,
            "source_table_id": self.source_table_id,
            "confidence": self.confidence,
            "parser": self.parser,
            "evidence": self.evidence,
        }


@dataclass
class ProfileExtractionResult:
    profile_name: str
    fields: List[FieldExtraction]
    missing_required_fields: List[str]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "profile_name": self.profile_name,
            "fields": [field.to_dict() for field in self.fields],
            "missing_required_fields": self.missing_required_fields,
        }


@dataclass
class TableAnalysisResult:
    matching_table_ids: List[str]
    matching_table_reasons: Dict[str, str]
    output: Any
    confidence: float
    notes: List[str]
    raw_response: str
    model: str
    usage: Dict[str, Any]
    table_selection_prompt: str
    output_prompt: str
    tables_considered: int

    def to_dict(self) -> Dict[str, Any]:
        return {
            "matching_table_ids": self.matching_table_ids,
            "matching_table_reasons": self.matching_table_reasons,
            "output": self.output,
            "confidence": self.confidence,
            "notes": self.notes,
            "raw_response": self.raw_response,
            "model": self.model,
            "usage": self.usage,
            "table_selection_prompt": self.table_selection_prompt,
            "output_prompt": self.output_prompt,
            "tables_considered": self.tables_considered,
        }


def extracted_table_from_dict(payload: Dict[str, Any]) -> ExtractedTable:
    return ExtractedTable(
        table_id=payload["table_id"],
        source_file=payload["source_file"],
        page_number=payload.get("page_number"),
        table_index=payload["table_index"],
        row_count=payload["row_count"],
        column_count=payload["column_count"],
        header_rows=payload["header_rows"],
        headers=list(payload.get("headers", [])),
        rows=list(payload.get("rows", [])),
        markdown=payload.get("markdown", ""),
        metadata=dict(payload.get("metadata", {})),
    )


def table_quality_from_dict(payload: Dict[str, Any]) -> TableQuality:
    return TableQuality(
        empty_rate=float(payload.get("empty_rate", 0.0)),
        numeric_parse_rate=float(payload.get("numeric_parse_rate", 0.0)),
        duplicate_header_rate=float(payload.get("duplicate_header_rate", 0.0)),
        populated_row_rate=float(payload.get("populated_row_rate", 0.0)),
    )


def candidate_table_from_dict(payload: Dict[str, Any]) -> CandidateTable:
    return CandidateTable(
        candidate_id=payload["candidate_id"],
        source_file=payload["source_file"],
        page_number=payload.get("page_number"),
        table_index=payload["table_index"],
        extractor=payload["extractor"],
        headers=list(payload.get("headers", [])),
        rows=list(payload.get("rows", [])),
        raw_grid=list(payload.get("raw_grid", [])),
        markdown=payload.get("markdown", ""),
        bbox=payload.get("bbox"),
        quality=table_quality_from_dict(payload.get("quality", {})),
        shape=payload.get("shape", "unknown"),
        metadata=dict(payload.get("metadata", {})),
    )


def field_extraction_from_dict(payload: Dict[str, Any]) -> FieldExtraction:
    return FieldExtraction(
        field_name=payload["field_name"],
        value=payload.get("value"),
        source_table_id=payload["source_table_id"],
        confidence=float(payload.get("confidence", 0.0)),
        parser=payload.get("parser", "number"),
        evidence=dict(payload.get("evidence", {})),
    )


def profile_extraction_result_from_dict(
    payload: Dict[str, Any],
) -> ProfileExtractionResult:
    return ProfileExtractionResult(
        profile_name=payload["profile_name"],
        fields=[field_extraction_from_dict(item) for item in payload.get("fields", [])],
        missing_required_fields=list(payload.get("missing_required_fields", [])),
    )


def table_analysis_result_from_dict(payload: Dict[str, Any]) -> TableAnalysisResult:
    return TableAnalysisResult(
        matching_table_ids=[
            str(item) for item in payload.get("matching_table_ids", [])
        ],
        matching_table_reasons={
            str(key): str(value)
            for key, value in dict(payload.get("matching_table_reasons", {})).items()
        },
        output=payload.get("output"),
        confidence=float(payload.get("confidence", 0.0)),
        notes=[str(item) for item in payload.get("notes", [])],
        raw_response=payload.get("raw_response", ""),
        model=payload.get("model", ""),
        usage=dict(payload.get("usage", {})),
        table_selection_prompt=payload.get("table_selection_prompt", ""),
        output_prompt=payload.get("output_prompt", ""),
        tables_considered=int(payload.get("tables_considered", 0)),
    )
