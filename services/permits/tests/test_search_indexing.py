from unittest.mock import MagicMock, patch

import pytest
from azure.core.exceptions import HttpResponseError, ResourceNotFoundError

# Attempt to mock Azure SDK before importing the modules
with patch('azure.search.documents.indexes.SearchIndexClient'), \
     patch('azure.search.documents.indexes.SearchIndexerClient'), \
     patch('azure.core.credentials.AzureKeyCredential'):
    
    import app.pipelines.document_search.create_search_index as create_index_mod
    import app.pipelines.document_search.create_search_indexer as create_indexer_mod
    import app.pipelines.permit_condition_search.create_search_indexer as permit_create_indexer_mod

def test_create_or_update_index_success():
    with patch.object(create_index_mod.index_client, 'create_or_update_index') as mock_create_or_update:
        mock_result = MagicMock()
        mock_result.name = "test-index"
        mock_create_or_update.return_value = mock_result
        
        result = create_index_mod.create_or_update_index()
        
        mock_create_or_update.assert_called()
        assert result.name == "test-index"



def test_create_data_source_success():
    with patch.object(create_indexer_mod.indexer_client, 'create_data_source_connection') as mock_create:
        mock_create.return_value = "data-source-obj"

        result = create_indexer_mod.create_data_source()
        assert result == "data-source-obj"

def test_create_data_source_exists():
    with patch.object(create_indexer_mod.indexer_client, 'create_data_source_connection') as mock_create, \
         patch.object(create_indexer_mod.indexer_client, 'get_data_source_connection') as mock_get:

        mock_create.side_effect = HttpResponseError("already exists")
        mock_existing = MagicMock()
        mock_existing.container.query = create_indexer_mod.EXPECTED_BLOB_QUERY
        mock_get.return_value = mock_existing

        result = create_indexer_mod.create_data_source()
        assert result == mock_existing

def test_create_data_source_exists_wrong_query():
    with patch.object(create_indexer_mod.indexer_client, 'create_data_source_connection') as mock_create, \
         patch.object(create_indexer_mod.indexer_client, 'get_data_source_connection') as mock_get:

        mock_create.side_effect = HttpResponseError("already exists")
        mock_existing = MagicMock()
        mock_existing.container.query = "wrong/query"
        mock_get.return_value = mock_existing

        with pytest.raises(RuntimeError, match="exists with query='wrong/query'"):
            create_indexer_mod.create_data_source()

def test_create_skillset_success():
    with patch.object(create_indexer_mod.indexer_client, 'create_or_update_skillset') as mock_create:
        mock_create.return_value = "skillset-obj"

        result = create_indexer_mod.create_skillset()
        assert result == "skillset-obj"

def test_create_skillset_exists():
    with patch.object(create_indexer_mod.indexer_client, 'create_or_update_skillset') as mock_create, \
         patch.object(create_indexer_mod.indexer_client, 'get_skillset') as mock_get:

        mock_create.side_effect = HttpResponseError("already exists")
        mock_get.return_value = "existing-skillset"

        result = create_indexer_mod.create_skillset()
        assert result == "existing-skillset"

def test_create_indexer_success():
    with patch.object(create_indexer_mod.indexer_client, 'create_or_update_indexer') as mock_create:
        mock_result = MagicMock()
        mock_result.name = "test-indexer"
        mock_create.return_value = mock_result

        result = create_indexer_mod.create_indexer()
        assert result.name == "test-indexer"

def test_create_indexer_exists():
    with patch.object(create_indexer_mod.indexer_client, 'create_or_update_indexer') as mock_create:
        mock_create.side_effect = HttpResponseError("already exists")

        with pytest.raises(RuntimeError, match="already exists"):
            create_indexer_mod.create_indexer()


@patch('app.pipelines.document_search.create_search_indexer.create_data_source')
@patch('app.pipelines.document_search.create_search_indexer.create_skillset')
@patch('app.pipelines.document_search.create_search_indexer.create_indexer')
def test_create_search_indexer_all(mock_create_indexer, mock_create_skillset, mock_create_ds):
    create_indexer_mod.create_search_indexer()
    mock_create_ds.assert_called_once()
    mock_create_skillset.assert_called_once()
    mock_create_indexer.assert_called_once()

def test_permit_create_data_source():
    with patch.object(permit_create_indexer_mod.indexer_client, 'create_or_update_data_source_connection') as mock_create:
        permit_create_indexer_mod.create_data_source()
        mock_create.assert_called_once()

def test_permit_create_skillset():
    with patch.object(permit_create_indexer_mod.indexer_client, 'create_or_update_skillset') as mock_create:
        permit_create_indexer_mod.create_skillset()
        mock_create.assert_called_once()

def test_permit_create_indexer():
    with patch.object(permit_create_indexer_mod.indexer_client, 'create_or_update_indexer') as mock_create:
        permit_create_indexer_mod.create_indexer()
        mock_create.assert_called_once()

@patch('app.pipelines.permit_condition_search.create_search_indexer.create_data_source')
@patch('app.pipelines.permit_condition_search.create_search_indexer.create_skillset')
@patch('app.pipelines.permit_condition_search.create_search_indexer.create_indexer')
def test_permit_create_search_indexer_all(mock_create_indexer, mock_create_skillset, mock_create_ds):
    permit_create_indexer_mod.create_search_indexer()
    mock_create_ds.assert_called_once()
    mock_create_skillset.assert_called_once()
    mock_create_indexer.assert_called_once()
