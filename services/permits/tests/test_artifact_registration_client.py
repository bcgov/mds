import hashlib
from unittest.mock import MagicMock, patch

from app.pipelines.document_search.artifact_registration_client import (
    upload_document_artifacts,
)


class _MockResponse:
    def __init__(self, payload=None, headers=None):
        self._payload = payload or {}
        self.headers = headers or {}

    def raise_for_status(self):
        return None

    def json(self):
        return self._payload


def test_upload_document_artifacts_uploads_binary_and_returns_artifact_documents(monkeypatch):
    monkeypatch.setenv("DOCUMENT_MANAGER_URL", "http://document-manager:5001")

    mock_session = MagicMock()
    mock_session.token = {"access_token": "token-123"}

    upload_bytes = b"col1,col2\nA,B\n"
    upload_sha = hashlib.sha256(upload_bytes).hexdigest()

    with patch(
        "app.pipelines.document_search.artifact_registration_client._build_oauth_session",
        return_value=mock_session,
    ), patch(
        "app.pipelines.document_search.artifact_registration_client.requests.post",
        return_value=_MockResponse(
            payload={
                "document_manager_guid": "artifact-doc-guid",
                "upload": {
                    "uploadId": "upload-1",
                    "parts": [
                        {"part": 1, "size": 8, "url": "https://upload/part/1"},
                        {"part": 2, "size": 6, "url": "https://upload/part/2"},
                    ],
                },
            }
        ),
    ), patch(
        "app.pipelines.document_search.artifact_registration_client.requests.put",
        side_effect=[
            _MockResponse(headers={"ETag": "etag-1"}),
            _MockResponse(headers={"ETag": "etag-2"}),
        ],
    ), patch(
        "app.pipelines.document_search.artifact_registration_client.requests.patch",
        return_value=_MockResponse(payload={"status": "completed", "object_store_path": "permits/now/from-complete.png"}),
    ) as mock_docman_patch:
        result = upload_document_artifacts(
            source_document_manager_guid="src-guid",
            mine_guid="mine-guid",
            now_application_guid="now-guid",
            artifacts=[
                {
                    "type": "table",
                    "artifact_id": "a-1",
                    "content": {"rows": [{"a": "1"}]},
                    "extractor": {"name": "x", "version": "v1"},
                    "_artifact_upload": {
                        "file_name": "a-1.csv",
                        "mime_type": "text/csv",
                        "content_bytes": upload_bytes,
                    },
                }
            ],
            include_upload_stats=True,
        )

    assert result["upload_stats"] == {
        "candidates": 1,
        "uploaded": 1,
        "skipped": 0,
        "failed": 0,
    }
    assert result["callback"] is None
    assert len(result["artifact_documents"]) == 1
    assert result["artifact_documents"][0] == {
        "artifact_id": "a-1",
        "document_manager_guid": "artifact-doc-guid",
        "object_store_path": "permits/now/from-complete.png",
        "mime_type": "text/csv",
    }

    assert mock_docman_patch.call_count == 1

    # The upload helper strips the internal payload before returning metadata.
    assert result["artifact_documents"][0]["document_manager_guid"] == "artifact-doc-guid"
    assert upload_sha == hashlib.sha256(upload_bytes).hexdigest()


def test_upload_document_artifacts_returns_skipped_stats_when_oauth_is_unavailable(monkeypatch):
    monkeypatch.setenv("DOCUMENT_MANAGER_URL", "http://document-manager:5001")

    with patch(
        "app.pipelines.document_search.artifact_registration_client._build_oauth_session",
        return_value=None,
    ):
        result = upload_document_artifacts(
            source_document_manager_guid="src-guid",
            mine_guid="mine-guid",
            now_application_guid="now-guid",
            artifacts=[
                {
                    "type": "table",
                    "artifact_id": "a-1",
                    "extractor": {"name": "x", "version": "v1"},
                    "_artifact_upload": {
                        "file_name": "a-1.csv",
                        "mime_type": "text/csv",
                        "content_bytes": b"a,b\n1,2\n",
                    },
                }
            ],
            include_upload_stats=True,
        )

    assert result["callback"] is None
    assert result["upload_stats"] == {
        "candidates": 1,
        "uploaded": 0,
        "skipped": 1,
        "failed": 0,
    }
