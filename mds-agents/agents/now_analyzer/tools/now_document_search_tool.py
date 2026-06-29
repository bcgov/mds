"""Azure AI Search tool for querying indexed NOW application documents.

This tool queries the permits indexing pipeline's Azure AI Search index
to retrieve documents for a BC Notice of Work (NOW) application.

Features:
  - Mandatory GUID filtering for data isolation
  - Semantic search + OData filter merging
  - Result caching per GUID within a workflow run
  - Structured output with document metadata

Environment variables (required):
  AZURE_SEARCH_SERVICE_ENDPOINT  — https://<service>.search.windows.net
  AZURE_SEARCH_API_KEY           — Azure Search admin key
  AZURE_NOW_SEARCH_INDEX_NAME    — Index name (e.g., "now-application-index")
"""

import logging
import os
from dataclasses import asdict, dataclass
from typing import Any, Optional

from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient

# Simple in-memory cache for results within a workflow run
_search_cache: dict[str, Any] = {}
logger = logging.getLogger(__name__)


def _safe_guid(guid: str) -> str:
    """Return a redacted GUID for logs to avoid noisy/sensitive output."""
    if not guid:
        return "<empty>"
    if len(guid) <= 8:
        return guid
    return f"{guid[:8]}...{guid[-4:]}"


@dataclass
class NOWDocument:
    """Structured representation of a retrieved document chunk."""

    id: str
    document_name: str
    document_type: str
    submitted_date: Optional[str]
    artifact_type: Optional[str]
    artifact_category: Optional[str]
    content_excerpt: str
    page_number: Optional[int] = None
    artifact_summary: Optional[str] = None


def _get_search_client() -> SearchClient:
    """Initialize and return Azure Search client.
    
    Raises:
        ValueError: If required environment variables are not set.
    """
    endpoint = os.environ.get("AZURE_SEARCH_SERVICE_ENDPOINT")
    api_key = os.environ.get("AZURE_SEARCH_API_KEY")
    index_name = os.environ.get("AZURE_NOW_SEARCH_INDEX_NAME", "now-application-index")

    logger.debug(
        "Initializing Azure Search client (endpoint_set=%s, key_set=%s, index=%s)",
        bool(endpoint),
        bool(api_key),
        index_name,
    )

    if not endpoint or not api_key:
        logger.error(
            "Missing required Azure Search environment variables "
            "(AZURE_SEARCH_SERVICE_ENDPOINT, AZURE_SEARCH_API_KEY)"
        )
        raise ValueError(
            "Missing required environment variables: "
            "AZURE_SEARCH_SERVICE_ENDPOINT, AZURE_SEARCH_API_KEY"
        )

    return SearchClient(
        endpoint=endpoint,
        index_name=index_name,
        credential=AzureKeyCredential(api_key),
    )


def _build_filter(
    now_application_guid: str, additional_filters: Optional[dict[str, Any]] = None
) -> str:
    """Build an OData filter string with mandatory GUID isolation.
    
    Args:
        now_application_guid: The NOW application GUID (mandatory filter).
        additional_filters: Optional dict with filters to merge:
            - document_type: str or list of str (exact match, case-sensitive)
            - artifact_type: str or list of str
            - artifact_category: str or list of str
            - submitted_date_from: str (ISO format)
            - submitted_date_to: str (ISO format)
    
    Returns:
        OData filter string suitable for Azure Search.
    """
    filters = []

    # Mandatory: NOW application GUID isolation
    filters.append(f"now_application_guid eq '{now_application_guid}'")

    if not additional_filters:
        return " and ".join(filters)

    # document_type filter
    if "document_type" in additional_filters:
        doc_types = additional_filters["document_type"]
        if isinstance(doc_types, str):
            filters.append(f"document_type eq '{doc_types}'")
        elif isinstance(doc_types, list):
            type_filters = " or ".join([f"document_type eq '{dt}'" for dt in doc_types])
            filters.append(f"({type_filters})")

    # artifact_type filter
    if "artifact_type" in additional_filters:
        art_types = additional_filters["artifact_type"]
        if isinstance(art_types, str):
            filters.append(f"artifact_type eq '{art_types}'")
        elif isinstance(art_types, list):
            type_filters = " or ".join([f"artifact_type eq '{at}'" for at in art_types])
            filters.append(f"({type_filters})")

    # artifact_category filter
    if "artifact_category" in additional_filters:
        art_cats = additional_filters["artifact_category"]
        if isinstance(art_cats, str):
            filters.append(f"artifact_category eq '{art_cats}'")
        elif isinstance(art_cats, list):
            cat_filters = " or ".join([f"artifact_category eq '{ac}'" for ac in art_cats])
            filters.append(f"({cat_filters})")

    # Date range filters
    if "submitted_date_from" in additional_filters:
        date_from = additional_filters["submitted_date_from"]
        filters.append(f"submitted_date ge {date_from}")

    if "submitted_date_to" in additional_filters:
        date_to = additional_filters["submitted_date_to"]
        filters.append(f"submitted_date le {date_to}")

    final_filter = " and ".join(filters)
    logger.debug("Built OData filter: %s", final_filter)
    return final_filter


def _format_result(doc: dict[str, Any]) -> NOWDocument:
    """Convert raw Azure Search result to NOWDocument.
    
    Args:
        doc: Raw search result from Azure Search.
    
    Returns:
        Structured NOWDocument with key metadata fields.
    """
    return NOWDocument(
        id=doc.get("id", ""),
        document_name=doc.get("document_name", "Unknown"),
        document_type=doc.get("document_type", "Unknown"),
        submitted_date=doc.get("submitted_date"),
        artifact_type=doc.get("artifact_type"),
        artifact_category=doc.get("artifact_category"),
        content_excerpt=doc.get("content", "")[:500],  # First 500 chars
        page_number=doc.get("artifact_page_number"),
        artifact_summary=doc.get("artifact_summary"),
    )


def search_now_documents(
    now_application_guid: str,
    search_query: Optional[str] = None,
    filters: Optional[dict[str, Any]] = None,
    top_k: int = 100,
    use_cache: bool = True,
) -> list[dict[str, Any]]:
    """Query Azure AI Search for NOW application documents.
    
    Always enforces now_application_guid filter for data isolation.
    Supports semantic search (query text) + OData filtering.
    Results are cached by GUID to avoid redundant queries in a workflow run.
    
    Args:
        now_application_guid: The NOW application GUID to query documents for.
        search_query: Optional search query (semantic search). If None, retrieves all.
        filters: Optional OData filter dict (see _build_filter for supported keys).
        top_k: Max results to return (default 100).
        use_cache: Whether to cache results per GUID (default True).
    
    Returns:
        List of structured NOWDocument dicts (converted from NOWDocument dataclass).
        Empty list if no results found or on error.
    
    Raises:
        ValueError: If required environment variables missing.
        Exception: If Azure Search API call fails (logs and returns empty list).
    
    Example:
        docs = search_now_documents(
            "f47ac10b-58cc-4372-a567-0e02b2c3d479",
            search_query="environmental management plan",
            filters={"document_type": ["Application", "Amendment"]},
            top_k=50,
        )
    """
    logger.info(
        "search_now_documents called (guid=%s, query_provided=%s, top_k=%d, use_cache=%s)",
        _safe_guid(now_application_guid),
        bool(search_query),
        top_k,
        use_cache,
    )

    # Check cache
    cache_key = f"{now_application_guid}:{search_query}:{str(filters)}"
    if use_cache and cache_key in _search_cache:
        logger.debug(
            "Cache hit for search request (guid=%s, cache_entries=%d)",
            _safe_guid(now_application_guid),
            len(_search_cache),
        )
        return _search_cache[cache_key]

    logger.debug("Cache miss for search request (guid=%s)", _safe_guid(now_application_guid))

    try:
        client = _get_search_client()
        odata_filter = _build_filter(now_application_guid, filters)

        logger.debug(
            "Executing Azure Search query (guid=%s, query=%s, top_k=%d)",
            _safe_guid(now_application_guid),
            search_query or "*",
            top_k,
        )

        # Perform search
        results = client.search(
            search_text=search_query or "*",
            filter=odata_filter,
            top=top_k,
            select=[
                "id",
                "document_name",
                "document_type",
                "submitted_date",
                "artifact_type",
                "artifact_category",
                "content",
                "artifact_page_number",
                "artifact_summary",
            ],
        )

        # Format results
        docs = [_format_result(doc) for doc in results]
        formatted_docs = [asdict(doc) for doc in docs]

        if not formatted_docs:
            logger.warning(
                "No documents found in Azure Search (guid=%s, query=%s)",
                _safe_guid(now_application_guid),
                search_query or "*",
            )
        else:
            logger.info(
                "Retrieved %d document chunks from Azure Search (guid=%s)",
                len(formatted_docs),
                _safe_guid(now_application_guid),
            )

        # Cache and return
        if use_cache:
            _search_cache[cache_key] = formatted_docs
            logger.debug(
                "Stored search results in cache (guid=%s, cache_entries=%d)",
                _safe_guid(now_application_guid),
                len(_search_cache),
            )

        return formatted_docs

    except Exception:
        logger.exception(
            "Error querying Azure Search for NOW application (guid=%s)",
            _safe_guid(now_application_guid),
        )
        return []


def clear_search_cache() -> None:
    """Clear the in-memory search result cache.
    
    Useful for resetting between multiple workflow runs or test isolation.
    """
    global _search_cache
    logger.debug("Clearing search cache (entries=%d)", len(_search_cache))
    _search_cache.clear()
    logger.debug("Search cache cleared")
