"""Unit tests for Core API NOW lookup tool."""

from unittest.mock import MagicMock, patch

from agents.now_analyzer.tools.now_core_application_tool import (
    _token_cache,
    lookup_now_application_in_core,
)


class TestLookupNOWApplicationInCore:
    """Test suite for lookup_now_application_in_core function."""

    def setup_method(self):
        _token_cache["access_token"] = None
        _token_cache["expires_at"] = 0

    def test_requires_guid(self):
        result = lookup_now_application_in_core("", original=False)
        assert result["error"] == "now_application_guid is required"

    def test_successful_lookup_uses_default_test_base_url(self):
        mock_response = MagicMock()
        mock_response.ok = True
        mock_response.status_code = 200
        mock_response.json.return_value = {"now_number": "1234-2025-001", "project_name": "Demo Project"}

        with patch.dict("os.environ", {}, clear=True):
            with patch("agents.now_analyzer.tools.now_core_application_tool.requests.get", return_value=mock_response) as mock_get:
                result = lookup_now_application_in_core("f47ac10b-58cc-4372-a567-0e02b2c3d479")

        assert result["success"] is True
        assert result["status_code"] == 200
        assert result["application"]["now_number"] == "1234-2025-001"
        assert result["url"].startswith("https://mds-test.apps.silver.devops.gov.bc.ca/api/now-applications/")

        called_kwargs = mock_get.call_args.kwargs
        assert called_kwargs["timeout"] == 30
        assert called_kwargs["headers"]["Accept"] == "application/json"
        assert "Authorization" not in called_kwargs["headers"]

    def test_uses_auth_token_when_configured(self):
        mock_response = MagicMock()
        mock_response.ok = True
        mock_response.status_code = 200
        mock_response.json.return_value = {"ok": True}

        with patch.dict(
            "os.environ",
            {
                "MDS_CORE_API_BASE_URL": "https://example.test/api",
                "MDS_CORE_API_TOKEN": "secret-token",
                "MDS_CORE_API_TIMEOUT_S": "45",
            },
            clear=True,
        ):
            with patch("agents.now_analyzer.tools.now_core_application_tool.requests.get", return_value=mock_response) as mock_get:
                lookup_now_application_in_core("guid-123", original=True)

        called_kwargs = mock_get.call_args.kwargs
        assert called_kwargs["timeout"] == 45
        assert called_kwargs["headers"]["Authorization"] == "Bearer secret-token"

    def test_handles_non_ok_response(self):
        mock_response = MagicMock()
        mock_response.ok = False
        mock_response.status_code = 401
        mock_response.text = "Unauthorized"

        with patch("agents.now_analyzer.tools.now_core_application_tool.requests.get", return_value=mock_response):
            result = lookup_now_application_in_core("guid-123")

        assert result["error"] == "Core API request failed"
        assert result["status_code"] == 401

    def test_client_credentials_token_used_when_static_token_missing(self):
        token_response = MagicMock()
        token_response.json.return_value = {
            "access_token": "oauth-token",
            "expires_in": 300,
        }
        token_response.raise_for_status.return_value = None

        api_response = MagicMock()
        api_response.ok = True
        api_response.status_code = 200
        api_response.json.return_value = {"ok": True}

        with patch.dict(
            "os.environ",
            {
                "MDS_CORE_API_BASE_URL": "https://example.test/api",
                "MDS_CORE_API_TOKEN_URL": "https://auth.example.test/token",
                "MDS_CORE_API_CLIENT_ID": "cid",
                "MDS_CORE_API_CLIENT_SECRET": "csecret",
                "MDS_CORE_API_TOKEN_SCOPE": "openid profile",
            },
            clear=True,
        ):
            with patch("agents.now_analyzer.tools.now_core_application_tool.requests.post", return_value=token_response) as mock_post:
                with patch("agents.now_analyzer.tools.now_core_application_tool.requests.get", return_value=api_response) as mock_get:
                    lookup_now_application_in_core("guid-123")

        post_kwargs = mock_post.call_args.kwargs
        assert post_kwargs["data"]["grant_type"] == "client_credentials"
        assert post_kwargs["data"]["client_id"] == "cid"
        assert post_kwargs["data"]["client_secret"] == "csecret"
        assert post_kwargs["data"]["scope"] == "openid profile"

        get_kwargs = mock_get.call_args.kwargs
        assert get_kwargs["headers"]["Authorization"] == "Bearer oauth-token"
