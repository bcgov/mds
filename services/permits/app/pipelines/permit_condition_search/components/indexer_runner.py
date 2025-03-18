import time
from typing import Dict

from azure.core.credentials import AzureKeyCredential
from azure.search.documents.indexes import SearchIndexerClient
from fastapi import HTTPException
from haystack import component, logging

logger = logging.getLogger(__name__)

@component
class IndexerRunner:
    def __init__(self, search_endpoint: str, search_api_key: str):
        self.search_endpoint = search_endpoint
        self.search_api_key = search_api_key
        self.timeout = 300 # 5 minutes

    @component.output_types(status=str, stats=Dict)
    def run(self, blob_url: str):
        """
        Runs the given azure indexer and waits for it to complete.
        """
        credential = AzureKeyCredential(self.search_api_key)
        indexer_client = SearchIndexerClient(
            endpoint=self.search_endpoint,
            credential=credential
        )
        
        indexer_client.run_indexer("permit-conditions-indexer")
        
        start_time = time.time()

        while True:
            status = indexer_client.get_indexer_status("permit-conditions-indexer")
            
            if time.time() - start_time > self.timeout:
                raise TimeoutError("Indexer run timed out after 5 minutes")
            if status.last_result and status.last_result.status in ["success", "error"]:
                if status.last_result.status == "error":
                    raise HTTPException(500, f"Indexer failed: {status.last_result.error_message}")
                
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
