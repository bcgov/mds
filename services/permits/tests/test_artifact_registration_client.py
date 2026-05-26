import hashlib
from unittest.mock import MagicMock, patch

from app.pipelines.document_search.artifact_registration_client import register_document_artifacts


class _MockResponse:
    def __init__(self, payload=None, headers=None):
        self._payload = payload or {}
        self.headers = headers or {}

    def raise_for_status(self):
        return None

    def json(self):
        return self._payload


def test_register_document_artifacts_strips_internal_upload_payload(monkeypatch):
    monkeypatch.delenv("DOCUMENT_MANAGER_URL", raising=False)

    mock_session = MagicMock()
    mock_session.post.return_value = _MockResponse(payload={"status": "ok"})

    with patch(
        "app.pipelines.document_search.artifact_registration_client._core_api_base_url",
        return_value="http://core-api:3000",
    ), patch(
        "app.pipelines.document_search.artifact_registration_client._build_oauth_session",
        return_value=mock_session,
    ):
        result = register_document_artifacts(
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
                        "content_bytes": b"a,b\n1,2\n",
                    },
                }
            ],
        )

    assert result == {"status": "ok"}
    payload = mock_session.post.call_args.kwargs["json"]
    assert len(payload["artifacts"]) == 1
    assert "_artifact_upload" not in payload["artifacts"][0]
    assert "artifact" not in payload["artifacts"][0]


def test_register_document_artifacts_uploads_binary_and_enriches_payload(monkeypatch):
    monkeypatch.setenv("DOCUMENT_MANAGER_URL", "http://document-manager:5001")

    mock_session = MagicMock()
    mock_session.token = {"access_token": "token-123"}
    mock_session.post.return_value = _MockResponse(payload={"status": "ok"})

    upload_bytes = b"col1,col2\nA,B\n"
    upload_sha = hashlib.sha256(upload_bytes).hexdigest()

    with patch(
        "app.pipelines.document_search.artifact_registration_client._core_api_base_url",
        return_value="http://core-api:3000",
    ), patch(
        "app.pipelines.document_search.artifact_registration_client._build_oauth_session",
        return_value=mock_session,
    ), patch(
        "app.pipelines.document_search.artifact_registration_client.requests.post",
        return_value=_MockResponse(
            payload={
                "document_manager_guid": "artifact-doc-guid",
                "object_store_path": "permits/now/from-init.png",
                "upload": {
                    "uploadId": "upload-1",
                    "parts": [
                        {"part": 1, "size": 8, "url": "https://upload/part/1"},
                        {"part": 2, "size": 6, "url": "https://upload/part/2"},
                    ],
                },
            }
        ),
    ) as mock_docman_post, patch(
        "app.pipelines.document_search.artifact_registration_client.requests.put",
        side_effect=[
            _MockResponse(headers={"ETag": "etag-1"}),
            _MockResponse(headers={"ETag": "etag-2"}),
        ],
    ) as mock_docman_put, patch(
        "app.pipelines.document_search.artifact_registration_client.requests.patch",
        return_value=_MockResponse(payload={"status": "completed"}),
    ) as mock_docman_patch:
        result = register_document_artifacts(
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
        )

    assert result == {"status": "ok"}
    assert mock_docman_post.call_count == 1
    assert mock_docman_put.call_count == 2
    assert mock_docman_patch.call_count == 1

    init_headers = mock_docman_post.call_args.kwargs["headers"]
    assert init_headers["Folder"] == "permits/now/now-guid/artifacts/src-guid"
    assert init_headers["Pretty-Folder"] == "permits/now/now-guid/artifacts/src-guid"
    assert init_headers["Prettyfolder"] == "permits/now/now-guid/artifacts/src-guid"

    callback_payload = mock_session.post.call_args.kwargs["json"]
    callback_artifact = callback_payload["artifacts"][0]
    assert "_artifact_upload" not in callback_artifact
    assert callback_artifact["artifact"]["document_manager_guid"] == "artifact-doc-guid"
    assert callback_artifact["artifact"]["document_name"] == "a-1.csv"
    assert callback_artifact["artifact"]["mime_type"] == "text/csv"
    assert callback_artifact["artifact"]["sha256"] == upload_sha
    assert callback_artifact["artifact"]["object_store_path"] == "permits/now/from-init.png"


def test_register_document_artifacts_fetches_object_store_path_when_missing(monkeypatch):
    monkeypatch.setenv("DOCUMENT_MANAGER_URL", "http://document-manager:5001")

    mock_session = MagicMock()
    mock_session.token = {"access_token": "token-123"}
    mock_session.post.return_value = _MockResponse(payload={"status": "ok"})

    with patch(
        "app.pipelines.document_search.artifact_registration_client._core_api_base_url",
        return_value="http://core-api:3000",
    ), patch(
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
                        {"part": 1, "size": 4, "url": "https://upload/part/1"},
                    ],
                },
            }
        ),
    ), patch(
        "app.pipelines.document_search.artifact_registration_client.requests.put",
        return_value=_MockResponse(headers={"ETag": "etag-1"}),
    ), patch(
        "app.pipelines.document_search.artifact_registration_client.requests.patch",
        return_value=_MockResponse(payload={"status": "completed"}),
    ), patch(
        "app.pipelines.document_search.artifact_registration_client.requests.get",
        return_value=_MockResponse(payload={"object_store_path": "permits/now/from-lookup.png"}),
    ) as mock_docman_get:
        register_document_artifacts(
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
                        "content_bytes": b"a,b\n1,2\n",
                    },
                }
            ],
        )

    callback_payload = mock_session.post.call_args.kwargs["json"]
    callback_artifact = callback_payload["artifacts"][0]
    assert callback_artifact["artifact"]["object_store_path"] == "permits/now/from-lookup.png"
    assert mock_docman_get.call_count == 1


def test_register_document_artifacts_returns_upload_stats_when_requested(monkeypatch):
    monkeypatch.delenv("DOCUMENT_MANAGER_URL", raising=False)

    mock_session = MagicMock()
    mock_session.post.return_value = _MockResponse(payload={"status": "ok"})

    with patch(
        "app.pipelines.document_search.artifact_registration_client._core_api_base_url",
        return_value="http://core-api:3000",
    ), patch(
        "app.pipelines.document_search.artifact_registration_client._build_oauth_session",
        return_value=mock_session,
    ):
        result = register_document_artifacts(
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
                        "content_bytes": b"a,b\n1,2\n",
                    },
                }
            ],
            include_upload_stats=True,
        )

    assert result["callback"] == {"status": "ok"}
    assert result["upload_stats"] == {
        "candidates": 1,
        "uploaded": 0,
        "skipped": 1,
        "failed": 0,
    }


def test_register_document_artifacts_returns_skipped_stats_when_callback_not_configured(monkeypatch):
    monkeypatch.delenv("CORE_API_URL", raising=False)
    monkeypatch.delenv("CORE_API_BASE_URL", raising=False)

    result = register_document_artifacts(
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
