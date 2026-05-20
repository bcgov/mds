import importlib.util
import json
from pathlib import Path
from types import SimpleNamespace

import fitz


MODULE_PATH = Path(__file__).resolve().parents[1] / "table_extraction" / "extract_pdf_tables.py"
MODULE_SPEC = importlib.util.spec_from_file_location("extract_pdf_tables", MODULE_PATH)
assert MODULE_SPEC is not None
extract_pdf_tables = importlib.util.module_from_spec(MODULE_SPEC)
assert MODULE_SPEC.loader is not None
MODULE_SPEC.loader.exec_module(extract_pdf_tables)


def make_cell(
    row_index,
    column_index,
    content,
    row_span=1,
    column_span=1,
):
    return SimpleNamespace(
        row_index=row_index,
        column_index=column_index,
        content=content,
        row_span=row_span,
        column_span=column_span,
    )


def test_build_table_grid_repeats_spanned_cells():
    table = SimpleNamespace(
        row_count=3,
        column_count=3,
        cells=[
            make_cell(0, 0, "Category", column_span=2),
            make_cell(0, 2, "Year"),
            make_cell(1, 0, "Waste Rock"),
            make_cell(1, 1, "PAG"),
            make_cell(1, 2, "2025"),
            make_cell(2, 0, "Tailings"),
            make_cell(2, 1, "NPAG"),
            make_cell(2, 2, "2026"),
        ],
    )

    assert extract_pdf_tables.build_table_grid(table) == [
        ["Category", "Category", "Year"],
        ["Waste Rock", "PAG", "2025"],
        ["Tailings", "NPAG", "2026"],
    ]


def test_build_headers_collapses_duplicates_and_falls_back_for_blanks():
    grid = [
        ["Category", "Category", ""],
        ["Type", "Subtype", ""],
        ["Waste Rock", "PAG", "2025"],
    ]

    assert extract_pdf_tables.build_headers(grid, header_rows=2) == [
        "Category | Type",
        "Category | Subtype",
        "column_3",
    ]


def test_extract_tables_from_result_creates_flat_rows_and_markdown():
    table = SimpleNamespace(
        row_count=3,
        column_count=2,
        cells=[
            make_cell(0, 0, "Metric"),
            make_cell(0, 1, "Value"),
            make_cell(1, 0, "Area disturbed (ha)"),
            make_cell(1, 1, "15.5"),
            make_cell(2, 0, "Area reclaimed (ha)"),
            make_cell(2, 1, "3.2"),
        ],
        bounding_regions=[SimpleNamespace(page_number=7)],
    )
    result = SimpleNamespace(tables=[table])

    extracted_tables = extract_pdf_tables.extract_tables_from_result(
        result,
        source_file="reclamation_report.pdf",
        header_rows=1,
    )

    assert len(extracted_tables) == 1
    extracted_table = extracted_tables[0]

    assert extracted_table.table_id == "reclamation_report_p7_t1"
    assert extracted_table.headers == ["Metric", "Value"]
    assert extracted_table.rows == [
        {"Metric": "Area disturbed (ha)", "Value": "15.5"},
        {"Metric": "Area reclaimed (ha)", "Value": "3.2"},
    ]
    assert "| Metric | Value |" in extracted_table.markdown
    assert extracted_table.metadata["raw_grid"] == [
        ["Metric", "Value"],
        ["Area disturbed (ha)", "15.5"],
        ["Area reclaimed (ha)", "3.2"],
    ]


def test_extract_tables_from_result_remaps_filtered_page_numbers():
    table = SimpleNamespace(
        row_count=2,
        column_count=2,
        cells=[
            make_cell(0, 0, "Metric"),
            make_cell(0, 1, "Value"),
            make_cell(1, 0, "Area reclaimed (ha)"),
            make_cell(1, 1, "3.2"),
        ],
        bounding_regions=[SimpleNamespace(page_number=1)],
    )
    result = SimpleNamespace(tables=[table])

    extracted_table = extract_pdf_tables.extract_tables_from_result(
        result,
        source_file="reclamation_report.pdf",
        header_rows=1,
        page_number_map={1: 8},
    )[0]

    assert extracted_table.page_number == 8
    assert extracted_table.metadata["filtered_page_number"] == 1
    assert extracted_table.metadata["original_page_number"] == 8


def test_build_filtered_pdf_keeps_only_selected_pages(tmp_path):
    source_pdf = tmp_path / "source.pdf"
    filtered_pdf = tmp_path / "filtered.pdf"

    document = fitz.open()
    try:
        for page_number in range(1, 4):
            page = document.new_page()
            page.insert_text((72, 72), f"Page {page_number}")
        document.save(source_pdf)
    finally:
        document.close()

    extract_pdf_tables.build_filtered_pdf(source_pdf, [2, 3], filtered_pdf)

    filtered_document = fitz.open(filtered_pdf)
    try:
        assert filtered_document.page_count == 2
        assert "Page 2" in filtered_document[0].get_text()
        assert "Page 3" in filtered_document[1].get_text()
    finally:
        filtered_document.close()


def test_build_candidate_tables_adds_quality_and_shape_metadata():
    extracted_table = extract_pdf_tables.ExtractedTable(
        table_id="reclamation_report_p7_t1",
        source_file="reclamation_report.pdf",
        page_number=7,
        table_index=0,
        row_count=3,
        column_count=2,
        header_rows=1,
        headers=["Metric", "Value"],
        rows=[
            {"Metric": "Area disturbed (ha)", "Value": "15.5"},
            {"Metric": "Area reclaimed (ha)", "Value": "3.2"},
        ],
        markdown="| Metric | Value |\n| --- | --- |\n| Area disturbed (ha) | 15.5 |",
        metadata={
            "raw_grid": [
                ["Metric", "Value"],
                ["Area disturbed (ha)", "15.5"],
                ["Area reclaimed (ha)", "3.2"],
            ],
            "bounding_regions": [],
        },
    )

    candidate_table = extract_pdf_tables.build_candidate_tables([extracted_table])[0]

    assert candidate_table.candidate_id == extracted_table.table_id
    assert candidate_table.shape == "key_value"
    assert candidate_table.quality.numeric_parse_rate > 0.0
    assert candidate_table.metadata["header_rows"] == 1


def test_run_profile_extraction_uses_reclamation_profile_on_key_value_table():
    candidate_table = extract_pdf_tables.CandidateTable(
        candidate_id="reclamation_report_p7_t1",
        source_file="reclamation_report.pdf",
        page_number=7,
        table_index=0,
        extractor="azure_document_intelligence",
        headers=["Metric", "Value"],
        rows=[
            {"Metric": "Total Disturbance Area", "Value": "15.5"},
            {"Metric": "Total Reclaimed Area", "Value": "3.2"},
            {"Metric": "Mining Production", "Value": "150000"},
        ],
        raw_grid=[
            ["Metric", "Value"],
            ["Total Disturbance Area", "15.5"],
            ["Total Reclaimed Area", "3.2"],
            ["Mining Production", "150000"],
        ],
        markdown="",
        bbox=None,
        quality=extract_pdf_tables.TableQuality(
            empty_rate=0.0,
            numeric_parse_rate=0.375,
            duplicate_header_rate=0.0,
            populated_row_rate=1.0,
        ),
        shape="key_value",
        metadata={},
    )

    profile = extract_pdf_tables.get_profile_by_name("reclamation_report")
    result = extract_pdf_tables.run_profile_extraction([candidate_table], profile)

    extracted_values = {field.field_name: field.value for field in result.fields}

    assert extracted_values["area_disturbed"] == 15.5
    assert extracted_values["area_reclaimed"] == 3.2
    assert extracted_values["mining_production"] == 150000.0
    assert result.missing_required_fields == []


def test_load_azure_openai_settings_supports_repo_env_names(monkeypatch):
    monkeypatch.setenv("AZURE_BASE_URL", "https://example.openai.azure.com")
    monkeypatch.setenv("AZURE_API_KEY", "secret")
    monkeypatch.setenv("AZURE_DEPLOYMENT_NAME", "gpt-4o")
    monkeypatch.setenv("AZURE_API_VERSION", "2024-02-01")
    monkeypatch.delenv("AZURE_OPENAI_ENDPOINT", raising=False)
    monkeypatch.delenv("AZURE_OPENAI_API_KEY", raising=False)
    monkeypatch.delenv("AZURE_OPENAI_DEPLOYMENT", raising=False)
    monkeypatch.delenv("AZURE_OPENAI_API_VERSION", raising=False)

    settings = extract_pdf_tables.load_azure_openai_settings()

    assert settings == {
        "endpoint": "https://example.openai.azure.com",
        "api_key": "secret",
        "deployment": "gpt-4o",
        "api_version": "2024-02-01",
    }


def test_build_table_analysis_messages_include_prompts_and_tables():
    candidate_table = extract_pdf_tables.CandidateTable(
        candidate_id="reclamation_report_p7_t1",
        source_file="reclamation_report.pdf",
        page_number=7,
        table_index=0,
        extractor="azure_document_intelligence",
        headers=["Metric", "Value"],
        rows=[{"Metric": "Area disturbed (ha)", "Value": "15.5"}],
        raw_grid=[["Metric", "Value"], ["Area disturbed (ha)", "15.5"]],
        markdown="| Metric | Value |\n| --- | --- |\n| Area disturbed (ha) | 15.5 |",
        bbox=None,
        quality=extract_pdf_tables.TableQuality(
            empty_rate=0.0,
            numeric_parse_rate=0.25,
            duplicate_header_rate=0.0,
            populated_row_rate=1.0,
        ),
        shape="key_value",
        metadata={},
    )

    messages = extract_pdf_tables.build_table_analysis_messages(
        [candidate_table],
        table_selection_prompt="Find the reclamation metrics table.",
        output_prompt="Return area disturbed and area reclaimed as numbers.",
    )

    assert len(messages) == 2
    assert "Find the reclamation metrics table." in messages[1]["content"]
    assert "Return area disturbed and area reclaimed as numbers." in messages[1]["content"]
    assert "reclamation_report_p7_t1" in messages[1]["content"]
    assert "Area disturbed (ha)" in messages[1]["content"]


def test_extract_json_object_accepts_fenced_json():
    payload = extract_pdf_tables.extract_json_object(
        "```json\n{\n  \"matching_table_ids\": [\"table_1\"],\n  \"output\": {\"value\": 15.5}\n}\n```"
    )

    assert payload["matching_table_ids"] == ["table_1"]
    assert payload["output"]["value"] == 15.5


def test_analyze_candidate_tables_with_azure_openai_skips_client_when_no_tables(monkeypatch):
    class UnexpectedClient:
        def __init__(self, *args, **kwargs):
            raise AssertionError("AzureOpenAI should not be constructed when there are no tables")

    monkeypatch.setattr(extract_pdf_tables, "AzureOpenAI", UnexpectedClient)

    result = extract_pdf_tables.analyze_candidate_tables_with_azure_openai(
        [],
        endpoint="https://example.openai.azure.com",
        api_key="secret",
        api_version="2024-10-21",
        deployment="gpt-4o",
        table_selection_prompt="Find the production table.",
        output_prompt="Return production as JSON.",
    )

    assert result.matching_table_ids == []
    assert result.output is None
    assert result.tables_considered == 0


def test_prefilter_pdf_to_table_pages_uses_cache(tmp_path, monkeypatch):
    source_pdf = tmp_path / "source.pdf"
    output_dir = tmp_path / "output"
    cache_dir = tmp_path / "cache"

    document = fitz.open()
    try:
        for page_number in range(1, 4):
            page = document.new_page()
            page.insert_text((72, 72), f"Page {page_number}")
        document.save(source_pdf)
    finally:
        document.close()

    call_count = {"value": 0}

    def fake_detect_table_pages(file_path):
        assert file_path == source_pdf
        call_count["value"] += 1
        return [1, 3]

    monkeypatch.setattr(extract_pdf_tables, "detect_table_pages", fake_detect_table_pages)

    first_result = extract_pdf_tables.prefilter_pdf_to_table_pages(
        source_pdf=source_pdf,
        output_dir=output_dir,
        use_prefilter=True,
        cache_dir=cache_dir,
        use_cache=True,
    )

    assert call_count["value"] == 1
    assert first_result.table_pages == [1, 3]

    def unexpected_detect_table_pages(_file_path):
        raise AssertionError("detect_table_pages should not run on a cache hit")

    monkeypatch.setattr(
        extract_pdf_tables,
        "detect_table_pages",
        unexpected_detect_table_pages,
    )

    second_result = extract_pdf_tables.prefilter_pdf_to_table_pages(
        source_pdf=source_pdf,
        output_dir=output_dir,
        use_prefilter=True,
        cache_dir=cache_dir,
        use_cache=True,
    )

    assert second_result.table_pages == [1, 3]
    assert second_result.analysis_pdf.exists()


def test_analyze_pdf_tables_uses_cache(tmp_path, monkeypatch):
    source_pdf = tmp_path / "source.pdf"
    source_pdf.write_bytes(b"fake pdf")
    cache_dir = tmp_path / "cache"
    prefilter_result = extract_pdf_tables.PrefilterResult(
        source_pdf=source_pdf,
        analysis_pdf=source_pdf,
        table_pages=[],
        filtered_to_original_page_map={},
        used_prefilter=False,
    )
    table = SimpleNamespace(
        row_count=2,
        column_count=2,
        cells=[
            make_cell(0, 0, "Metric"),
            make_cell(0, 1, "Value"),
            make_cell(1, 0, "Area disturbed (ha)"),
            make_cell(1, 1, "15.5"),
        ],
        bounding_regions=[SimpleNamespace(page_number=2)],
    )
    client_calls = {"value": 0}

    class FakePoller:
        def result(self):
            return SimpleNamespace(tables=[table])

    class FakeClient:
        def __init__(self, *args, **kwargs):
            client_calls["value"] += 1

        def begin_analyze_document(self, *args, **kwargs):
            return FakePoller()

    monkeypatch.setattr(extract_pdf_tables, "DocumentIntelligenceClient", FakeClient)

    first_tables = extract_pdf_tables.analyze_pdf_tables(
        file_path=source_pdf,
        endpoint="https://example.cognitiveservices.azure.com",
        api_key="secret",
        api_version="2024-11-30",
        header_rows=1,
        model_id="prebuilt-layout",
        use_prefilter=False,
        prefilter_result=prefilter_result,
        cache_dir=cache_dir,
        use_cache=True,
    )

    assert client_calls["value"] == 1
    assert first_tables[0].table_id == "source_p2_t1"

    class UnexpectedClient:
        def __init__(self, *args, **kwargs):
            raise AssertionError("Document Intelligence client should not be constructed on a cache hit")

    monkeypatch.setattr(
        extract_pdf_tables,
        "DocumentIntelligenceClient",
        UnexpectedClient,
    )

    second_tables = extract_pdf_tables.analyze_pdf_tables(
        file_path=source_pdf,
        endpoint="https://example.cognitiveservices.azure.com",
        api_key="secret",
        api_version="2024-11-30",
        header_rows=1,
        model_id="prebuilt-layout",
        use_prefilter=False,
        prefilter_result=prefilter_result,
        cache_dir=cache_dir,
        use_cache=True,
    )

    assert second_tables[0].rows == first_tables[0].rows


def test_run_profile_extraction_cached_uses_cache(tmp_path, monkeypatch):
    cache_dir = tmp_path / "cache"
    candidate_table = extract_pdf_tables.CandidateTable(
        candidate_id="reclamation_report_p7_t1",
        source_file="reclamation_report.pdf",
        page_number=7,
        table_index=0,
        extractor="azure_document_intelligence",
        headers=["Metric", "Value"],
        rows=[
            {"Metric": "Total Disturbance Area", "Value": "15.5"},
            {"Metric": "Total Reclaimed Area", "Value": "3.2"},
        ],
        raw_grid=[
            ["Metric", "Value"],
            ["Total Disturbance Area", "15.5"],
            ["Total Reclaimed Area", "3.2"],
        ],
        markdown="",
        bbox=None,
        quality=extract_pdf_tables.TableQuality(
            empty_rate=0.0,
            numeric_parse_rate=0.333,
            duplicate_header_rate=0.0,
            populated_row_rate=1.0,
        ),
        shape="key_value",
        metadata={},
    )
    profile = extract_pdf_tables.get_profile_by_name("reclamation_report")

    first_result = extract_pdf_tables.run_profile_extraction_cached(
        [candidate_table],
        profile,
        cache_dir=cache_dir,
        use_cache=True,
    )

    assert any(field.field_name == "area_disturbed" for field in first_result.fields)

    def unexpected_run_profile_extraction(*args, **kwargs):
        raise AssertionError("run_profile_extraction should not run on a cache hit")

    monkeypatch.setattr(
        extract_pdf_tables,
        "run_profile_extraction",
        unexpected_run_profile_extraction,
    )

    second_result = extract_pdf_tables.run_profile_extraction_cached(
        [candidate_table],
        profile,
        cache_dir=cache_dir,
        use_cache=True,
    )

    assert second_result.missing_required_fields == first_result.missing_required_fields


def test_analyze_candidate_tables_with_azure_openai_cached_uses_cache(tmp_path, monkeypatch):
    cache_dir = tmp_path / "cache"
    candidate_table = extract_pdf_tables.CandidateTable(
        candidate_id="reclamation_report_p7_t1",
        source_file="reclamation_report.pdf",
        page_number=7,
        table_index=0,
        extractor="azure_document_intelligence",
        headers=["Metric", "Value"],
        rows=[{"Metric": "Area disturbed (ha)", "Value": "15.5"}],
        raw_grid=[["Metric", "Value"], ["Area disturbed (ha)", "15.5"]],
        markdown="| Metric | Value |\n| --- | --- |\n| Area disturbed (ha) | 15.5 |",
        bbox=None,
        quality=extract_pdf_tables.TableQuality(
            empty_rate=0.0,
            numeric_parse_rate=0.25,
            duplicate_header_rate=0.0,
            populated_row_rate=1.0,
        ),
        shape="key_value",
        metadata={},
    )

    class FakeResponse:
        def __init__(self):
            self.model = "gpt-4o"
            self.usage = {"prompt_tokens": 10, "completion_tokens": 5, "total_tokens": 15}
            self.choices = [
                SimpleNamespace(
                    message=SimpleNamespace(
                        content=json.dumps(
                            {
                                "matching_table_ids": ["reclamation_report_p7_t1"],
                                "matching_table_reasons": {
                                    "reclamation_report_p7_t1": "Contains the requested metric."
                                },
                                "output": {"area_disturbed": 15.5},
                                "confidence": 0.92,
                                "notes": [],
                            }
                        )
                    )
                )
            ]

    class FakeAzureOpenAI:
        def __init__(self, *args, **kwargs):
            self.chat = SimpleNamespace(
                completions=SimpleNamespace(create=lambda **kwargs: FakeResponse())
            )

    monkeypatch.setattr(extract_pdf_tables, "AzureOpenAI", FakeAzureOpenAI)

    first_result = extract_pdf_tables.analyze_candidate_tables_with_azure_openai_cached(
        [candidate_table],
        endpoint="https://example.openai.azure.com",
        api_key="secret",
        api_version="2024-10-21",
        deployment="gpt-4o",
        table_selection_prompt="Find the reclamation metrics table.",
        output_prompt="Return area disturbed as JSON.",
        cache_dir=cache_dir,
        use_cache=True,
    )

    assert first_result.output == {"area_disturbed": 15.5}

    class UnexpectedAzureOpenAI:
        def __init__(self, *args, **kwargs):
            raise AssertionError("AzureOpenAI should not be constructed on a cache hit")

    monkeypatch.setattr(extract_pdf_tables, "AzureOpenAI", UnexpectedAzureOpenAI)

    second_result = extract_pdf_tables.analyze_candidate_tables_with_azure_openai_cached(
        [candidate_table],
        endpoint="https://example.openai.azure.com",
        api_key="secret",
        api_version="2024-10-21",
        deployment="gpt-4o",
        table_selection_prompt="Find the reclamation metrics table.",
        output_prompt="Return area disturbed as JSON.",
        cache_dir=cache_dir,
        use_cache=True,
    )

    assert second_result.matching_table_ids == ["reclamation_report_p7_t1"]