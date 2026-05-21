import pytest
from unittest.mock import MagicMock, patch
from pathlib import Path
from app.pipelines.permit_condition_search.components.azure_blob_upload import AzureBlobUploader, _parse_connection_string

def test_parse_connection_string():
    conn_str = "DefaultEndpointsProtocol=https;AccountName=test;AccountKey=key;EndpointSuffix=core.windows.net"
    parts = _parse_connection_string(conn_str)
    assert parts["AccountName"] == "test"
    assert parts["AccountKey"] == "key"

def test_azure_blob_uploader_init_errors():
    with pytest.raises(ValueError, match="connection_string cannot be empty"):
        AzureBlobUploader(connection_string="", container_name="test")
    with pytest.raises(ValueError, match="container_name cannot be empty"):
        AzureBlobUploader(connection_string="test", container_name="")

def test_azure_blob_uploader_run_invalid_conn_string():
    uploader = AzureBlobUploader(connection_string="invalid", container_name="test")
    with pytest.raises(ValueError, match="Connection string must contain AccountName and AccountKey"):
        uploader.run(Path("test.pdf"))

@patch("app.pipelines.permit_condition_search.components.azure_blob_upload.generate_container_sas")
@patch("app.pipelines.permit_condition_search.components.azure_blob_upload.BlobServiceClient")
def test_azure_blob_uploader_run_success(mock_blob_service_client_cls, mock_generate_sas):
    uploader = AzureBlobUploader(
        connection_string="AccountName=test;AccountKey=key",
        container_name="mycontainer"
    )
    
    mock_generate_sas.return_value = "mock-sas"
    
    mock_service_client = mock_blob_service_client_cls.return_value
    mock_container_client = mock_service_client.get_container_client.return_value
    mock_blob_client = mock_container_client.get_blob_client.return_value
    mock_blob_client.url = "http://test.blob.core.windows.net/mycontainer/indexing/test.pdf"
    
    with patch("builtins.open", MagicMock()):
        result = uploader.run(Path("test.pdf"))
        
    assert result["blob_url"] == mock_blob_client.url
    mock_generate_sas.assert_called_once()
    mock_service_client.get_container_client.assert_called_once_with("mycontainer")
    mock_container_client.get_blob_client.assert_called_once_with("indexing/test.pdf")
