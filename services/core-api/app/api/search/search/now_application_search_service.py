import json
import os
import tempfile

import requests
from app.api.services.document_manager_service import DocumentManagerService
from app.config import Config
from authlib.integrations.requests_client import OAuth2Session
from flask import current_app
from werkzeug.exceptions import InternalServerError

JWT_OIDC_WELL_KNOWN_CONFIG = os.getenv('JWT_OIDC_WELL_KNOWN_CONFIG')

oidc_configuration = requests.get(JWT_OIDC_WELL_KNOWN_CONFIG).json()

_SEARCH_BASE = f'{Config.PERMITS_ENDPOINT}/document_search'


class NowApplicationSearchService:
    """
    Proxy service that authenticates with the permits service (via OAuth2 client credentials)
    and forwards NoW application document search and indexing requests.

    The now_application_guid is always passed as a URL path segment so the permits service
    can enforce the isolation filter — it is never derived from request body content.
    """

    def __init__(self):
        self.session = OAuth2Session(
            client_id=Config.PERMITS_CLIENT_ID,
            client_secret=Config.PERMITS_CLIENT_SECRET,
            token_endpoint=oidc_configuration['token_endpoint'],
            grant_type='client_credentials',
        )
        self.session.fetch_token()

    def search(self, now_application_guid: str, search_params: dict):
        """
        Performs a streaming search against the permits service scoped to a single
        NoW application. Returns the raw streaming response for the caller to proxy.
        """
        current_app.logger.info(
            'Searching NoW application documents for guid=%s, query=%r',
            now_application_guid,
            search_params.get('query'),
        )
        response = self.session.post(
            f'{_SEARCH_BASE}/{now_application_guid}/search',
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
        return response

    def cancel_indexing(self, now_application_guid: str) -> dict:
        """Revokes the active Celery indexing task for the given NoW application."""
        response = self.session.delete(
            f'{_SEARCH_BASE}/{now_application_guid}/index',
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
            f'{_SEARCH_BASE}/{now_application_guid}/index/status',
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
        Indexes all provided documents for the given NoW application.

        ``documents`` is a list of dicts, each containing:
            document_manager_guid, document_name, document_type,
            mine_guid, mine_name, mine_number, submitted_date (optional)

        For each document, this method downloads the file from Document Manager and
        streams it to the permits service as a multipart upload together with the
        metadata array. All Azure integrations (Document Intelligence, blob storage,
        Azure Search) happen inside the permits service.
        """
        current_app.logger.info(
            'Indexing %d documents for NoW application guid=%s',
            len(documents),
            now_application_guid,
        )

        tmp_paths = []
        upload_handles = []
        multipart_files = []

        try:
            for doc in documents:
                document_manager_guid = doc.get('document_manager_guid')
                if not document_manager_guid:
                    current_app.logger.warning('Skipping document with no document_manager_guid')
                    continue

                tmp = tempfile.NamedTemporaryFile(delete=False)
                tmp_paths.append(tmp.name)

                file_name, _ = DocumentManagerService().download_document_to_file(
                    document_manager_guid, tmp
                )
                tmp.close()

                # Reopen a clean handle for the multipart upload; tracked for cleanup.
                upload_fh = open(tmp.name, 'rb')
                upload_handles.append(upload_fh)
                multipart_files.append(
                    ('files', (file_name or doc.get('document_name', 'document'), upload_fh, 'application/octet-stream'))
                )

            if not multipart_files:
                raise InternalServerError('No downloadable documents found for this NoW application')

            result = self.session.post(
                f'{_SEARCH_BASE}/{now_application_guid}/index',
                files=multipart_files,
                data={'metadata': json.dumps(documents)},
            )

            if result.status_code != 200:
                current_app.logger.error(
                    'Permits service returned %d while indexing NoW application %s: %s',
                    result.status_code,
                    now_application_guid,
                    result.text,
                )
                raise InternalServerError('Failed to index NoW application documents')

            return result.json()

        finally:
            for fh in upload_handles:
                try:
                    fh.close()
                except OSError:
                    pass
            for tmp_path in tmp_paths:
                try:
                    os.unlink(tmp_path)
                except OSError:
                    pass
