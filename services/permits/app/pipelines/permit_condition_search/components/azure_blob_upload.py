from datetime import datetime, timedelta, timezone
from pathlib import Path

from azure.storage.blob import (
    BlobServiceClient,
    ContainerSasPermissions,
    generate_container_sas,
)
from haystack import component, logging

logger = logging.getLogger(__name__)


def _parse_connection_string(connection_string: str) -> dict:
    """Parse connection string into components."""
    parts = {}
    for part in connection_string.split(";"):
        if "=" in part:
            key, value = part.split("=", 1)
            parts[key] = value
    return parts


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
        conn_parts = _parse_connection_string(self.connection_string)
        account_name = conn_parts.get("AccountName", "")
        account_key = conn_parts.get("AccountKey", "")
        
        if not account_name or not account_key:
            raise ValueError("Connection string must contain AccountName and AccountKey")
        
        account_url = self.blob_service_endpoint or f"https://{account_name}.blob.core.windows.net"
        
        # Generate a short-lived SAS token for this upload
        sas_token = generate_container_sas(
            account_name=account_name,
            container_name=self.container_name,
            account_key=account_key,
            permission=ContainerSasPermissions(write=True, create=True),
            expiry=datetime.now(timezone.utc) + timedelta(minutes=10)
        )
        
        blob_service_client = BlobServiceClient(
            account_url=account_url,
            credential=sas_token
        )

        container_client = blob_service_client.get_container_client(self.container_name)
        
        # Upload to an 'indexing' folder in the container
        blob_name = f"indexing/{file_name if file_name else file_path.name}"
        blob_client = container_client.get_blob_client(blob_name)
        
        with open(file_path, "rb") as data:
            blob_client.upload_blob(data, overwrite=True)
            
        return {"blob_url": blob_client.url}
