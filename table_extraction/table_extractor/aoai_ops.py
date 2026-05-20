import json
import re
from pathlib import Path
from typing import Any, Dict, List, Optional, cast
from urllib.parse import urlparse

from openai import AuthenticationError, AzureOpenAI, BadRequestError

from .cache import compute_cache_key, load_cache_entry, safe_as_dict, write_cache_entry
from .models import (
    CandidateTable,
    TableAnalysisError,
    TableAnalysisResult,
    table_analysis_result_from_dict,
)

MAX_TABLES_PER_AOAI_REQUEST = 20
MAX_TABLES_PAYLOAD_CHARS = 120000


def read_prompt_value(
    inline_value: Optional[str],
    file_path: Optional[str],
    prompt_name: str,
) -> Optional[str]:
    if inline_value and file_path:
        raise TableAnalysisError(
            f"Use either --{prompt_name} or --{prompt_name}-file, not both"
        )
    if inline_value:
        return inline_value.strip()
    if file_path:
        return Path(file_path).expanduser().read_text(encoding="utf-8").strip()
    return None


def build_table_analysis_payload(
    candidate_tables: List[CandidateTable],
) -> List[Dict[str, Any]]:
    return [
        {
            "table_id": table.candidate_id,
            "page_number": table.page_number,
            "table_index": table.table_index,
            "shape": table.shape,
            "headers": table.headers,
            "quality": table.quality.to_dict(),
            "markdown": table.markdown,
            "caption": table.metadata.get("caption"),
            "caption_text": (
                str((table.metadata.get("caption") or {}).get("content", ""))
                if isinstance(table.metadata.get("caption"), dict)
                else ""
            ),
            "footnotes": table.metadata.get("footnotes") or [],
            "footnote_texts": [
                str(item.get("content", ""))
                for item in (table.metadata.get("footnotes") or [])
                if isinstance(item, dict) and item.get("content")
            ],
        }
        for table in candidate_tables
    ]


def build_table_analysis_messages(
    candidate_tables: List[CandidateTable],
    table_selection_prompt: str,
    output_prompt: str,
) -> List[Dict[str, str]]:
    tables_payload = json.dumps(
        build_table_analysis_payload(candidate_tables), indent=2
    )
    return [
        {
            "role": "system",
            "content": (
                "You analyze tables extracted from PDF documents. Use only the provided table data. "
                "Return valid JSON only. If no table matches, return matching_table_ids as an empty array and output as null."
            ),
        },
        {
            "role": "user",
            "content": (
                "Table description:\n"
                f"{table_selection_prompt}\n\n"
                "Desired output description:\n"
                f"{output_prompt}\n\n"
                "Available extracted tables (JSON):\n"
                f"{tables_payload}\n\n"
                "Return a JSON object with these top-level keys:\n"
                "matching_table_ids: array of table ids that best match the table description\n"
                "matching_table_reasons: object keyed by table id with a short reason\n"
                "output: the final result shaped to satisfy the desired output description\n"
                "confidence: number from 0 to 1\n"
                "notes: array of short caveats or assumptions"
            ),
        },
    ]


def build_chunk_consolidation_messages(
    chunk_results: List[TableAnalysisResult],
    table_selection_prompt: str,
    output_prompt: str,
) -> List[Dict[str, str]]:
    chunk_payload = [
        {
            "chunk_index": index + 1,
            "matching_table_ids": result.matching_table_ids,
            "matching_table_reasons": result.matching_table_reasons,
            "output": result.output,
            "confidence": result.confidence,
            "notes": result.notes,
        }
        for index, result in enumerate(chunk_results)
    ]

    return [
        {
            "role": "system",
            "content": (
                "You merge partial table-analysis results from multiple chunks. "
                "Return valid JSON only."
            ),
        },
        {
            "role": "user",
            "content": (
                "Table description:\n"
                f"{table_selection_prompt}\n\n"
                "Desired output description:\n"
                f"{output_prompt}\n\n"
                "Chunk-level partial results (JSON):\n"
                f"{json.dumps(chunk_payload, indent=2)}\n\n"
                "Return a JSON object with these top-level keys:\n"
                "matching_table_ids: merged array of best matching table ids across chunks\n"
                "matching_table_reasons: object keyed by table id with a short reason\n"
                "output: the final merged output satisfying the desired output description\n"
                "confidence: number from 0 to 1\n"
                "notes: array of short caveats or assumptions"
            ),
        },
    ]


def extract_json_object(text: str) -> Dict[str, Any]:
    stripped = text.strip()
    if stripped.startswith("```"):
        stripped = re.sub(r"^```(?:json)?\s*", "", stripped)
        stripped = re.sub(r"\s*```$", "", stripped)

    try:
        parsed = json.loads(stripped)
    except json.JSONDecodeError:
        start = stripped.find("{")
        end = stripped.rfind("}")
        if start == -1 or end == -1 or end <= start:
            raise TableAnalysisError("Azure OpenAI did not return a JSON object")
        parsed = json.loads(stripped[start : end + 1])

    if not isinstance(parsed, dict):
        raise TableAnalysisError("Azure OpenAI returned JSON, but it was not an object")
    return parsed


def normalize_table_analysis_result(
    payload: Dict[str, Any],
    raw_response: str,
    model: str,
    usage: Dict[str, Any],
    table_selection_prompt: str,
    output_prompt: str,
    tables_considered: int,
) -> TableAnalysisResult:
    matching_table_ids = (
        payload.get("matching_table_ids")
        or payload.get("selected_table_ids")
        or payload.get("table_ids")
        or []
    )
    if not isinstance(matching_table_ids, list):
        matching_table_ids = [matching_table_ids]

    matching_table_ids = [str(table_id) for table_id in matching_table_ids if table_id]
    matching_table_reasons = (
        payload.get("matching_table_reasons") or payload.get("selection_reasons") or {}
    )
    if not isinstance(matching_table_reasons, dict):
        matching_table_reasons = {}

    confidence = payload.get("confidence", 0.0)
    try:
        confidence = float(confidence)
    except (TypeError, ValueError):
        confidence = 0.0

    notes = payload.get("notes") or []
    if not isinstance(notes, list):
        notes = [str(notes)]

    return TableAnalysisResult(
        matching_table_ids=matching_table_ids,
        matching_table_reasons={
            str(key): str(value) for key, value in matching_table_reasons.items()
        },
        output=payload.get("output"),
        confidence=max(0.0, min(confidence, 1.0)),
        notes=[str(note) for note in notes],
        raw_response=raw_response,
        model=model,
        usage=usage,
        table_selection_prompt=table_selection_prompt,
        output_prompt=output_prompt,
        tables_considered=tables_considered,
    )


def split_candidate_tables_for_aoai(
    candidate_tables: List[CandidateTable],
    max_tables_per_request: int = MAX_TABLES_PER_AOAI_REQUEST,
    max_payload_chars: int = MAX_TABLES_PAYLOAD_CHARS,
) -> List[List[CandidateTable]]:
    if not candidate_tables:
        return []

    chunked_tables: List[List[CandidateTable]] = []
    current_chunk: List[CandidateTable] = []
    current_chars = 2

    for table in candidate_tables:
        table_payload = build_table_analysis_payload([table])[0]
        table_payload_chars = len(json.dumps(table_payload))

        should_start_new_chunk = bool(current_chunk) and (
            len(current_chunk) >= max_tables_per_request
            or current_chars + table_payload_chars > max_payload_chars
        )

        if should_start_new_chunk:
            chunked_tables.append(current_chunk)
            current_chunk = []
            current_chars = 2

        current_chunk.append(table)
        current_chars += table_payload_chars

    if current_chunk:
        chunked_tables.append(current_chunk)

    return chunked_tables


def _merge_chunk_results_locally(
    chunk_results: List[TableAnalysisResult],
    table_selection_prompt: str,
    output_prompt: str,
    tables_considered: int,
) -> TableAnalysisResult:
    merged_ids: List[str] = []
    merged_reasons: Dict[str, str] = {}
    merged_notes: List[str] = []
    merged_usage: Dict[str, Any] = {}
    best_output = None
    best_confidence = -1.0
    model = ""
    raw_parts: List[str] = []

    for index, result in enumerate(chunk_results):
        if not model and result.model:
            model = result.model

        raw_parts.append(f"--- chunk {index + 1} ---\n{result.raw_response}")

        for table_id in result.matching_table_ids:
            if table_id not in merged_ids:
                merged_ids.append(table_id)

        for key, value in result.matching_table_reasons.items():
            merged_reasons.setdefault(key, value)

        for note in result.notes:
            note_text = str(note)
            if note_text and note_text not in merged_notes:
                merged_notes.append(note_text)

        for key, value in result.usage.items():
            if isinstance(value, (int, float)):
                merged_usage[key] = merged_usage.get(key, 0) + value
            elif key not in merged_usage:
                merged_usage[key] = value

        if result.output is not None and result.confidence >= best_confidence:
            best_output = result.output
            best_confidence = result.confidence

    if best_confidence < 0:
        best_confidence = 0.0

    return TableAnalysisResult(
        matching_table_ids=merged_ids,
        matching_table_reasons=merged_reasons,
        output=best_output,
        confidence=max(0.0, min(best_confidence, 1.0)),
        notes=merged_notes,
        raw_response="\n\n".join(raw_parts),
        model=model,
        usage=merged_usage,
        table_selection_prompt=table_selection_prompt,
        output_prompt=output_prompt,
        tables_considered=tables_considered,
    )


def _create_azure_openai_client(
    endpoint: str,
    api_key: str,
    api_version: str,
) -> AzureOpenAI:
    return AzureOpenAI(
        azure_endpoint=endpoint,
        api_key=api_key,
        api_version=api_version,
        default_headers={"Authorization": f"Bearer {api_key}"},
    )


def _run_table_analysis_request(
    client: AzureOpenAI,
    deployment: str,
    messages: List[Dict[str, str]],
) -> Any:
    return client.chat.completions.create(
        model=deployment,
        messages=cast(Any, messages),
        temperature=0,
        response_format={"type": "json_object"},
    )


def analyze_candidate_tables_with_azure_openai(
    candidate_tables: List[CandidateTable],
    endpoint: str,
    api_key: str,
    api_version: str,
    deployment: str,
    table_selection_prompt: str,
    output_prompt: str,
) -> TableAnalysisResult:
    if not candidate_tables:
        return TableAnalysisResult(
            matching_table_ids=[],
            matching_table_reasons={},
            output=None,
            confidence=0.0,
            notes=["No tables were extracted from the document."],
            raw_response="",
            model=deployment,
            usage={},
            table_selection_prompt=table_selection_prompt,
            output_prompt=output_prompt,
            tables_considered=0,
        )

    if AzureOpenAI is None:
        raise TableAnalysisError(
            "The openai package is not installed in this environment. Install it to enable Azure OpenAI analysis."
        )
    if not endpoint:
        raise TableAnalysisError("Azure OpenAI endpoint is not set")
    if not api_key:
        raise TableAnalysisError("Azure OpenAI API key is not set")
    if not deployment:
        raise TableAnalysisError("Azure OpenAI deployment name is not set")

    client = _create_azure_openai_client(
        endpoint=endpoint,
        api_key=api_key,
        api_version=api_version,
    )

    chunked_tables = split_candidate_tables_for_aoai(candidate_tables)
    chunk_results: List[TableAnalysisResult] = []

    try:
        for chunk in chunked_tables:
            response = _run_table_analysis_request(
                client=client,
                deployment=deployment,
                messages=build_table_analysis_messages(
                    chunk,
                    table_selection_prompt=table_selection_prompt,
                    output_prompt=output_prompt,
                ),
            )
            raw_response = response.choices[0].message.content or ""
            payload = extract_json_object(raw_response)
            chunk_results.append(
                normalize_table_analysis_result(
                    payload,
                    raw_response=raw_response,
                    model=getattr(response, "model", deployment),
                    usage=safe_as_dict(getattr(response, "usage", {})),
                    table_selection_prompt=table_selection_prompt,
                    output_prompt=output_prompt,
                    tables_considered=len(chunk),
                )
            )

        if not chunk_results:
            raise TableAnalysisError("Azure OpenAI analysis produced no results")

        if len(chunk_results) == 1:
            result = chunk_results[0]
            result.tables_considered = len(candidate_tables)
            return result

        try:
            consolidation_response = _run_table_analysis_request(
                client=client,
                deployment=deployment,
                messages=build_chunk_consolidation_messages(
                    chunk_results=chunk_results,
                    table_selection_prompt=table_selection_prompt,
                    output_prompt=output_prompt,
                ),
            )
            consolidation_raw_response = (
                consolidation_response.choices[0].message.content or ""
            )
            consolidation_payload = extract_json_object(consolidation_raw_response)
            consolidated_result = normalize_table_analysis_result(
                consolidation_payload,
                raw_response=consolidation_raw_response,
                model=getattr(consolidation_response, "model", deployment),
                usage=safe_as_dict(getattr(consolidation_response, "usage", {})),
                table_selection_prompt=table_selection_prompt,
                output_prompt=output_prompt,
                tables_considered=len(candidate_tables),
            )

            for result in chunk_results:
                for key, value in result.usage.items():
                    if isinstance(value, (int, float)):
                        consolidated_result.usage[key] = (
                            consolidated_result.usage.get(key, 0) + value
                        )

            return consolidated_result
        except Exception:
            return _merge_chunk_results_locally(
                chunk_results=chunk_results,
                table_selection_prompt=table_selection_prompt,
                output_prompt=output_prompt,
                tables_considered=len(candidate_tables),
            )

    except AuthenticationError as error:
        endpoint_host = urlparse(normalized_endpoint).netloc or normalized_endpoint
        is_proxy_endpoint = "azurewebsites.net" in endpoint_host
        hint = (
            "Check that AZURE_OPENAI_ENDPOINT points to your Azure OpenAI resource base URL "
            "(for example https://<resource>.openai.azure.com), and that the key belongs to that same resource."
        )
        if is_proxy_endpoint:
            hint = (
                "The configured endpoint looks like a proxy endpoint. Verify that the proxy accepts this key "
                "and forwards requests to the intended Azure OpenAI deployment."
            )
        if (
            "cognitiveservices.azure.com" in endpoint_host
            and "openai.azure.com" not in endpoint_host
        ):
            hint = (
                "The configured endpoint looks like a Cognitive Services endpoint, not an Azure OpenAI endpoint. "
                "Use the Azure OpenAI resource endpoint (https://<resource>.openai.azure.com)."
            )

        raise TableAnalysisError(
            "Azure OpenAI authentication failed (401). "
            f"endpoint_host={endpoint_host}, deployment={deployment}, api_version={api_version}. "
            f"{hint}"
        ) from error
    except BadRequestError as error:
        message = str(error)
        if "context_length" in message or "maximum context length" in message.lower():
            raise TableAnalysisError(
                "Azure OpenAI request exceeded context length even after chunking. "
                "Try reducing table content size (for example shorter markdown or fewer rows per candidate table)."
            ) from error
        raise


def analyze_candidate_tables_with_azure_openai_cached(
    candidate_tables: List[CandidateTable],
    endpoint: str,
    api_key: str,
    api_version: str,
    deployment: str,
    table_selection_prompt: str,
    output_prompt: str,
    cache_dir: Optional[Path],
    use_cache: bool,
) -> TableAnalysisResult:
    if not use_cache or cache_dir is None:
        return analyze_candidate_tables_with_azure_openai(
            candidate_tables,
            endpoint=endpoint,
            api_key=api_key,
            api_version=api_version,
            deployment=deployment,
            table_selection_prompt=table_selection_prompt,
            output_prompt=output_prompt,
        )

    cache_key = compute_cache_key(
        "aoai_analysis",
        {
            "candidate_tables": [table.to_dict() for table in candidate_tables],
            "api_version": api_version,
            "deployment": deployment,
            "table_selection_prompt": table_selection_prompt,
            "output_prompt": output_prompt,
        },
    )
    cached_payload = load_cache_entry(cache_dir, "aoai_analysis", cache_key)
    if cached_payload is not None:
        return table_analysis_result_from_dict(cached_payload["result"])

    result = analyze_candidate_tables_with_azure_openai(
        candidate_tables,
        endpoint=endpoint,
        api_key=api_key,
        api_version=api_version,
        deployment=deployment,
        table_selection_prompt=table_selection_prompt,
        output_prompt=output_prompt,
    )
    write_cache_entry(
        cache_dir,
        "aoai_analysis",
        cache_key,
        {"result": result.to_dict()},
    )
    return result
