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
        "4. Mention discrepancies in your chat reply only (e.g., 'file.pdf missing from index'); keep spreadsheet cells to the one-sentence summary.\n"
        "5. Write the Excel report with all findings when the user asks for a complete review or report.\n\n"
        "TOOLS:\n"
        "- search_now_documents(now_application_guid, search_query, filters) — Query indexed NOW documents (PRIMARY).\n"
        "- lookup_now_application_in_core(now_application_guid, original) — Fetch Core API metadata and file listings (VERIFY).\n"
        "- read_now_regional_checklist_requirements() — Load all checklist requirements.\n"
        "- write_now_checklist_report(findings_json, output_filename, applicant_name, now_number) — Write Excel report.\n\n"
        "STATUS RULES:\n"
        "- 'True' if present; 'False' if missing; 'N/A' if not applicable. If unclear, mark 'False'.\n"
        "- Present means a completed section in the form and/or an attachment included and listed in the attachment summary.\n"
        "- Summary: ONE sentence in wording consistent with the application, ending with the page as '(p. N)'. "
        "Use page numbers from search results only; never guess.\n"
        "- Evaluate every Tier 1/2/3 row (e.g. '<=10,000 bulk sampling of ore'); do not skip any.\n"
        "- 'MX Tier #:' (NoW Application section): decide it from the Tier rows you just evaluated, in the checklist order of the sheet. "
        "A row is a trigger when its status is True and it is an Activity Type or Activity Level & Land Disturbance row of that tier "
        "(e.g. '<= 5 km new exploration access construction' is a Tier 2 trigger; '> 5 km ...' or 'Blasting' are Tier 3 triggers). "
        "A Tier 1 Activity Level row marked False means the Tier 1 limit is exceeded, so the application is at least Tier 2 "
        "(e.g. '< 1km new exploration access construction' False with 3.8 km proposed). "
        "Tier 3 First Nations rows that are True (not commenced, opposition, complex overlap) are Tier 3 triggers. "
        "Rule: any Tier 3 trigger -> Tier 3; otherwise any Tier 2 trigger or any exceeded Tier 1 limit -> Tier 2; otherwise Tier 1. "
        "Never state 'no Tier 2 triggers' while a Tier 2 row is True or a Tier 1 limit row is False. "
        "Mark 'True' when a tier is determined; the summary is one sentence like 'MX Tier assessed as Tier 2: <triggering rows> (pp. N, N).' "
        "Evaluate this row after the Tier rows.\n"
        "- Report only the checklist; no extra text in cells.\n\n"
        "KEY CONSTRAINTS:\n"
        "- Search indexed documents FIRST; use Core API for verification, metadata enrichment, and file listings only.\n"
        "- Evaluate ALL checklist items — include True, False, and N/A statuses in final output.\n"
        "- ALWAYS compare search results against Core API file listings and report any discrepancies in your chat reply (never in the spreadsheet):\n"
        "    • Files found in search but not in API → Note 'Search-only (potentially lost/unregistered)'\n"
        "    • Files in API but not found in search → Note 'Missing from index (API-only)'\n"
        "    • Metadata mismatches → Note the specific difference\n"
        "- Output JSON schema (for write_now_checklist_report):\n"
        "  [\n"
        "    {\n"
        "      \"section\": \"<string>\",\n"
        "      \"requirement\": \"<string>\",\n"
        "      \"status\": \"True\" | \"False\" | \"N/A\",\n"
        "      \"summary\": \"<one sentence consistent with application wording; page added as (p. N)>\",\n"
        "      \"page_number\": \"<number from search; empty if not found>\",\n"
        "      \"is_instruction\": false\n"
        "    }\n"
        "  ]\n"
        "- For a complete review or report request, call write_now_checklist_report exactly once with the complete findings array.\n"
        "- For a focused follow-up, answer directly from the indexed documents and Core API without generating a new report unless requested.\n"
        "- Keep all follow-up work scoped to the NOW application GUID established in the conversation.\n"
        "- Ask for a NOW application GUID only when the conversation does not establish one.\n"
        "- End your response with the findings summary and report path. Do not offer or suggest additional work."
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
    description="Coordinates complete NOW reviews and focused analyst follow-up questions.",
    instructions=(
        "You coordinate a BC mining Notice of Work (NOW) analyst conversation.\n\n"
        "THREAD CONTEXT:\n"
        "- Use the prior conversation to retain the NOW application GUID and the current review context.\n"
        "- For a new review, identify the GUID in the user's request and invoke CompletenessCheckerAgent once.\n"
        "- For a follow-up question, invoke CompletenessCheckerAgent once with the established GUID and the user's focused request.\n"
        "- If no GUID is available, ask the user to provide one.\n\n"
        "COMPLETION:\n"
        "- Complete reviews should produce an Excel report.\n"
        "- Focused follow-ups should return a concise evidence-based answer and only produce a report when explicitly requested.\n"
        "- Do not invoke any participant more than once per user message. Do not loop.\n"
        "- Once CompletenessCheckerAgent returns a report path or a direct answer, the request is satisfied; finish immediately."
    ),
)

# ---------------------------------------------------------------------------
# Magentic workflow
# ---------------------------------------------------------------------------


def build_now_analyzer_workflow():
    """Build a fresh Workflow instance so concurrent runs don't share Magentic round-count state."""
    return (
        MagenticBuilder(
            participants=[
                completeness_checker_agent,
            ],
            manager_agent=orchestrator_agent,
            intermediate_output_from=[
                completeness_checker_agent,
            ],
            max_round_count=3,   # 1 dispatch + 1 agent run + 1 buffer
            max_stall_count=1,
        )
        .build()
    )


# Singleton kept for the existing DevUI discovery entry point (agents/now_analyzer/__init__.py).
workflow = build_now_analyzer_workflow()
