import logging
import os
from typing import Optional

import requests
from app.pipelines.document_search.permits_oauth_session_helper import build_permits_oauth_session

logger = logging.getLogger(__name__)


class DocumentManagerDownloadClient:
    def __init__(self, core_api_base_url: Optional[str] = None, document_manager_base_url: Optional[str] = None):
        self.core_api_base_url = (
            core_api_base_url or os.getenv("CORE_API_URL") or os.getenv("CORE_API_BASE_URL") or ""
        ).rstrip("/")
        self.document_manager_base_url = (
            document_manager_base_url or os.getenv("DOCUMENT_MANAGER_URL") or ""
        ).rstrip("/")

    def download_to_file(self, document_manager_guid: str, file_obj):
        token = self._create_download_token(document_manager_guid)
        response = requests.get(
            f"{self.document_manager_base_url}/documents",
            params={"token": token},
            stream=True,
            timeout=(10, 300),
        )
        response.raise_for_status()

        for chunk in response.iter_content(chunk_size=1024 * 1024):
            if chunk:
                file_obj.write(chunk)

        file_obj.seek(0)
        return self._extract_file_name(response) or document_manager_guid, file_obj

    def _create_download_token(self, document_manager_guid: str) -> str:
        if not self.core_api_base_url:
            raise ValueError("CORE_API_URL/CORE_API_BASE_URL is required to create document download tokens.")
        if not self.document_manager_base_url:
            raise ValueError("DOCUMENT_MANAGER_URL is required to download documents.")

        session = build_permits_oauth_session()
        if not session:
            raise ValueError("OAuth client credentials are required to create document download tokens.")

        response = session.get(
            f"{self.core_api_base_url}/download-token/{document_manager_guid}",
            timeout=30,
        )
        response.raise_for_status()
        payload = response.json() or {}
        token = payload.get("token_guid")
        if not token:
            raise ValueError("Core API download-token response did not include token_guid.")
        return token

    @staticmethod
    def _extract_file_name(response) -> Optional[str]:
        content_disposition = (
            response.headers.get("content-disposition")
            or response.headers.get("Content-Disposition")
        )
        if not content_disposition:
            return None
        marker = "filename="
        if marker not in content_disposition:
            return None
        return content_disposition.split(marker, 1)[1].strip().strip('"')
