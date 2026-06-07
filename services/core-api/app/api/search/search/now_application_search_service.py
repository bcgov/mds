import json
import os
from typing import Iterator

import requests
from app.api.services.document_manager_service import DocumentManagerService
from app.config import Config
from authlib.integrations.requests_client import OAuth2Session
from flask import current_app
from sseclient import SSEClient
from werkzeug.exceptions import BadGateway


class NowApplicationSearchService:
    """
    Proxy service that authenticates with the permits service (via OAuth2 client credentials)
    and forwards NoW application document search and indexing requests.

    The now_application_guid is always passed as a URL path segment so the permits service
    can enforce the isolation filter — it is never derived from request body content.
    """
    _oidc_configuration = None
    _docman_base_url = None

    @property
    def oidc_configuration(self):
        if not self._oidc_configuration:
            well_known_config = os.getenv('JWT_OIDC_WELL_KNOWN_CONFIG')
            self._oidc_configuration = requests.get(well_known_config).json()
        return self._oidc_configuration

    @property
    def search_base(self):
        return f'{Config.PERMITS_ENDPOINT}/document_search'

    @property
    def docman_base_url(self):
        if self._docman_base_url is None:
            self._docman_base_url = (Config.DOCUMENT_MANAGER_URL or '').rstrip('/')
        return self._docman_base_url

    @property
    def session(self):
        if not hasattr(self, '_session'):
            self._session = OAuth2Session(
                client_id=Config.PERMITS_CLIENT_ID,
                client_secret=Config.PERMITS_CLIENT_SECRET,
                token_endpoint=self.oidc_configuration['token_endpoint'],
                grant_type='client_credentials',
            )
            self._session.fetch_token()
        return self._session

    def search(self, now_application_guid: str, search_params: dict):
        """
        Performs a streaming search against the permits service scoped to a single
        NoW application. Returns a transformed SSE stream where artifact hits are
        enriched with a pre-authenticated Document Manager URL generated from
        artifact_document_manager_guid.
        """
        current_app.logger.info(
            'Searching NoW application documents for guid=%s, query=%r',
            now_application_guid,
            search_params.get('query'),
        )
        response = self.session.post(
            f'{self.search_base}/{now_application_guid}/search',
            json={
                'query': search_params.get('query', ''),
                'filters': search_params.get('filters'),
            },
            stream=True,
            timeout=(10, 300),
        )
        current_app.logger.info(
            'Haystack search response status for guid=%s: %d',
            now_application_guid,
            response.status_code,
        )
        if not response.ok:
            current_app.logger.error(
                'Permits service returned %d searching NoW application %s: %s',
                response.status_code,
                now_application_guid,
                response.text,
            )
            raise BadGateway('Could not search NoW application documents in the permits service')

        return self._iter_enriched_sse(response)

    def _iter_enriched_sse(self, upstream_response) -> Iterator[bytes]:
        token_cache = {}
        try:
            for event in SSEClient(upstream_response).events():
                yield self._serialize_sse_event(
                    self._enrich_documents_event(event, token_cache)
                )
        finally:
            upstream_response.close()

    def _enrich_documents_event(self, event, token_cache: dict):
        if event.event != "documents" or not event.data:
            return event

        try:
            payload = json.loads(event.data)
        except (json.JSONDecodeError, TypeError):
            return event

        documents = payload.get("documents")
        if not isinstance(documents, list):
            return event

        for document in documents:
            meta = document.get("meta")
            if not isinstance(meta, dict):
                continue

            artifact_document_manager_guid = meta.get("artifact_document_manager_guid")
            if not artifact_document_manager_guid:
                continue

            token = token_cache.get(artifact_document_manager_guid)
            if token is None:
                token = str(DocumentManagerService.create_download_token(artifact_document_manager_guid))
                token_cache[artifact_document_manager_guid] = token

            if self.docman_base_url:
                meta["artifact_presigned_url"] = self._resolve_artifact_presigned_url(token)

        event.data = json.dumps(payload)
        return event

    def _serialize_sse_event(self, event) -> bytes:
        lines = []
        if getattr(event, "id", None):
            lines.append(f"id: {event.id}")
        if getattr(event, "event", None):
            lines.append(f"event: {event.event}")
        if getattr(event, "retry", None):
            lines.append(f"retry: {event.retry}")
        for data_line in str(getattr(event, "data", "")).splitlines() or [""]:
            lines.append(f"data: {data_line}")

        return ("\n".join(lines) + "\n\n").encode("utf-8")

    def _resolve_artifact_presigned_url(self, token: str) -> str:
        fallback_url = f"{self.docman_base_url}/documents?token={token}"
        try:
            response = requests.get(
                f"{self.docman_base_url}/documents",
                params={"token": token, "presigned_url": "true"},
                timeout=10,
            )
            response.raise_for_status()
            payload = response.json() if response.content else {}
            presigned_url = payload.get("url") if isinstance(payload, dict) else None
            if isinstance(presigned_url, str) and presigned_url:
                return presigned_url
            current_app.logger.warning("Docman presigned URL response did not include a usable url field.")
        except requests.RequestException as exc:
            current_app.logger.warning("Failed to fetch docman presigned URL, using token URL fallback: %s", exc)
        except ValueError as exc:
            current_app.logger.warning(
                "Invalid JSON from docman presigned URL endpoint, using token URL fallback: %s",
                exc,
            )
        return fallback_url
