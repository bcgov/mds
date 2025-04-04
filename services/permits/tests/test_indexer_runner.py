import unittest
from datetime import datetime, timedelta
from unittest.mock import MagicMock, patch

from app.pipelines.permit_condition_search.components.indexer_runner import (
    IndexerRunner,
)
from azure.search.documents.indexes.models import IndexerExecutionResult, IndexerStatus


class TestIndexerRunner(unittest.TestCase):
    
    def setUp(self):
        self.search_endpoint = "https://test-endpoint.search.windows.net"
        self.search_api_key = "test-api-key"
        self.indexer_runner = IndexerRunner(
            search_endpoint=self.search_endpoint,
            search_api_key=self.search_api_key
        )
        
        self.indexer_runner.timeout = 10
        
    @patch('app.pipelines.permit_condition_search.components.indexer_runner.SearchIndexerClient')
    @patch('app.pipelines.permit_condition_search.components.indexer_runner.AzureKeyCredential')
    def test_run_indexer_success(self, mock_credential_class, mock_client_class):
        mock_credential = MagicMock()
        mock_credential_class.return_value = mock_credential
        
        mock_client = MagicMock()
        mock_client_class.return_value = mock_client
        
        mock_status = MagicMock(spec=IndexerStatus)
        mock_result = MagicMock(spec=IndexerExecutionResult)
        mock_result.status = "success"
        mock_result.item_count = 100
        mock_result.failed_item_count = 5
        mock_result.warnings = ["Warning 1", "Warning 2"]
        mock_result.start_time = datetime.now() - timedelta(seconds=30)
        mock_result.end_time = datetime.now()
        mock_status.last_result = mock_result
        
        mock_client.get_indexer_status.return_value = mock_status
        
        result = self.indexer_runner.run(blob_url="https://test-blob-url")
        
        mock_credential_class.assert_called_once_with(self.search_api_key)
        mock_client_class.assert_called_once_with(endpoint=self.search_endpoint, credential=mock_credential)
        mock_client.run_indexer.assert_called_once_with("permit-conditions-indexer")
        mock_client.get_indexer_status.assert_called_with("permit-conditions-indexer")
        
        self.assertEqual(result["status"], "success")
        self.assertEqual(result["stats"]["document_count"], 100)
        self.assertEqual(result["stats"]["success_count"], 95)
        self.assertEqual(result["stats"]["error_count"], 5)
        self.assertEqual(result["stats"]["warnings"], ["Warning 1", "Warning 2"])
        self.assertIsInstance(result["stats"]["duration_in_ms"], float)
    
    @patch('app.pipelines.permit_condition_search.components.indexer_runner.SearchIndexerClient')
    @patch('app.pipelines.permit_condition_search.components.indexer_runner.AzureKeyCredential')
    @patch('app.pipelines.permit_condition_search.components.indexer_runner.time.sleep', return_value=None)
    @patch('app.pipelines.permit_condition_search.components.indexer_runner.time.time')
    def test_run_indexer_timeout(self, mock_time, mock_sleep, mock_credential_class, mock_client_class):
        mock_credential = MagicMock()
        mock_credential_class.return_value = mock_credential
        
        mock_client = MagicMock()
        mock_client_class.return_value = mock_client
        
        mock_status = MagicMock(spec=IndexerStatus)
        mock_status.last_result = None
        mock_client.get_indexer_status.return_value = mock_status
        
        mock_time.side_effect = [0, 5, 11, 15]
        
        with self.assertRaises(TimeoutError):
            self.indexer_runner.run(blob_url="https://test-blob-url")
    
    @patch('app.pipelines.permit_condition_search.components.indexer_runner.SearchIndexerClient')
    @patch('app.pipelines.permit_condition_search.components.indexer_runner.AzureKeyCredential')
    def test_run_indexer_error(self, mock_credential_class, mock_client_class):
        mock_credential = MagicMock()
        mock_credential_class.return_value = mock_credential
        
        mock_client = MagicMock()
        mock_client_class.return_value = mock_client
        
        mock_status = MagicMock(spec=IndexerStatus)
        mock_result = MagicMock(spec=IndexerExecutionResult)
        mock_result.status = "error"
        mock_result.error_message = "Test error message"
        mock_status.last_result = mock_result
        mock_client.get_indexer_status.return_value = mock_status
        
        with self.assertRaises(Exception) as context:
            self.indexer_runner.run(blob_url="https://test-blob-url")
        
        self.assertIn("Indexer failed: Test error message", str(context.exception))
