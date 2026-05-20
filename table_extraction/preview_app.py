"""
Streamlit app to preview table extraction results
"""

import json
import streamlit as st
from pathlib import Path
import pandas as pd
from PIL import Image, ImageDraw
import os
import fitz  # PyMuPDF
import re

# Set page config
st.set_page_config(page_title="Table Extraction Preview", layout="wide")

# Define output directory
OUTPUT_DIR = Path(__file__).resolve().parent / "table_extraction_output"
PROMPT_PAIRS_DIR = Path(__file__).resolve().parent / "prompt_pairs"
PAIR_EXTRACTION_PROMPT_FILENAME = "extraction_prompt.txt"
DEFAULT_EXTRACTION_PROMPT_FILE = (
    Path(__file__).resolve().parent / "extraction_prompt.txt"
)
parent_dir = Path(__file__).resolve().parent


def _normalize_note_text(note: object) -> str:
    if isinstance(note, dict):
        value = note.get("content") or note.get("text") or ""
        return str(value).strip()
    return str(note or "").strip()


def _extract_caption_and_footnotes(metadata: object) -> tuple[str | None, list[str]]:
    if not isinstance(metadata, dict):
        return None, []

    caption_value = metadata.get("caption")
    caption_text = _normalize_note_text(caption_value) if caption_value else ""

    footnote_values = metadata.get("footnotes") or []
    footnote_texts: list[str] = []
    if isinstance(footnote_values, list):
        for item in footnote_values:
            text = _normalize_note_text(item)
            if text:
                footnote_texts.append(text)

    return (caption_text or None), footnote_texts


def load_table_metadata_index(tables_json_path: Path | None) -> dict[str, dict]:
    if not tables_json_path or not tables_json_path.exists():
        return {}

    try:
        payload = json.loads(tables_json_path.read_text(encoding="utf-8"))
    except Exception:
        return {}

    if not isinstance(payload, list):
        return {}

    table_index: dict[str, dict] = {}
    for item in payload:
        if not isinstance(item, dict):
            continue
        table_id = str(item.get("table_id") or "").strip()
        if table_id:
            table_index[table_id] = item

    return table_index


def render_table_context(table_id: str, table_metadata_index: dict[str, dict]) -> None:
    table_payload = table_metadata_index.get(table_id)
    if not isinstance(table_payload, dict):
        st.caption("No table metadata found for caption/footnote context.")
        return

    caption_text, footnote_texts = _extract_caption_and_footnotes(
        table_payload.get("metadata")
    )

    st.write("**Caption / Footnotes**")
    if caption_text:
        st.caption(f"Caption: {caption_text}")
    else:
        st.caption("Caption: not available")

    if footnote_texts:
        for note in footnote_texts:
            st.caption(f"Footnote: {note}")
    else:
        st.caption("Footnotes: not available")


def discover_report_stems(output_dir: Path, source_dir: Path) -> list[str]:
    stems = set()

    if output_dir.exists():
        for path in output_dir.glob("*_table_analysis.json"):
            stems.add(path.name[: -len("_table_analysis.json")])
        for path in output_dir.glob("*_table_inventory.csv"):
            stems.add(path.name[: -len("_table_inventory.csv")])
        for path in output_dir.glob("*_selected_table_images.json"):
            stems.add(path.name[: -len("_selected_table_images.json")])
        for path in output_dir.glob("*_tables"):
            if path.is_dir():
                stems.add(path.name[: -len("_tables")])
        for path in output_dir.glob("*_selected_table_images"):
            if path.is_dir():
                stems.add(path.name[: -len("_selected_table_images")])

    for pdf in source_dir.glob("*.pdf"):
        stems.add(pdf.stem)

    return sorted(stems)


REPORT_STEMS = discover_report_stems(OUTPUT_DIR, parent_dir)

# Sidebar selector for report/PDF context
st.sidebar.header("Report Selection")
if REPORT_STEMS:
    selected_report_stem = st.sidebar.selectbox("Select report/PDF:", REPORT_STEMS)
else:
    selected_report_stem = None

TABLES_DIR = (
    OUTPUT_DIR / f"{selected_report_stem}_tables" if selected_report_stem else None
)
DEFAULT_IMAGES_DIR = (
    OUTPUT_DIR / f"{selected_report_stem}_selected_table_images"
    if selected_report_stem
    else None
)
DEFAULT_ANALYSIS_FILE = (
    OUTPUT_DIR / f"{selected_report_stem}_table_analysis.json"
    if selected_report_stem
    else None
)
INVENTORY_FILE = (
    OUTPUT_DIR / f"{selected_report_stem}_table_inventory.csv"
    if selected_report_stem
    else None
)
DEFAULT_SELECTED_IMAGES_FILE = (
    OUTPUT_DIR / f"{selected_report_stem}_selected_table_images.json"
    if selected_report_stem
    else None
)
TABLES_JSON_FILE = (
    OUTPUT_DIR / f"{selected_report_stem}_tables.json" if selected_report_stem else None
)
RUNS_MANIFEST_FILE = (
    OUTPUT_DIR / f"{selected_report_stem}_table_analysis_runs.json"
    if selected_report_stem
    else None
)
PDF_FILE = parent_dir / f"{selected_report_stem}.pdf" if selected_report_stem else None


def load_pair_runs(manifest_path: Path | None) -> list[dict]:
    if not manifest_path or not manifest_path.exists():
        return []
    try:
        payload = json.loads(manifest_path.read_text(encoding="utf-8"))
    except Exception:
        return []
    if not isinstance(payload, list):
        return []
    runs = []
    for item in payload:
        if not isinstance(item, dict):
            continue
        pair_name = str(item.get("pair_name") or "pair")
        analysis_output = item.get("analysis_output")
        selected_images_manifest = item.get("selected_table_images_manifest")
        runs.append(
            {
                "label": f"{item.get('pair_index', '?')}: {pair_name}",
                "pair_name": pair_name,
                "analysis_file": Path(analysis_output) if analysis_output else None,
                "images_manifest": (
                    Path(selected_images_manifest) if selected_images_manifest else None
                ),
            }
        )
    return runs


pair_runs = load_pair_runs(RUNS_MANIFEST_FILE)
selected_pair = None
if pair_runs:
    selected_pair = st.sidebar.selectbox(
        "Select prompt pair:",
        pair_runs,
        format_func=lambda x: x["label"],
    )

if selected_pair:
    ANALYSIS_FILE = selected_pair["analysis_file"] or DEFAULT_ANALYSIS_FILE
    SELECTED_IMAGES_FILE = (
        selected_pair["images_manifest"] or DEFAULT_SELECTED_IMAGES_FILE
    )
    IMAGES_DIR = (
        SELECTED_IMAGES_FILE.with_suffix("")
        if SELECTED_IMAGES_FILE is not None
        else DEFAULT_IMAGES_DIR
    )
    EXTRACTION_PROMPT_FILE = (
        PROMPT_PAIRS_DIR / selected_pair["pair_name"] / PAIR_EXTRACTION_PROMPT_FILENAME
    )
else:
    ANALYSIS_FILE = DEFAULT_ANALYSIS_FILE
    SELECTED_IMAGES_FILE = DEFAULT_SELECTED_IMAGES_FILE
    IMAGES_DIR = DEFAULT_IMAGES_DIR
    EXTRACTION_PROMPT_FILE = DEFAULT_EXTRACTION_PROMPT_FILE

TABLE_METADATA_INDEX = load_table_metadata_index(TABLES_JSON_FILE)

# Title
st.title("📊 Table Extraction Preview")

# Sidebar navigation
st.sidebar.header("Navigation")
page = st.sidebar.radio(
    "Select view:",
    [
        "Select Report",
        "Overview",
        "Browse Tables",
        "Table Images",
        "Extracted Data",
        "Extraction Rules",
        "Analysis",
        "Inventory",
    ],
)

if not selected_report_stem:
    st.error(
        "No reports found. Add a PDF and/or run extraction to generate output files."
    )
    st.stop()

# Select Report page
if page == "Select Report":
    st.header("Select Report")
    st.write(f"Current selection: **{selected_report_stem}**")

    col1, col2 = st.columns(2)
    with col1:
        st.write("**Source PDF**")
        if PDF_FILE and PDF_FILE.exists():
            st.success(PDF_FILE.name)
        else:
            st.warning("Source PDF not found in project root")

        st.write("**Analysis JSON**")
        if ANALYSIS_FILE and ANALYSIS_FILE.exists():
            st.success(ANALYSIS_FILE.name)
        else:
            st.warning("Analysis file not found")

        st.write("**Prompt Pair**")
        if selected_pair:
            st.success(selected_pair["label"])
        else:
            st.info("No prompt-pair manifest; using default analysis files")

    with col2:
        st.write("**Tables Folder**")
        if TABLES_DIR and TABLES_DIR.exists():
            st.success(TABLES_DIR.name)
        else:
            st.warning("Tables directory not found")

        st.write("**Selected Images Folder**")
        if IMAGES_DIR and IMAGES_DIR.exists():
            st.success(IMAGES_DIR.name)
        else:
            st.warning("Selected images directory not found")

# Overview page
elif page == "Overview":
    st.header("Extraction Summary")

    col1, col2, col3 = st.columns(3)

    # Count markdown tables
    if TABLES_DIR.exists():
        md_files = list(TABLES_DIR.glob("*.md"))
        col1.metric("Extracted Tables", len(md_files))

    # Count images
    if IMAGES_DIR and IMAGES_DIR.exists():
        image_files = [
            f
            for f in IMAGES_DIR.iterdir()
            if f.suffix.lower() in [".png", ".jpg", ".jpeg"]
        ]
        col2.metric("Table Images", len(image_files))

    # Check analysis
    if ANALYSIS_FILE and ANALYSIS_FILE.exists():
        with open(ANALYSIS_FILE) as f:
            analysis = json.load(f)
            col3.metric(
                "Analysis Entries", len(analysis) if isinstance(analysis, list) else 1
            )

    st.divider()
    st.subheader("Available Files")

    col1, col2 = st.columns(2)

    with col1:
        st.write("**Markdown Tables**")
        if TABLES_DIR.exists():
            for f in sorted(TABLES_DIR.glob("*.md"))[:5]:
                st.text(f.name)
            if len(list(TABLES_DIR.glob("*.md"))) > 5:
                st.caption(f"...and {len(list(TABLES_DIR.glob('*.md'))) - 5} more")

    with col2:
        st.write("**JSON Outputs**")
        for f in sorted(OUTPUT_DIR.glob("*.json")):
            st.text(f.name)

# Browse Tables page
elif page == "Browse Tables":
    st.header("Browse Extracted Tables")

    if TABLES_DIR and TABLES_DIR.exists():
        md_files = sorted(TABLES_DIR.glob("*.md"))

        if md_files:
            # Select table
            selected_file = st.selectbox(
                "Select a table:", md_files, format_func=lambda x: x.name
            )

            # Display table
            st.subheader(f"Table: {selected_file.name}")

            try:
                md_content = selected_file.read_text(encoding="utf-8")
                st.markdown(md_content)

                table_id = selected_file.stem
                render_table_context(table_id, TABLE_METADATA_INDEX)

                # Show stats
                col1, col2 = st.columns(2)
                col1.metric(
                    "File Size", f"{selected_file.stat().st_size / 1024:.1f} KB"
                )

                # Download option
                st.download_button(
                    label="Download Markdown",
                    data=md_content,
                    file_name=selected_file.name,
                    mime="text/markdown",
                )
            except Exception as e:
                st.error(f"Error reading table: {e}")
        else:
            st.info("No markdown tables found")
    else:
        st.error(f"Tables directory not found: {TABLES_DIR}")

# Table Images page
elif page == "Table Images":
    st.header("Table Images")

    if IMAGES_DIR and IMAGES_DIR.exists():
        image_files = sorted(
            [
                f
                for f in IMAGES_DIR.iterdir()
                if f.suffix.lower() in [".png", ".jpg", ".jpeg"]
            ]
        )

        if image_files:
            # Create columns for grid display
            cols = st.columns(3)

            for idx, img_file in enumerate(image_files):
                with cols[idx % 3]:
                    try:
                        img = Image.open(img_file)
                        st.image(img, caption=img_file.name, use_container_width=True)
                    except Exception as e:
                        st.error(f"Error loading {img_file.name}: {e}")
        else:
            st.info("No table images found")
    else:
        st.info(f"Images directory not found: {IMAGES_DIR}")

# Extracted Data page
elif page == "Extracted Data":
    st.header("Extracted Data with Source Context")

    if ANALYSIS_FILE and ANALYSIS_FILE.exists():
        try:
            with open(ANALYSIS_FILE) as f:
                analysis = json.load(f)

            if "output" in analysis:
                output = analysis["output"]

                # Show summary section
                st.subheader("📋 Extracted Summary")
                summary = output.get("summary", {})

                # Display summary in columns for better readability
                col1, col2 = st.columns(2)

                with col1:
                    st.write("**Company & Mine Info**")
                    st.text(f"Company: {summary.get('company', 'N/A')}")
                    st.text(f"Mine Name: {summary.get('mine_name', 'N/A')}")
                    st.text(f"Permit Number: {summary.get('permit_number', 'N/A')}")

                with col2:
                    st.write("**Report Dates**")
                    st.text(f"Report Year: {output.get('report_year', 'N/A')}")
                    st.text(
                        f"Next Plan Update: {summary.get('next_five_year_plan_update_date', 'N/A')}"
                    )

                disturbance = output.get("disturbance", {})
                if disturbance:
                    st.subheader("🌱 Disturbance")

                    total_year_ha = disturbance.get("total_year_ha")
                    if total_year_ha is not None:
                        st.metric("Total Year Disturbance (ha)", total_year_ha)
                    else:
                        st.text("Total Year Disturbance (ha): N/A")

                    breakdown = disturbance.get("breakdown_by_type", [])
                    if isinstance(breakdown, list) and breakdown:
                        breakdown_df = pd.DataFrame(breakdown)
                        st.dataframe(breakdown_df, use_container_width=True)
                    else:
                        st.info("No disturbance breakdown by type available")

                st.divider()

                # Show table extractions
                table_extractions = output.get("table_extractions", [])
                if table_extractions:
                    st.subheader(
                        f"📊 Table Extractions ({len(table_extractions)} tables)"
                    )

                    # Helper function to build extraction display label with caption
                    def get_extraction_label(idx: int) -> str:
                        extraction = table_extractions[idx]
                        table_id = extraction.get("table_id", "")

                        # Extract table number for display
                        table_num = (
                            table_id.split("_t")[-1] if "_t" in table_id else table_id
                        )
                        label = f"Table {idx + 1}: {table_num}"

                        # Add caption if available
                        caption_text, _ = _extract_caption_and_footnotes(
                            TABLE_METADATA_INDEX.get(table_id, {}).get("metadata")
                        )
                        if caption_text:
                            # Truncate long captions
                            caption_preview = (
                                caption_text[:60] + "..."
                                if len(caption_text) > 60
                                else caption_text
                            )
                            label += f" - {caption_preview}"

                        return label

                    # Select which extraction to view
                    extraction_idx = st.selectbox(
                        "Select extraction to view:",
                        range(len(table_extractions)),
                        format_func=get_extraction_label,
                    )

                    extraction = table_extractions[extraction_idx]
                    table_id = extraction.get("table_id", "")
                    page_num = extraction.get("page_number", "")

                    st.write(f"**Table ID:** `{table_id}`")
                    st.write(f"**Page Number:** {page_num}")

                    with st.expander("Caption / Footnote Context", expanded=True):
                        render_table_context(table_id, TABLE_METADATA_INDEX)

                    # Four columns: extracted fields, source table, image, pdf
                    col1, col2, col3, col4 = st.columns([1, 1, 1, 1])

                    # Column 1: Extracted Fields
                    with col1:
                        st.subheader("Extracted Fields")
                        matched_fields = extraction.get("matched_fields", [])

                        if matched_fields:
                            for field in matched_fields:
                                value = field.get("value", "N/A")
                                with st.expander(
                                    f"{field.get('field', 'Unknown')} = `{value}`"
                                ):
                                    st.write(f"**Value:** `{value}`")
                                    st.write(
                                        f"**Row:** {field.get('row_label', 'N/A')}"
                                    )
                                    st.write(
                                        f"**Column:** {field.get('column_label', 'N/A')}"
                                    )
                                    st.caption(
                                        f"Evidence: {field.get('evidence', 'N/A')}"
                                    )
                        else:
                            st.info("No matched fields")

                    # Column 2: Source Table
                    with col2:
                        st.subheader("Source Table")

                        # Find the markdown file - handle special characters in table_id
                        md_file = None

                        # First try direct match
                        direct_path = TABLES_DIR / f"{table_id}.md"
                        if direct_path.exists():
                            md_file = direct_path
                        else:
                            # Extract page and table numbers from table_id
                            # Pattern: ..._pX_tY
                            match = re.search(r"_p(\d+)_t(\d+)", table_id)
                            if match:
                                page_num_str = match.group(1)
                                table_num_str = match.group(2)

                                # Search for file with matching page and table numbers
                                for f in TABLES_DIR.glob("*.md"):
                                    if f"_p{page_num_str}_t{table_num_str}" in f.name:
                                        md_file = f
                                        break

                        if md_file and md_file.exists():
                            try:
                                md_content = md_file.read_text(encoding="utf-8")
                                st.markdown(md_content)
                            except Exception as e:
                                st.error(f"Error reading table: {e}")
                        else:
                            st.warning(
                                f"Source table not found for table_id: {table_id}"
                            )

                    # Column 3: Table Image
                    with col3:
                        st.subheader("Table Image")

                        # Look for image file matching this table
                        image_files = sorted(
                            [
                                f
                                for f in IMAGES_DIR.iterdir()
                                if f.suffix.lower() in [".png", ".jpg", ".jpeg"]
                            ]
                        )

                        # Try to find matching image using page and table numbers
                        matching_image = None

                        # Extract page and table numbers from table_id
                        match = re.search(r"_p(\d+)_t(\d+)", table_id)
                        if match:
                            page_num_str = match.group(1)
                            table_num_str = match.group(2)

                            for img_file in image_files:
                                if (
                                    f"_p{page_num_str}_t{table_num_str}"
                                    in img_file.name
                                ):
                                    matching_image = img_file
                                    break

                        if matching_image:
                            try:
                                img = Image.open(matching_image)
                                st.image(img, use_container_width=True)
                                st.caption(matching_image.name)
                            except Exception as e:
                                st.error(f"Error loading image: {e}")
                        else:
                            st.info("No matching image found")

                    # Column 4: PDF View with highlighted bounding box
                    with col4:
                        st.subheader("PDF Page")

                        if PDF_FILE and PDF_FILE.exists() and page_num:
                            try:
                                # Load bounding box info from selected images file
                                bbox_info = None
                                if (
                                    SELECTED_IMAGES_FILE
                                    and SELECTED_IMAGES_FILE.exists()
                                ):
                                    with open(SELECTED_IMAGES_FILE) as f:
                                        images_data = json.load(f)
                                        for img_entry in images_data:
                                            # Match by page number and table id pattern
                                            if img_entry.get("page_number") == page_num:
                                                entry_table_id = img_entry.get(
                                                    "table_id", ""
                                                )
                                                # Extract page and table numbers from both IDs
                                                match1 = re.search(
                                                    r"_p(\d+)_t(\d+)", table_id
                                                )
                                                match2 = re.search(
                                                    r"_p(\d+)_t(\d+)", entry_table_id
                                                )
                                                if (
                                                    match1
                                                    and match2
                                                    and match1.groups()
                                                    == match2.groups()
                                                ):
                                                    bbox_info = img_entry
                                                    break

                                # Render the PDF page
                                pdf_doc = fitz.open(PDF_FILE)
                                page = pdf_doc[
                                    page_num - 1
                                ]  # Page numbers are 1-indexed
                                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                                pdf_image = Image.frombytes(
                                    "RGB", [pix.width, pix.height], pix.samples
                                )

                                # If we have bbox info, draw a rectangle on the image
                                if bbox_info and "crop_bbox_points" in bbox_info:
                                    bbox_points = bbox_info["crop_bbox_points"]
                                    # Adjust for the zoom level (2x)
                                    x0, y0, x1, y1 = [int(p * 2) for p in bbox_points]
                                    draw = ImageDraw.Draw(pdf_image)
                                    draw.rectangle(
                                        [x0, y0, x1, y1], outline="red", width=3
                                    )

                                st.image(pdf_image, use_container_width=True)
                                st.caption(f"Page {page_num} with table highlighted")

                                pdf_doc.close()
                            except Exception as e:
                                st.error(f"Error rendering PDF: {e}")
                        else:
                            if not PDF_FILE:
                                st.info("PDF file not found")
                            elif not page_num:
                                st.info("Page number not available")
                            else:
                                st.warning("Could not render PDF")

                else:
                    st.info("No table extractions found")
            else:
                st.error("Invalid analysis format: 'output' key not found")

        except Exception as e:
            st.error(f"Error reading analysis: {e}")
    else:
        st.error(f"Analysis file not found: {ANALYSIS_FILE}")

# Extraction Rules page
elif page == "Extraction Rules":
    st.header("Extraction Rules & Schema")

    # Read and display extraction prompt
    if EXTRACTION_PROMPT_FILE.exists():
        with open(EXTRACTION_PROMPT_FILE, "r") as f:
            prompt_content = f.read()

        # Split the prompt into sections for better readability
        st.subheader("📋 Extraction Prompt")

        # Display the full prompt in tabs
        tab1, tab2 = st.tabs(["Full Prompt", "Key Rules"])

        with tab1:
            st.text_area(
                "Complete extraction prompt:",
                value=prompt_content,
                height=400,
                disabled=True,
            )

        with tab2:
            # Extract and highlight key rules
            lines = prompt_content.split("\n")

            # Find the extraction rules section
            rules_start = None
            rules_end = None
            for i, line in enumerate(lines):
                if "Extraction rules:" in line:
                    rules_start = i + 1
                if rules_start and "Return valid JSON" in line:
                    rules_end = i
                    break

            if rules_start and rules_end:
                st.subheader("Key Extraction Rules")
                for line in lines[rules_start:rules_end]:
                    if line.strip() and line.startswith("-"):
                        st.markdown(line)

            # Display JSON schema example
            st.subheader("Expected JSON Output Schema")

            # Extract the JSON format section
            json_start = None
            json_end = None
            for i, line in enumerate(lines):
                if '{"report_year"' in line:
                    json_start = i
                elif json_start and line.strip() == "}":
                    json_end = i + 1
                    break

            if json_start and json_end:
                schema_text = "\n".join(lines[json_start:json_end])
                st.code(schema_text, language="json")
            else:
                st.info("Could not extract JSON schema from prompt")

    else:
        st.error(f"Extraction prompt file not found: {EXTRACTION_PROMPT_FILE}")

# Analysis page
elif page == "Analysis":
    st.header("Table Analysis")

    if ANALYSIS_FILE and ANALYSIS_FILE.exists():
        try:
            with open(ANALYSIS_FILE) as f:
                analysis = json.load(f)

            if isinstance(analysis, list):
                st.write(f"Total entries: {len(analysis)}")

                # Search/filter
                search_term = st.text_input("Search in analysis...")

                if search_term:
                    filtered = [
                        a
                        for a in analysis
                        if search_term.lower() in json.dumps(a).lower()
                    ]
                    st.write(f"Found {len(filtered)} matching entries")
                    for item in filtered:
                        with st.expander(
                            f"Entry {analysis.index(item) if isinstance(analysis, list) else 0}"
                        ):
                            st.json(item)
                else:
                    for idx, item in enumerate(analysis):
                        with st.expander(f"Entry {idx + 1}"):
                            st.json(item)
            else:
                st.json(analysis)
        except Exception as e:
            st.error(f"Error reading analysis: {e}")
    else:
        st.info(f"Analysis file not found: {ANALYSIS_FILE}")

# Inventory page
elif page == "Inventory":
    st.header("Table Inventory")

    if INVENTORY_FILE.exists():
        try:
            df = pd.read_csv(INVENTORY_FILE)
            st.dataframe(df, use_container_width=True)

            # Stats
            col1, col2 = st.columns(2)
            col1.metric("Total Entries", len(df))
            col2.metric("Columns", len(df.columns))

            # Download option
            csv_content = df.to_csv(index=False)
            st.download_button(
                label="Download Inventory CSV",
                data=csv_content,
                file_name=INVENTORY_FILE.name,
                mime="text/csv",
            )
        except Exception as e:
            st.error(f"Error reading inventory: {e}")
    else:
        st.info(f"Inventory file not found: {INVENTORY_FILE}")

# Footer
st.divider()
st.caption(f"Output directory: {OUTPUT_DIR}")
