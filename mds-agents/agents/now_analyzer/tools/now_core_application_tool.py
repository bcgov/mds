"""Core API tool for fetching NOW application data.

This tool retrieves a Notice of Work (NOW) application record from Core API
so the agent can use canonical application metadata during analysis.

Environment variables:
  MDS_CORE_API_BASE_URL   — Optional base URL for Core API.
                            Defaults to test env:
                            https://mds-test.apps.silver.devops.gov.bc.ca/api
  MDS_CORE_API_TOKEN      — Optional bearer token for Core API authentication.
  MDS_CORE_API_TIMEOUT_S  — Optional HTTP timeout in seconds (default 30).
"""

from __future__ import annotations

import os
from typing import Any
from urllib.parse import urlencode

import requests

DEFAULT_CORE_API_BASE_URL = "https://mds-test.apps.silver.devops.gov.bc.ca/api"

_token_cache: dict[str, Any] = {
    "access_token": None,
    "expires_at": 0,
}


def _build_base_url() -> str:
    base_url = os.environ.get("MDS_CORE_API_BASE_URL", DEFAULT_CORE_API_BASE_URL).strip()
    return base_url.rstrip("/")


def _build_headers() -> dict[str, str]:
    headers = {"Accept": "application/json"}
    token = _get_core_bearer_token()
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


def _token_timeout_seconds() -> int:
    raw_value = os.environ.get("MDS_CORE_API_TOKEN_TIMEOUT_S", "30").strip()
    try:
        parsed = int(raw_value)
    except ValueError:
        return 30
    return parsed if parsed > 0 else 30


def _get_core_bearer_token() -> str:
    static_token = os.environ.get("MDS_CORE_API_TOKEN", "").strip()
    if static_token:
        return static_token

    token_url = os.environ.get("MDS_CORE_API_TOKEN_URL", "").strip()
    client_id = os.environ.get("MDS_CORE_API_CLIENT_ID", "").strip()
    client_secret = os.environ.get("MDS_CORE_API_CLIENT_SECRET", "").strip()

    if not token_url or not client_id or not client_secret:
        return ""

    try:
        import time

        now = int(time.time())
        cached_token = _token_cache.get("access_token")
        cached_expiry = int(_token_cache.get("expires_at") or 0)
        if cached_token and cached_expiry > now + 30:
            return str(cached_token)

        payload: dict[str, str] = {
            "grant_type": "client_credentials",
            "client_id": client_id,
            "client_secret": client_secret,
        }

        scope = os.environ.get("MDS_CORE_API_TOKEN_SCOPE", "").strip()
        audience = os.environ.get("MDS_CORE_API_TOKEN_AUDIENCE", "").strip()
        resource = os.environ.get("MDS_CORE_API_TOKEN_RESOURCE", "").strip()
        if scope:
            payload["scope"] = scope
        if audience:
            payload["audience"] = audience
        if resource:
            payload["resource"] = resource

        response = requests.post(
            token_url,
            data=payload,
            timeout=_token_timeout_seconds(),
            headers={"Accept": "application/json"},
        )
        response.raise_for_status()
        token_payload = response.json()

        access_token = token_payload.get("access_token")
        if not access_token:
            return ""

        expires_in = int(token_payload.get("expires_in", 300))
        _token_cache["access_token"] = access_token
        _token_cache["expires_at"] = now + max(30, expires_in)
        return str(access_token)
    except Exception:
        return ""


def _timeout_seconds() -> int:
    raw_value = os.environ.get("MDS_CORE_API_TIMEOUT_S", "30").strip()
    try:
        parsed = int(raw_value)
    except ValueError:
        return 30
    return parsed if parsed > 0 else 30


def lookup_now_application_in_core(
    now_application_guid: str,
    original: bool = False,
) -> dict[str, Any]:
    """Fetch NOW application details from Core API.

    Args:
        now_application_guid: NOW application GUID.
        original: If true, request the original submission payload.

    Returns:
        Dict containing core API response metadata and application payload.
    """
    if not now_application_guid or not now_application_guid.strip():
        return {"error": "now_application_guid is required"}

    base_url = _build_base_url()
    headers = _build_headers()
    timeout_s = _timeout_seconds()

    params = {"original": "true" if original else "false"}
    url = f"{base_url}/now-applications/{now_application_guid.strip()}?{urlencode(params)}"

    try:
        response = requests.get(url, headers=headers, timeout=timeout_s)
    except requests.RequestException as exc:
        return {
            "error": "Failed to call Core API",
            "details": str(exc),
            "url": url,
            "base_url": base_url,
        }

    if not response.ok:
        return {
            "error": "Core API request failed",
            "status_code": response.status_code,
            "url": url,
            "response_text": response.text,
        }

    try:
        payload = response.json()
    except ValueError:
        return {
            "error": "Core API returned non-JSON response",
            "status_code": response.status_code,
            "url": url,
            "response_text": response.text,
        }

    return {
        "success": True,
        "status_code": response.status_code,
        "url": url,
        "application": payload,
    }
