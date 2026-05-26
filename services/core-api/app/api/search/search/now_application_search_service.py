import io
import json
import os
from typing import Iterator

import requests
from app.api.services.document_manager_service import DocumentManagerService
from app.config import Config
from authlib.integrations.requests_client import OAuth2Session
from flask import current_app
from werkzeug.exceptions import BadGateway, InternalServerError


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
            timeout=(10, 300),  # (connect timeout, read timeout in seconds)
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
        event_lines = []

        try:
            for raw_line in upstream_response.iter_lines(decode_unicode=True):
                if raw_line is None:
                    continue

                if raw_line == "":
                    if event_lines:
                        enriched_lines = self._enrich_documents_event(event_lines, token_cache)
                        yield ("\n".join(enriched_lines) + "\n\n").encode("utf-8")
                        event_lines = []
                    else:
                        yield b"\n"
                    continue

                event_lines.append(raw_line)

            if event_lines:
                enriched_lines = self._enrich_documents_event(event_lines, token_cache)
                yield ("\n".join(enriched_lines) + "\n\n").encode("utf-8")
        finally:
            upstream_response.close()

    def _enrich_documents_event(self, event_lines: list[str], token_cache: dict) -> list[str]:
        event_type = None
        data_lines = []

        for line in event_lines:
            if line.startswith("event:"):
                event_type = line.split(":", 1)[1].strip()
            elif line.startswith("data:"):
                data_lines.append(line.split(":", 1)[1].lstrip())

        if event_type != "documents" or not data_lines:
            return event_lines

        try:
            payload = json.loads("\n".join(data_lines))
        except (json.JSONDecodeError, TypeError):
            return event_lines

        documents = payload.get("documents")
        if not isinstance(documents, list):
            return event_lines

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

        enriched_payload = json.dumps(payload)
        rewritten_lines = []
        data_written = False
        for line in event_lines:
            if line.startswith("data:"):
                if not data_written:
                    rewritten_lines.append(f"data: {enriched_payload}")
                    data_written = True
                continue
            rewritten_lines.append(line)

        if not data_written:
            rewritten_lines.append(f"data: {enriched_payload}")

        return rewritten_lines

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
            current_app.logger.warning("Invalid JSON from docman presigned URL endpoint, using token URL fallback: %s", exc)
        return fallback_url

    def cancel_indexing(self, now_application_guid: str) -> dict:
        """Revokes the active Celery indexing task for the given NoW application."""
        response = self.session.delete(
            f'{self.search_base}/{now_application_guid}/index',
            timeout=10,
        )
        if not response.ok:
            current_app.logger.error(
                'Permits service returned %d cancelling indexing for %s: %s',
                response.status_code, now_application_guid, response.text,
            )
            from werkzeug.exceptions import BadGateway
            raise BadGateway('Could not cancel indexing task in the permits service')
        return response.json()

    def get_index_status(self, now_application_guid: str) -> dict:
        """Returns the current Azure Search indexer status for the given NoW application."""
        response = self.session.get(
            f'{self.search_base}/{now_application_guid}/index/status',
        )
        if not response.ok:
            current_app.logger.error(
                'Permits service returned %d fetching index status for %s: %s',
                response.status_code, now_application_guid, response.text,
            )
            from werkzeug.exceptions import BadGateway
            raise BadGateway('Could not retrieve indexer status from the permits service')
        return response.json()

    def index_documents(self, now_application_guid: str, documents: list) -> dict:
        """
        Indexes all provided documents for the given NoW application, one at a time.

        Each document is downloaded from Document Manager into an in-memory buffer,
        forwarded to the permits service as a single-file multipart upload, then the
        buffer is released before the next document is downloaded. This keeps peak
        memory bounded to roughly one document at a time rather than the full set.

        ``documents`` is a list of dicts, each containing:
            document_manager_guid, document_name, document_type,
            mine_guid, submitted_date (optional)
        """
        current_app.logger.info(
            'Indexing %d documents for NoW application guid=%s',
            len(documents),
            now_application_guid,
        )

        queued = 0
        for doc in documents:
            document_manager_guid = doc.get('document_manager_guid')
            if not document_manager_guid:
                current_app.logger.warning('Skipping document with no document_manager_guid')
                continue

            buf = io.BytesIO()
            file_name, _ = DocumentManagerService().download_document_to_file(
                document_manager_guid, buf
            )
            buf.seek(0)

            result = self.session.post(
                f'{self.search_base}/{now_application_guid}/index',
                files=[('files', (file_name or doc.get('document_name', 'document'), buf, 'application/octet-stream'))],
                data={'metadata': json.dumps([doc])},
            )

            # buf goes out of scope here; CPython will free the memory immediately.

            if result.status_code == 200:
                queued += 1
            elif result.status_code == 409:
                current_app.logger.warning(
                    'Document %s already being indexed for NoW application %s, skipping',
                    document_manager_guid,
                    now_application_guid,
                )
            else:
                current_app.logger.error(
                    'Permits service returned %d indexing document %s for NoW application %s: %s',
                    result.status_code,
                    document_manager_guid,
                    now_application_guid,
                    result.text,
                )
                raise InternalServerError('Failed to index NoW application documents')

        if queued == 0:
            raise InternalServerError('No documents were successfully queued for indexing')

        return {'status': 'running', 'queued': queued}
