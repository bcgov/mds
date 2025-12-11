import os
from pathlib import Path

from azure.storage.blob import BlobServiceClient
from haystack import component, logging

logger = logging.getLogger(__name__)

@component
class AzureBlobUploader:
    def __init__(self, connection_string: str, container_name: str, blob_service_endpoint: str | None = None):
        """
        Initialize the blob uploader
        Args:
            connection_string: Azure Storage connection string
            container_name: Azure Storage container name
            blob_service_endpoint: Optional override for the blob service endpoint
        """
        self.connection_string = connection_string
        self.container_name = container_name
        self.blob_service_endpoint = blob_service_endpoint
        
        if not self.connection_string:
            raise ValueError("connection_string cannot be empty")
        if not self.container_name:
            raise ValueError("container_name cannot be empty")

    @component.output_types(blob_url=str)
    def run(self, file_path: Path, file_name=None) -> dict:
        """
        Uploads a file to Azure Blob Storage in the indexing folder
        """
        # BlobService
        blob_service_client = BlobServiceClient.from_connection_string(self.connection_string)

        if self.blob_service_endpoint:
            blob_service_client = BlobServiceClient(
                account_url=self.blob_service_endpoint,
                credential=blob_service_client.credential
            )

        container_client = blob_service_client.get_container_client(self.container_name)
        
        # Upload to an 'indexing' folder in the container
        blob_name = f"indexing/{file_name if file_name else file_path.name}"
        blob_client = container_client.get_blob_client(blob_name)
        
        with open(file_path, "rb") as data:
            blob_client.upload_blob(data, overwrite=True)
            
        return {"blob_url": blob_client.url}
