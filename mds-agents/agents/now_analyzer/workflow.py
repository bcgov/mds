"""NOW Application Analyzer — Magentic multi-agent workflow.

Analyzes BC government Notice of Work (mining) applications to determine
whether submitted documents contain all required information.

Agents:
  CompletenessCheckerAgent — queries indexed documents and checks against BC NOW requirements
  ReportWriterAgent        — drafts a structured completeness assessment
  QAReviewerAgent          — reviews all prior work and flags any gaps or errors

The NOWOrchestratorAgent (Magentic manager) coordinates the three agents above,
deciding which to invoke next and when the analysis is complete.

Environment variables (loaded from .env or shell):
  AZURE_OPENAI_ENDPOINT     — https://<resource>.openai.azure.com
  AZURE_OPENAI_API_KEY      — Azure OpenAI API key
  AZURE_OPENAI_MODEL        — deployment name (e.g. gpt-4o)
  AZURE_OPENAI_API_VERSION  — optional, defaults to latest stable
"""

import json
import os

from agent_framework import Agent
from agent_framework.openai import OpenAIChatClient
from agent_framework.orchestrations import MagenticBuilder
from dotenv import load_dotenv

from .tools import lookup_now_application_in_core as _lookup_now_application_in_core
from .tools import parse_findings_from_json as _parse_findings_from_json
from .tools import (
    read_now_regional_checklist_requirements as _read_now_regional_checklist_requirements,
)
from .tools import search_now_documents as _search_now_documents
from .tools import write_now_checklist_report as _write_now_checklist_report

load_dotenv()

# ---------------------------------------------------------------------------
# Shared Azure OpenAI client
# ---------------------------------------------------------------------------
client = OpenAIChatClient(
    azure_endpoint=os.environ["AZURE_OPENAI_ENDPOINT"],
    api_key=os.environ["AZURE_OPENAI_API_KEY"],
    model=os.environ["AZURE_OPENAI_MODEL"],
    api_version=os.environ.get("AZURE_OPENAI_API_VERSION"),
    default_headers={"Authorization": f"Bearer {os.environ['AZURE_OPENAI_API_KEY']}"},
)

# ---------------------------------------------------------------------------
# Tool wrapper for agent framework
# ---------------------------------------------------------------------------
def search_now_documents(now_application_guid: str, search_query: str | None = None, filters: str | None = None) -> str:
    """Search indexed NOW documents in Azure AI Search.

    Args:
        now_application_guid: UUID of the NOW application to search documents for.
        search_query: Optional search query string to filter documents.
        filters: Optional JSON string with filter criteria (e.g., document_type, artifact_category).

    Returns:
        JSON string containing list of matching documents with metadata.
    """
    parsed_filters = None
    if filters:
        try:
            parsed_filters = json.loads(filters) if isinstance(filters, str) else filters
        except (json.JSONDecodeError, TypeError):
            parsed_filters = None

    results = _search_now_documents(
        now_application_guid=now_application_guid,
        search_query=search_query,
        filters=parsed_filters,
        top_k=100,
    )
    return json.dumps(results, indent=2, default=str)


def read_now_regional_checklist_requirements(
    include_intake_process: bool = False,
    include_group_headers: bool = False,
) -> str:
    """Load NOW regional checklist requirements from hardcoded list.

    Args:
        include_intake_process: Deprecated. Kept for backward compatibility (always includes all requirements).
        include_group_headers: Deprecated. Kept for backward compatibility.

    Returns:
        JSON string containing list of requirement records with section and requirement keys.
    """
    requirements = _read_now_regional_checklist_requirements(
        include_intake_process=include_intake_process,
        include_group_headers=include_group_headers,
    )
    return json.dumps(requirements, indent=2, default=str)


def lookup_now_application_in_core(
    now_application_guid: str,
    original: bool = False,
) -> str:
    """Fetch NOW application metadata from Core API.

    Args:
        now_application_guid: NOW application GUID.
        original: If true, requests original submission representation.

    Returns:
        JSON string with lookup result and application payload from Core API.
    """
    result = _lookup_now_application_in_core(
        now_application_guid=now_application_guid,
        original=original,
    )
    return json.dumps(result, indent=2, default=str)


def write_now_checklist_report(
    findings_json: str,
    output_filename: str = "now_application_completeness_report.xlsx",
    applicant_name: str | None = None,
    now_number: str | None = None,
) -> str:
    """Generate Excel report from NOW completeness findings.

    Args:
        findings_json: JSON string array of finding records. Each record must have:
            - section (str): Section name from checklist
            - requirement (str): Requirement text from checklist
            - status (str): 'True', 'False', or 'N/A'
            - actual_value (str): Concrete extracted value (e.g., "Bridget Tetarenko")
            - summary (str): Evidence narrative/context (optional)
            - evidence_value (str): Backward-compatible evidence text/value (optional)
            - is_instruction (bool): True if instruction header, False otherwise
        output_filename: Name for output Excel file. Defaults to "now_application_completeness_report.xlsx".
        applicant_name: Optional project/applicant name to include in report header.
        now_number: Optional NOW application number to include in report header.

    Returns:
        JSON string with success flag and report path: {"success": true, "report_path": "/path/to/file.xlsx"} 
        or error: {"error": "error message"}.
    """
    try:
        findings = _parse_findings_from_json(findings_json)
    except Exception as e:
        raise Exception(json.dumps({"error": f"Failed to parse findings: {str(e)}"}))
    
    try:
        report_path = _write_now_checklist_report(
            findings=findings,
            output_filename=output_filename,
            applicant_name=applicant_name if applicant_name else None,
            now_number=now_number if now_number else None,
        )
        return json.dumps({"success": True, "report_path": report_path})
    except Exception as e:
        return json.dumps({"error": f"Failed to write report: {str(e)}"})

# ---------------------------------------------------------------------------
# Specialist agents (Magentic participants)
# ---------------------------------------------------------------------------

completeness_checker_agent = Agent(
    client=client,
    name="CompletenessCheckerAgent",
    description=(
        "Queries indexed NOW documents as the primary source, verifies with Core API data, "
        "detects discrepancies between the two sources, and writes the completeness report."
    ),
    instructions=(
        "You are a BC mining regulation specialist for Notice of Work (NOW) applications.\n\n"
        "GOALS:\n"
        "1. Search indexed documents (primary evidence source) to evaluate each checklist requirement.\n"
        "2. Fetch and verify Core API metadata; detect discrepancies (files in search but not API, vice versa, metadata mismatches).\n"
        "3. Evaluate all checklist items (True/False/N/A) with evidence from search results.\n"
        "4. Highlight discrepancies in the summary field (e.g., 'file.pdf missing from index' or 'metadata differs from API').\n"
        "5. Write the Excel report with all findings.\n\n"
        "TOOLS:\n"
        "- search_now_documents(now_application_guid, search_query, filters) — Query indexed NOW documents (PRIMARY).\n"
        "- lookup_now_application_in_core(now_application_guid, original) — Fetch Core API metadata and file listings (VERIFY).\n"
        "- read_now_regional_checklist_requirements() — Load all checklist requirements.\n"
        "- write_now_checklist_report(findings_json, output_filename, applicant_name, now_number) — Write Excel report.\n\n"
        "KEY CONSTRAINTS:\n"
        "- Search indexed documents FIRST; use Core API for verification, metadata enrichment, and file listings only.\n"
        "- Evaluate ALL checklist items — include True, False, and N/A statuses in final output.\n"
        "- ALWAYS compare search results against Core API file listings and flag any discrepancies in the summary:\n"
        "    • Files found in search but not in API → Note 'Search-only (potentially lost/unregistered)'\n"
        "    • Files in API but not found in search → Note 'Missing from index (API-only)'\n"
        "    • Metadata mismatches → Note the specific difference\n"
        "- Output JSON schema (for write_now_checklist_report):\n"
        "  [\n"
        "    {\n"
        "      \"section\": \"<string>\",\n"
        "      \"requirement\": \"<string>\",\n"
        "      \"status\": \"True\" | \"False\" | \"N/A\",\n"
        "      \"actual_value\": \"<exact value from search; empty string if not found>\",\n"
        "      \"summary\": \"<evidence from search + discrepancies/missing notes>\",\n"
        "      \"evidence_value\": \"<optional; copy of actual_value>\",\n"
        "      \"file_name\": \"<name from search; empty if not found>\",\n"
        "      \"page_number\": \"<number from search; empty if not found>\",\n"
        "      \"is_instruction\": false\n"
        "    }\n"
        "  ]\n"
        "- Call write_now_checklist_report exactly once with the complete findings array.\n"
        "- Do not ask the user for input."
    ),
    tools=[
        search_now_documents,
        lookup_now_application_in_core,
        read_now_regional_checklist_requirements,
        write_now_checklist_report,
    ],
)

# ---------------------------------------------------------------------------
# Magentic manager / orchestrator
# ---------------------------------------------------------------------------

orchestrator_agent = Agent(
    client=client,
    name="NOWOrchestratorAgent",
    description="Dispatches to CompletenessCheckerAgent and stops when it reports the Excel path.",
    instructions=(
        "You coordinate a BC mining Notice of Work (NOW) completeness review.\n\n"
        "WORKFLOW:\n"
        "1. Invoke CompletenessCheckerAgent exactly once, passing the now_application_guid.\n"
        "2. When it reports 'Excel Report Generated: [path]', the workflow is COMPLETE. STOP.\n\n"
        "Do not invoke any agent more than once. Do not loop."
    ),
)

# ---------------------------------------------------------------------------
# Magentic workflow
# ---------------------------------------------------------------------------

workflow = (
    MagenticBuilder(
        participants=[
            completeness_checker_agent,
        ],
        manager_agent=orchestrator_agent,
        intermediate_output_from=[
            completeness_checker_agent,
        ],
        max_round_count=20,   # 1 dispatch + 1 agent run + 1 buffer
        max_stall_count=1,
    )
    .build()
)
