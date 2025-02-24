import time
from typing import Dict

from azure.core.credentials import AzureKeyCredential
from azure.search.documents.indexes import SearchIndexerClient
from haystack import component, logging

logger = logging.getLogger(__name__)

@component
class IndexerRunner:
    def __init__(self, search_endpoint: str, search_api_key: str):
        """
        Initialize the indexer runner
        Args:
            search_endpoint: Azure Search service endpoint
            search_api_key: Azure Search service API key
        """
        self.search_endpoint = search_endpoint
        self.search_api_key = search_api_key

    @component.output_types(status=str, stats=Dict)
    def run(self, blob_url: str):
        """
        Runs the Azure Search indexer and waits for completion
        Returns:
            Dict containing status and statistics about the indexing operation
        """
        credential = AzureKeyCredential(self.search_api_key)
        indexer_client = SearchIndexerClient(
            endpoint=self.search_endpoint,
            credential=credential
        )
        
        # Run the indexer
        indexer_client.run_indexer("permit-conditions-indexer")
        
        # Wait for indexer to complete and collect stats
        while True:
            status = indexer_client.get_indexer_status("permit-conditions-indexer")
            if status.last_result and status.last_result.status in ["success", "error"]:
                if status.last_result.status == "error":
                    raise Exception(f"Indexer failed: {status.last_result.error_message}")
                
                # Collect statistics from the indexer status using the correct attribute names
                stats = {
                    "document_count": status.last_result.item_count,
                    "success_count": status.last_result.item_count - status.last_result.failed_item_count,
                    "error_count": status.last_result.failed_item_count,
                    "warnings": [str(w) for w in (status.last_result.warnings or [])],
                    "duration_in_ms": (status.last_result.end_time - status.last_result.start_time).total_seconds() * 1000 if status.last_result.end_time else 0,
                }
                
                break
            time.sleep(5)
        
        logger.info(f"Indexing completed with stats: {stats}")
        return {
            "status": status.last_result.status,
            "stats": stats
        }
