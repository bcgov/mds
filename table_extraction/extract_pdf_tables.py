import argparse
import json
import re
from pathlib import Path
from typing import List, Tuple

from azure.core.exceptions import AzureError
from dotenv import find_dotenv, load_dotenv

from table_extractor.aoai_ops import (
    analyze_candidate_tables_with_azure_openai_cached,
)
from table_extractor.io_ops import (
    load_azure_openai_settings,
    load_document_intelligence_settings,
    write_candidate_tables,
    write_extracted_tables,
    write_profile_extraction_result,
    write_table_analysis_result,
)
from table_extractor.models import (
    DEFAULT_MODEL_ID,
    PDFTableExtractionError,
    TableAnalysisError,
)
from table_extractor.pdf_ops import (
    analyze_pdf_tables,
    build_candidate_tables_cached,
    prefilter_pdf_to_table_pages,
    run_profile_extraction_cached,
    write_selected_table_images,
)
from table_extractor.table_ops import get_profile_by_name

ENV_FILE = find_dotenv()
if ENV_FILE:
    load_dotenv(ENV_FILE)

DEFAULT_PROMPT_PAIRS_DIR = Path(__file__).resolve().parent / "prompt_pairs"
PAIR_SELECTION_PROMPT_FILE = "selection_prompt.txt"
PAIR_EXTRACTION_PROMPT_FILE = "extraction_prompt.txt"
SELECTION_OUTPUT_PROMPT = "Return valid JSON only with top-level keys selected_table_ids, selection_reasons, and notes."
EXTRACTION_CONTEXT_PROMPT = (
    "These tables were selected in a prior pass from the annual mining reclamation report. "
    "Use only the provided tables to extract the requested numbers."
)


def read_prompt_value(file_path: Path) -> str:
    prompt_path = file_path.expanduser().resolve()
    if not prompt_path.exists():
        raise TableAnalysisError(f"Prompt file not found: {prompt_path}")
    prompt_value = prompt_path.read_text(encoding="utf-8").strip()
    if prompt_value:
        return prompt_value
    raise TableAnalysisError(f"Prompt file is empty: {prompt_path}")


def normalize_artifact_suffix(value: str) -> str:
    normalized = re.sub(r"[^a-zA-Z0-9_-]+", "_", value).strip("_").lower()
    return normalized or "pair"


def load_prompt_pairs(prompt_pairs_dir: Path) -> List[Tuple[str, str, str]]:
    if not prompt_pairs_dir.exists() or not prompt_pairs_dir.is_dir():
        raise TableAnalysisError(
            f"Prompt-pairs directory not found: {prompt_pairs_dir}"
        )

    pair_dirs = sorted(path for path in prompt_pairs_dir.iterdir() if path.is_dir())
    prompt_pairs: List[Tuple[str, str, str]] = []
    for pair_dir in pair_dirs:
        selection_file = pair_dir / PAIR_SELECTION_PROMPT_FILE
        output_file = pair_dir / PAIR_EXTRACTION_PROMPT_FILE

        if not selection_file.exists() or not output_file.exists():
            continue

        pair_name = normalize_artifact_suffix(pair_dir.name)
        selection_prompt = read_prompt_value(selection_file)
        output_prompt = read_prompt_value(output_file)
        prompt_pairs.append((pair_name, selection_prompt, output_prompt))

    if not prompt_pairs:
        raise TableAnalysisError(
            "No valid prompt pairs were found. Expected subdirectories under "
            f"{prompt_pairs_dir} each containing {PAIR_SELECTION_PROMPT_FILE} and {PAIR_EXTRACTION_PROMPT_FILE}."
        )

    return prompt_pairs


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Extract tables from a PDF into JSON and CSV outputs using Azure Document Intelligence."
    )
    parser.add_argument("pdf_path", help="Path to the source PDF file.")
    parser.add_argument(
        "--output-dir",
        default="table_extraction_output",
        help="Directory where extracted JSON and CSV files will be written.",
    )
    parser.add_argument(
        "--header-rows",
        type=int,
        default=1,
        help="Number of top rows to treat as table headers when building row dictionaries.",
    )
    parser.add_argument(
        "--model-id",
        default=DEFAULT_MODEL_ID,
        help="Azure Document Intelligence model id to use.",
    )
    parser.add_argument(
        "--endpoint",
        help="Override DOCUMENTINTELLIGENCE_ENDPOINT for this run.",
    )
    parser.add_argument(
        "--api-key",
        help="Override DOCUMENTINTELLIGENCE_API_KEY for this run.",
    )
    parser.add_argument(
        "--api-version",
        help="Override DOCUMENTINTELLIGENCE_API_VERSION for this run.",
    )
    parser.add_argument(
        "--skip-page-prefilter",
        action="store_true",
        help="Skip local page filtering and send the full PDF to Azure Document Intelligence.",
    )
    parser.add_argument(
        "--prefilter-output-dir",
        help="Directory where the filtered PDF containing only detected table pages will be written.",
    )
    parser.add_argument(
        "--skip-table-extraction",
        action="store_true",
        help="Only detect table-bearing pages and build the filtered PDF without calling Azure Document Intelligence.",
    )
    parser.add_argument(
        "--profile",
        help="Optional profile-driven normalization step. Currently supports: reclamation_report.",
    )
    parser.add_argument(
        "--prompt-pairs-dir",
        default=str(DEFAULT_PROMPT_PAIRS_DIR),
        help=(
            "Directory containing prompt-pair subdirectories. Each pair directory must include "
            "selection_prompt.txt and extraction_prompt.txt."
        ),
    )
    parser.add_argument(
        "--aoai-endpoint",
        help="Override the Azure OpenAI endpoint for this run.",
    )
    parser.add_argument(
        "--aoai-api-key",
        help="Override the Azure OpenAI API key for this run.",
    )
    parser.add_argument(
        "--aoai-api-version",
        help="Override the Azure OpenAI API version for this run.",
    )
    parser.add_argument(
        "--aoai-deployment",
        help="Override the Azure OpenAI deployment name for this run.",
    )
    parser.add_argument(
        "--cache-dir",
        help="Directory for persistent per-step cache artifacts. Defaults to <output-dir>/.cache.",
    )
    parser.add_argument(
        "--disable-cache",
        action="store_true",
        help="Disable persistent caching and force all steps to recompute.",
    )
    parser.add_argument(
        "--include-table-footnotes",
        action="store_true",
        help="Expand selected table image crops to include nearby text blocks below the table (for footnotes).",
    )
    parser.add_argument(
        "--include-table-captions",
        action="store_true",
        help="Expand selected table image crops to include nearby text blocks above the table (for captions/subtitles).",
    )
    parser.add_argument(
        "--table-image-context-distance-pts",
        type=float,
        default=150.0,
        help="Maximum vertical distance in PDF points for including nearby footnote/caption text blocks. Default: 72.",
    )
    parser.add_argument(
        "--table-image-horizontal-tolerance-pts",
        type=float,
        default=70.0,
        help="Horizontal tolerance in PDF points when matching nearby text blocks to a table crop. Default: 36.",
    )
    parser.add_argument(
        "--table-image-padding-pts",
        type=float,
        default=0.0,
        help="Optional padding in PDF points added around selected table image crops. Default: 0.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    pdf_path = Path(args.pdf_path).expanduser().resolve()
    output_dir = Path(args.output_dir).expanduser().resolve()
    settings = load_document_intelligence_settings()
    azure_openai_settings = load_azure_openai_settings()
    endpoint = args.endpoint or settings["endpoint"]
    api_key = args.api_key or settings["api_key"]
    api_version = args.api_version or settings["api_version"]
    use_prefilter = not args.skip_page_prefilter
    cache_dir = (
        Path(args.cache_dir).expanduser().resolve()
        if args.cache_dir
        else output_dir / ".cache"
    )
    use_cache = not args.disable_cache
    prefilter_output_dir = (
        Path(args.prefilter_output_dir).expanduser().resolve()
        if args.prefilter_output_dir
        else output_dir
    )

    if use_cache:
        cache_dir.mkdir(parents=True, exist_ok=True)

    try:
        prompt_pairs = load_prompt_pairs(Path(args.prompt_pairs_dir))
    except TableAnalysisError as error:
        raise SystemExit(f"Table analysis configuration failed: {error}") from error

    prefilter_result = prefilter_pdf_to_table_pages(
        source_pdf=pdf_path,
        output_dir=prefilter_output_dir,
        use_prefilter=use_prefilter,
        cache_dir=cache_dir,
        use_cache=use_cache,
    )

    if args.skip_table_extraction:
        print(f"Detected table pages: {prefilter_result.table_pages}")
        print(f"Analysis PDF: {prefilter_result.analysis_pdf}")
        if prefilter_result.used_prefilter:
            print("Azure table extraction skipped.")
        else:
            print("No table-specific filtered PDF was created.")
        return

    try:
        tables = analyze_pdf_tables(
            file_path=pdf_path,
            endpoint=endpoint,
            api_key=api_key,
            api_version=api_version,
            header_rows=args.header_rows,
            model_id=args.model_id,
            use_prefilter=use_prefilter,
            prefilter_output_dir=prefilter_output_dir,
            prefilter_result=prefilter_result,
            cache_dir=cache_dir,
            use_cache=use_cache,
        )
    except (AzureError, PDFTableExtractionError) as error:
        raise SystemExit(f"Table extraction failed: {error}") from error

    output_paths = write_extracted_tables(
        tables=tables,
        output_dir=output_dir,
        source_pdf=pdf_path,
    )
    candidate_tables = build_candidate_tables_cached(
        tables,
        cache_dir=cache_dir,
        use_cache=use_cache,
    )
    candidate_json_path = write_candidate_tables(candidate_tables, output_dir, pdf_path)

    print(f"Extracted {len(tables)} tables from {pdf_path.name}")
    print(f"JSON output: {output_paths['json']}")
    print(f"Inventory CSV: {output_paths['inventory_csv']}")
    print(f"Rows CSV: {output_paths['rows_csv']}")
    print(f"Per-table markdown files: {output_paths['per_table_dir']}")
    print(f"Candidate table JSON: {candidate_json_path}")

    if args.profile:
        profile = get_profile_by_name(args.profile)
        profile_result = run_profile_extraction_cached(
            candidate_tables,
            profile,
            cache_dir=cache_dir,
            use_cache=use_cache,
        )
        profile_output_path = write_profile_extraction_result(
            profile_result,
            output_dir,
            pdf_path,
        )
        print(f"Profile extraction JSON: {profile_output_path}")
        if profile_result.missing_required_fields:
            print(
                "Missing required fields: "
                + ", ".join(profile_result.missing_required_fields)
            )

    run_manifest = []
    for pair_index, (pair_name, table_selection_prompt, output_prompt) in enumerate(
        prompt_pairs, start=1
    ):
        artifact_suffix = None if pair_index == 1 else pair_name
        print(f"\n=== Prompt pair {pair_index}: {pair_name} ===")

        try:
            selection_result = analyze_candidate_tables_with_azure_openai_cached(
                candidate_tables,
                endpoint=args.aoai_endpoint or azure_openai_settings["endpoint"],
                api_key=args.aoai_api_key or azure_openai_settings["api_key"],
                api_version=args.aoai_api_version
                or azure_openai_settings["api_version"],
                deployment=args.aoai_deployment or azure_openai_settings["deployment"],
                table_selection_prompt=table_selection_prompt,
                output_prompt=SELECTION_OUTPUT_PROMPT,
                cache_dir=cache_dir,
                use_cache=use_cache,
            )
        except (TableAnalysisError, AzureError) as error:
            raise SystemExit(
                f"Table selection failed for prompt pair {pair_index} ({pair_name}): {error}"
            ) from error

        selected_table_ids = selection_result.matching_table_ids
        selected_candidate_tables = [
            table
            for table in candidate_tables
            if table.candidate_id in selected_table_ids
        ]
        if selected_candidate_tables:
            print(
                f"Table selection chose {len(selected_candidate_tables)} of {len(candidate_tables)} tables."
            )
        else:
            selected_candidate_tables = candidate_tables
            print(
                "Table selection returned no ids; falling back to all candidate tables for extraction."
            )

        selected_table_images_path = write_selected_table_images(
            selected_candidate_tables,
            source_pdf=pdf_path,
            output_dir=output_dir,
            include_footnotes=args.include_table_footnotes,
            include_captions=args.include_table_captions,
            context_distance_pts=args.table_image_context_distance_pts,
            horizontal_tolerance_pts=args.table_image_horizontal_tolerance_pts,
            padding_pts=args.table_image_padding_pts,
            artifact_suffix=artifact_suffix,
        )
        if selected_table_images_path:
            print(f"Selected table images manifest: {selected_table_images_path}")

        try:
            analysis_result = analyze_candidate_tables_with_azure_openai_cached(
                selected_candidate_tables,
                endpoint=args.aoai_endpoint or azure_openai_settings["endpoint"],
                api_key=args.aoai_api_key or azure_openai_settings["api_key"],
                api_version=args.aoai_api_version
                or azure_openai_settings["api_version"],
                deployment=args.aoai_deployment or azure_openai_settings["deployment"],
                table_selection_prompt=EXTRACTION_CONTEXT_PROMPT,
                output_prompt=output_prompt,
                cache_dir=cache_dir,
                use_cache=use_cache,
            )
        except (TableAnalysisError, AzureError) as error:
            raise SystemExit(
                f"Table extraction failed for prompt pair {pair_index} ({pair_name}): {error}"
            ) from error

        analysis_output_path = write_table_analysis_result(
            analysis_result,
            output_dir,
            pdf_path,
            artifact_suffix=artifact_suffix,
        )
        print(f"Azure OpenAI extraction JSON: {analysis_output_path}")

        run_manifest.append(
            {
                "pair_index": pair_index,
                "pair_name": pair_name,
                "artifact_suffix": artifact_suffix,
                "selection_tables": len(selected_candidate_tables),
                "selected_table_images_manifest": (
                    str(selected_table_images_path)
                    if selected_table_images_path
                    else None
                ),
                "analysis_output": str(analysis_output_path),
            }
        )

    manifest_path = output_dir / f"{pdf_path.stem}_table_analysis_runs.json"
    with open(manifest_path, "w", encoding="utf-8") as handle:
        json.dump(run_manifest, handle, indent=2)
    print(f"Prompt-pair run manifest JSON: {manifest_path}")


if __name__ == "__main__":
    main()
