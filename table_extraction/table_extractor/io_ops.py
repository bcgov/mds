import csv
import json
import os
from pathlib import Path
from typing import Dict, List

from .models import (
    CandidateTable,
    ExtractedTable,
    ProfileExtractionResult,
    TableAnalysisResult,
)


def write_extracted_tables(
    tables: List[ExtractedTable], output_dir: Path, source_pdf: Path
) -> Dict[str, Path]:
    output_dir.mkdir(parents=True, exist_ok=True)
    per_table_dir = output_dir / f"{source_pdf.stem}_tables"
    per_table_dir.mkdir(parents=True, exist_ok=True)

    json_path = output_dir / f"{source_pdf.stem}_tables.json"
    inventory_csv_path = output_dir / f"{source_pdf.stem}_table_inventory.csv"
    rows_csv_path = output_dir / f"{source_pdf.stem}_table_rows.csv"

    with open(json_path, "w", encoding="utf-8") as handle:
        json.dump([table.to_dict() for table in tables], handle, indent=2)

    with open(inventory_csv_path, "w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=[
                "table_id",
                "source_file",
                "page_number",
                "table_index",
                "row_count",
                "column_count",
                "header_rows",
                "headers_json",
                "markdown",
            ],
        )
        writer.writeheader()
        for table in tables:
            writer.writerow(
                {
                    "table_id": table.table_id,
                    "source_file": table.source_file,
                    "page_number": table.page_number,
                    "table_index": table.table_index,
                    "row_count": table.row_count,
                    "column_count": table.column_count,
                    "header_rows": table.header_rows,
                    "headers_json": json.dumps(table.headers),
                    "markdown": table.markdown,
                }
            )

    with open(rows_csv_path, "w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=[
                "table_id",
                "source_file",
                "page_number",
                "row_index",
                "row_json",
            ],
        )
        writer.writeheader()
        for table in tables:
            for row_index, row in enumerate(table.rows, start=1):
                writer.writerow(
                    {
                        "table_id": table.table_id,
                        "source_file": table.source_file,
                        "page_number": table.page_number,
                        "row_index": row_index,
                        "row_json": json.dumps(row),
                    }
                )

    for table in tables:
        per_table_md_path = per_table_dir / f"{table.table_id}.md"
        with open(per_table_md_path, "w", encoding="utf-8") as handle:
            handle.write(table.markdown)

    return {
        "json": json_path,
        "inventory_csv": inventory_csv_path,
        "rows_csv": rows_csv_path,
        "per_table_dir": per_table_dir,
    }


def write_candidate_tables(
    candidate_tables: List[CandidateTable], output_dir: Path, source_pdf: Path
) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    candidate_json_path = output_dir / f"{source_pdf.stem}_candidate_tables.json"

    with open(candidate_json_path, "w", encoding="utf-8") as handle:
        json.dump([table.to_dict() for table in candidate_tables], handle, indent=2)

    return candidate_json_path


def write_profile_extraction_result(
    extraction_result: ProfileExtractionResult,
    output_dir: Path,
    source_pdf: Path,
) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = (
        output_dir / f"{source_pdf.stem}_{extraction_result.profile_name}_fields.json"
    )

    with open(output_path, "w", encoding="utf-8") as handle:
        json.dump(extraction_result.to_dict(), handle, indent=2)

    return output_path


def write_table_analysis_result(
    analysis_result: TableAnalysisResult,
    output_dir: Path,
    source_pdf: Path,
    artifact_suffix: str | None = None,
) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    suffix = f"_{artifact_suffix}" if artifact_suffix else ""
    output_path = output_dir / f"{source_pdf.stem}_table_analysis{suffix}.json"

    with open(output_path, "w", encoding="utf-8") as handle:
        json.dump(analysis_result.to_dict(), handle, indent=2)

    return output_path


def load_document_intelligence_settings() -> Dict[str, str]:
    return {
        "endpoint": os.getenv("DOCUMENTINTELLIGENCE_ENDPOINT", ""),
        "api_key": os.getenv("DOCUMENTINTELLIGENCE_API_KEY", ""),
        "api_version": os.getenv("DOCUMENTINTELLIGENCE_API_VERSION", "2024-11-30"),
    }


def load_azure_openai_settings() -> Dict[str, str]:
    return {
        "endpoint": os.getenv("AZURE_OPENAI_ENDPOINT", os.getenv("AZURE_BASE_URL", "")),
        "api_key": os.getenv("AZURE_OPENAI_API_KEY", os.getenv("AZURE_API_KEY", "")),
        "deployment": os.getenv(
            "AZURE_OPENAI_DEPLOYMENT",
            os.getenv("AZURE_DEPLOYMENT_NAME", ""),
        ),
        "api_version": os.getenv(
            "AZURE_OPENAI_API_VERSION",
            os.getenv(
                "AZURE_API_VERSION", os.getenv("OPENAI_API_VERSION", "2024-10-21")
            ),
        ),
    }
