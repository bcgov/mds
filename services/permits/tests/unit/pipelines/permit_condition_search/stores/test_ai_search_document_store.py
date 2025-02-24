from unittest.mock import MagicMock, PropertyMock, patch

import pytest
from app.pipelines.permit_condition_search.stores.ai_search_document_store import (
    AzureSearchDocumentStore,
)
from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient
from azure.search.documents.indexes import SearchIndexClient
from azure.search.documents.indexes.models import SearchField, SearchIndex
from haystack import Document
from haystack_integrations.document_stores.azure_ai_search import (
    AzureAISearchDocumentStore,
)


@pytest.fixture
def mock_azure_credential():
    credential = MagicMock(spec=AzureKeyCredential)
    # Add get_token method to the mock
    credential.get_token = MagicMock(return_value="mock-token")
    return credential

@pytest.fixture
def mock_search_client():
    client = MagicMock(spec=SearchClient)
    
    # Create a mock search result that supports get_facets and iteration
    class MockSearchResult:
        def __init__(self, docs, facets):
            self._docs = docs
            self._facets = facets
            
        def __iter__(self):
            return iter(self._docs)
            
        def get_facets(self):
            return self._facets
    
    # Create the mock result
    mock_docs = [
        {
            "id": "1",
            "content": "test content",
            "embedding": [0.1] * 768,
            "@search.score": 0.8,
        }
    ]
    mock_facets = {
        "category": [{"value": "test", "count": 1}]
    }
    
    # Set up the search method to return our custom result
    client.search.return_value = MockSearchResult(mock_docs, mock_facets)
    return client

@pytest.fixture
def mock_index_client():
    client = MagicMock(spec=SearchIndexClient)
    index = MagicMock(spec=SearchIndex)
    
    # Create mock fields with properly configured name attributes
    def create_mock_field(field_name):
        field = MagicMock(spec=SearchField)
        field.name = field_name
        type(field).name = PropertyMock(return_value=field_name)  # Ensure name is accessible as property
        return field
    
    index.fields = [
        create_mock_field("id"),
        create_mock_field("content"),
        create_mock_field("embedding"),
        create_mock_field("category"),
    ]
    
    client.get_index.return_value = index
    client.list_index_names.return_value = ["test-index"]
    return client

@pytest.fixture
def azure_search_store(mock_search_client, mock_index_client, mock_azure_credential):
    with patch("haystack_integrations.document_stores.azure_ai_search.document_store.SearchClient") as mock_search_client_cls, \
         patch("haystack_integrations.document_stores.azure_ai_search.document_store.SearchIndexClient") as mock_index_client_cls, \
         patch("haystack_integrations.document_stores.azure_ai_search.document_store.AzureKeyCredential") as mock_credential_cls:
        
        # Setup the mock clients
        mock_search_client_cls.return_value = mock_search_client
        mock_index_client_cls.return_value = mock_index_client
        
        # Create store with test configuration
        store = AzureSearchDocumentStore(
            azure_endpoint="https://test.search.windows.net",
            api_key="test-key",
            index_name="test-index",
            embedding_dimension=768,
            metadata_fields={"category": str},
            extra_field_config={
                "category": {
                    "filterable": True,
                    "sortable": True,
                    "facetable": True
                }
            }
        )

        # Pre-set the client property to avoid actual API calls
        type(store)._client = PropertyMock(return_value=mock_search_client)
        type(store)._index_client = PropertyMock(return_value=mock_index_client)
        store._index_fields = ["id", "content", "embedding", "category"]  # Ensure fields are set
        
        return store

def test_base_document_store_initialization(azure_search_store):
    """Test that the base document store initializes correctly"""
    assert isinstance(azure_search_store, AzureAISearchDocumentStore)
    assert azure_search_store._index_name == "test-index"
    assert azure_search_store._embedding_dimension == 768

def test_custom_document_store_initialization(azure_search_store):
    """Test that our custom document store initializes with extra field config"""
    assert azure_search_store.extra_field_config == {
        "category": {
            "filterable": True,
            "sortable": True,
            "facetable": True
        }
    }

def test_convert_search_results_with_facets(azure_search_store):
    """Test that search results are converted with facets"""
    azure_docs = [
        {
            "id": "1",
            "content": "test content",
            "embedding": [0.1] * 768,
            "category": "test",
            "@search.score": 0.8,
            "@search.facets": {
                "category": [{"value": "test", "count": 1}]
            }
        }
    ]

    documents = azure_search_store._convert_search_result_to_documents(azure_docs)
    
    assert len(documents) == 1
    assert isinstance(documents[0], Document)
    assert documents[0].id == "1"
    assert documents[0].content == "test content"
    assert documents[0].meta["category"] == "test"
    assert documents[0].meta["facets"] == {"category": [{"value": "test", "count": 1}]}
    assert documents[0].score == 0.8

def test_hybrid_retrieval_with_facets(azure_search_store, mock_search_client):
    """Test hybrid retrieval includes facets in results"""
    # Perform hybrid retrieval
    results = azure_search_store._hybrid_retrieval(
        query="test",
        query_embedding=[0.1] * 768,
        top_k=1
    )

    assert len(results) == 1
    assert results[0].meta["facets"] == {"category": [{"value": "test", "count": 1}]}
    assert results[0].score == 0.8

def test_metadata_field_creation(azure_search_store):
    """Test that metadata fields are created with correct configuration"""
    fields = azure_search_store._create_metadata_index_fields({"category": str})
    
    # Find the category field
    category_field = next((f for f in fields if f.name == "category"), None)
    assert category_field is not None
    assert category_field.filterable is True
    assert category_field.sortable is True
    assert category_field.facetable is True

def test_write_documents_with_metadata(azure_search_store):
    """Test writing documents with metadata"""
    doc = Document(
        id="1",
        content="test content",
        meta={"category": "test"}
    )
    
    azure_search_store.write_documents([doc])
    
    # Verify the document was properly converted and uploaded
    azure_search_store.client.upload_documents.assert_called_once()
    uploaded_docs = azure_search_store.client.upload_documents.call_args[0][0]
    assert len(uploaded_docs) == 1
    assert uploaded_docs[0]["category"] == "test"

def test_base_class_compatibility(azure_search_store):
    """Test that our custom store maintains compatibility with base class operations"""
    # Test basic search
    docs = azure_search_store.search_documents("test query")
    assert isinstance(docs, list)
    assert all(isinstance(doc, Document) for doc in docs)

    # Test filter with correct format and operator
    filter_query = {
        "operator": "AND",
        "conditions": [
            {
                "field": "category",
                "operator": "==",
                "value": "test"
            }
        ]
    }
    docs = azure_search_store.filter_documents(filter_query)
    assert isinstance(docs, list)
    assert all(isinstance(doc, Document) for doc in docs)
