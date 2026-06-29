"""Unit tests for NOW document search tool."""

import json
from unittest.mock import MagicMock, Mock, patch

import pytest
from mds_agents.tools import NOWDocument, clear_search_cache, search_now_documents


@pytest.fixture
def mock_search_client():
    """Fixture providing a mock Azure Search client."""
    with patch("mds_agents.tools.now_document_search_tool.SearchClient") as mock:
        yield mock


@pytest.fixture
def sample_search_results():
    """Fixture providing sample Azure Search results."""
    return [
        {
            "id": "chunk-001",
            "document_name": "Application Form",
            "document_type": "Application",
            "submitted_date": "2024-01-15T10:00:00Z",
            "artifact_type": None,
            "artifact_category": None,
            "content": "This is the main application form for the mining permit.",
            "artifact_page_number": None,
            "artifact_summary": None,
        },
        {
            "id": "chunk-002",
            "document_name": "Environmental Management Plan",
            "document_type": "Application",
            "submitted_date": "2024-01-15T10:00:00Z",
            "artifact_type": "Document",
            "artifact_category": "Environmental",
            "content": "Environmental measures include: reclamation procedures, water management...",
            "artifact_page_number": 5,
            "artifact_summary": "Comprehensive environmental protection plan",
        },
    ]


class TestSearchNOWDocuments:
    """Test suite for search_now_documents function."""

    def test_missing_env_variables(self):
        """Test that ValueError is raised when required env vars are missing."""
        with patch.dict("os.environ", {}, clear=True):
            with pytest.raises(ValueError, match="Missing required environment variables"):
                search_now_documents("test-guid")

    def test_successful_search(self, mock_search_client, sample_search_results):
        """Test successful document search."""
        # Setup
        guid = "f47ac10b-58cc-4372-a567-0e02b2c3d479"
        mock_client_instance = MagicMock()
        mock_search_client.return_value = mock_client_instance
        mock_client_instance.search.return_value = iter(sample_search_results)

        with patch.dict(
            "os.environ",
            {
                "AZURE_SEARCH_SERVICE_ENDPOINT": "https://test.search.windows.net",
                "AZURE_SEARCH_API_KEY": "test-key",
                "AZURE_NOW_SEARCH_INDEX_NAME": "now-application-index",
            },
        ):
            clear_search_cache()  # Reset cache
            results = search_now_documents(guid)

        # Verify
        assert len(results) == 2
        assert results[0]["document_name"] == "Application Form"
        assert results[1]["document_name"] == "Environmental Management Plan"
        assert results[0]["document_type"] == "Application"

    def test_search_with_query(self, mock_search_client, sample_search_results):
        """Test semantic search with query text."""
        guid = "test-guid-123"
        query = "environmental impact"
        mock_client_instance = MagicMock()
        mock_search_client.return_value = mock_client_instance
        mock_client_instance.search.return_value = iter([sample_search_results[1]])

        with patch.dict(
            "os.environ",
            {
                "AZURE_SEARCH_SERVICE_ENDPOINT": "https://test.search.windows.net",
                "AZURE_SEARCH_API_KEY": "test-key",
            },
        ):
            clear_search_cache()
            results = search_now_documents(guid, search_query=query)

        # Verify the search was called with the query
        mock_client_instance.search.assert_called_once()
        call_args = mock_client_instance.search.call_args
        assert call_args[1]["search_text"] == query

    def test_search_with_filters(self, mock_search_client, sample_search_results):
        """Test search with OData filters."""
        guid = "test-guid-456"
        filters = {"document_type": ["Application", "Amendment"]}
        mock_client_instance = MagicMock()
        mock_search_client.return_value = mock_client_instance
        mock_client_instance.search.return_value = iter(sample_search_results)

        with patch.dict(
            "os.environ",
            {
                "AZURE_SEARCH_SERVICE_ENDPOINT": "https://test.search.windows.net",
                "AZURE_SEARCH_API_KEY": "test-key",
            },
        ):
            clear_search_cache()
            results = search_now_documents(guid, filters=filters)

        # Verify filter was applied
        call_args = mock_client_instance.search.call_args
        filter_string = call_args[1]["filter"]
        assert f"now_application_guid eq '{guid}'" in filter_string
        assert "document_type eq 'Application'" in filter_string
        assert "document_type eq 'Amendment'" in filter_string

    def test_guid_isolation_in_filter(self, mock_search_client, sample_search_results):
        """Test that GUID filter is always included for data isolation."""
        guid = "isolation-test-guid"
        mock_client_instance = MagicMock()
        mock_search_client.return_value = mock_client_instance
        mock_client_instance.search.return_value = iter(sample_search_results)

        with patch.dict(
            "os.environ",
            {
                "AZURE_SEARCH_SERVICE_ENDPOINT": "https://test.search.windows.net",
                "AZURE_SEARCH_API_KEY": "test-key",
            },
        ):
            clear_search_cache()
            search_now_documents(guid)

        # Verify GUID is in filter
        call_args = mock_client_instance.search.call_args
        filter_string = call_args[1]["filter"]
        assert f"now_application_guid eq '{guid}'" in filter_string

    def test_result_caching(self, mock_search_client, sample_search_results):
        """Test that results are cached per GUID."""
        guid = "cache-test-guid"
        mock_client_instance = MagicMock()
        mock_search_client.return_value = mock_client_instance
        mock_client_instance.search.return_value = iter(sample_search_results)

        with patch.dict(
            "os.environ",
            {
                "AZURE_SEARCH_SERVICE_ENDPOINT": "https://test.search.windows.net",
                "AZURE_SEARCH_API_KEY": "test-key",
            },
        ):
            clear_search_cache()

            # First call
            results1 = search_now_documents(guid, use_cache=True)
            call_count_1 = mock_client_instance.search.call_count

            # Second call (should use cache)
            results2 = search_now_documents(guid, use_cache=True)
            call_count_2 = mock_client_instance.search.call_count

        # Verify cache was used (no additional API call)
        assert results1 == results2
        assert call_count_1 == call_count_2  # API not called again

    def test_cache_disabled(self, mock_search_client, sample_search_results):
        """Test that caching can be disabled."""
        guid = "no-cache-test-guid"
        mock_client_instance = MagicMock()
        mock_search_client.return_value = mock_client_instance
        mock_client_instance.search.return_value = iter(sample_search_results)

        with patch.dict(
            "os.environ",
            {
                "AZURE_SEARCH_SERVICE_ENDPOINT": "https://test.search.windows.net",
                "AZURE_SEARCH_API_KEY": "test-key",
            },
        ):
            clear_search_cache()

            # Both calls with cache disabled
            search_now_documents(guid, use_cache=False)
            call_count_1 = mock_client_instance.search.call_count
            search_now_documents(guid, use_cache=False)
            call_count_2 = mock_client_instance.search.call_count

        # Verify API was called both times (cache not used)
        assert call_count_2 > call_count_1

    def test_empty_results(self, mock_search_client):
        """Test handling of empty search results."""
        guid = "empty-test-guid"
        mock_client_instance = MagicMock()
        mock_search_client.return_value = mock_client_instance
        mock_client_instance.search.return_value = iter([])

        with patch.dict(
            "os.environ",
            {
                "AZURE_SEARCH_SERVICE_ENDPOINT": "https://test.search.windows.net",
                "AZURE_SEARCH_API_KEY": "test-key",
            },
        ):
            clear_search_cache()
            results = search_now_documents(guid)

        assert results == []

    def test_error_handling(self, mock_search_client):
        """Test graceful error handling on API failure."""
        guid = "error-test-guid"
        mock_client_instance = MagicMock()
        mock_search_client.return_value = mock_client_instance
        mock_client_instance.search.side_effect = Exception("API connection failed")

        with patch.dict(
            "os.environ",
            {
                "AZURE_SEARCH_SERVICE_ENDPOINT": "https://test.search.windows.net",
                "AZURE_SEARCH_API_KEY": "test-key",
            },
        ):
            clear_search_cache()
            # Should not raise; should return empty list
            results = search_now_documents(guid)

        assert results == []

    def test_result_formatting(self, mock_search_client, sample_search_results):
        """Test that results are properly formatted as NOWDocument dicts."""
        guid = "format-test-guid"
        mock_client_instance = MagicMock()
        mock_search_client.return_value = mock_client_instance
        mock_client_instance.search.return_value = iter(sample_search_results)

        with patch.dict(
            "os.environ",
            {
                "AZURE_SEARCH_SERVICE_ENDPOINT": "https://test.search.windows.net",
                "AZURE_SEARCH_API_KEY": "test-key",
            },
        ):
            clear_search_cache()
            results = search_now_documents(guid)

        # Verify all expected fields are present
        for result in results:
            assert "id" in result
            assert "document_name" in result
            assert "document_type" in result
            assert "submitted_date" in result
            assert "content_excerpt" in result
            assert isinstance(result, dict)

    def test_content_excerpt_truncation(self, mock_search_client):
        """Test that content is truncated to 500 chars."""
        guid = "excerpt-test-guid"
        long_content = "x" * 1000
        mock_search_client.return_value = MagicMock()
        mock_client_instance = mock_search_client.return_value
        mock_client_instance.search.return_value = iter(
            [
                {
                    "id": "chunk-long",
                    "document_name": "Long Document",
                    "document_type": "Application",
                    "submitted_date": "2024-01-15T10:00:00Z",
                    "artifact_type": None,
                    "artifact_category": None,
                    "content": long_content,
                    "artifact_page_number": None,
                    "artifact_summary": None,
                }
            ]
        )

        with patch.dict(
            "os.environ",
            {
                "AZURE_SEARCH_SERVICE_ENDPOINT": "https://test.search.windows.net",
                "AZURE_SEARCH_API_KEY": "test-key",
            },
        ):
            clear_search_cache()
            results = search_now_documents(guid)

        assert len(results[0]["content_excerpt"]) <= 500

    def test_clear_cache(self, mock_search_client, sample_search_results):
        """Test that clear_search_cache resets the cache."""
        guid = "cache-clear-test"
        mock_client_instance = MagicMock()
        mock_search_client.return_value = mock_client_instance
        mock_client_instance.search.return_value = iter(sample_search_results)

        with patch.dict(
            "os.environ",
            {
                "AZURE_SEARCH_SERVICE_ENDPOINT": "https://test.search.windows.net",
                "AZURE_SEARCH_API_KEY": "test-key",
            },
        ):
            # Populate cache
            search_now_documents(guid)
            call_count_before = mock_client_instance.search.call_count

            # Clear cache
            clear_search_cache()

            # New search should hit API again
            mock_client_instance.search.return_value = iter(sample_search_results)
            search_now_documents(guid)
            call_count_after = mock_client_instance.search.call_count

        assert call_count_after > call_count_before
