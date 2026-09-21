from unittest.mock import MagicMock, PropertyMock, patch

import pytest
from app.pipelines.permit_condition_search.stores.ai_search_document_store import (
    AdditionalAISearchConfig,
    AzureSearchDocumentStore,
)
from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient
from azure.search.documents.indexes import SearchIndexClient
from azure.search.documents.indexes.models import SearchField, SearchIndex
from haystack import Document
from haystack.utils import Secret
from haystack_integrations.document_stores.azure_ai_search import (
    AzureAISearchDocumentStore,
)


@pytest.fixture
def mock_azure_credential():
    credential = MagicMock(spec=AzureKeyCredential)
    credential.get_token = MagicMock(return_value="mock-token")
    return credential

@pytest.fixture
def mock_search_client():
    client = MagicMock(spec=SearchClient)
    
    class MockSearchResult:
        def __init__(self, docs, facets):
            self._docs = docs
            self._facets = facets
            
        def __iter__(self):
            return iter(self._docs)
            
        def get_facets(self):
            return self._facets
    
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
    
    client.search.return_value = MockSearchResult(mock_docs, mock_facets)
    return client

@pytest.fixture
def mock_index_client():
    client = MagicMock(spec=SearchIndexClient)
    index = MagicMock(spec=SearchIndex)
    
    def create_mock_field(field_name):
        field = MagicMock(spec=SearchField)
        field.name = field_name
        type(field).name = PropertyMock(return_value=field_name)
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
         patch("haystack_integrations.document_stores.azure_ai_search.document_store.AzureKeyCredential"):
        
        mock_search_client_cls.return_value = mock_search_client
        mock_index_client_cls.return_value = mock_index_client
        
        store = AzureSearchDocumentStore(
            azure_endpoint=Secret.from_token("https://test.search.windows.net"),
            api_key=Secret.from_token("test-key"),
            index_name="test-index",
            embedding_dimension=768,
            search_config=AdditionalAISearchConfig(highlight_fields="content"),
            semantic_configuration_name="test-semantic-config"
        )

        # Pre-set the client property to avoid actual API calls
        type(store)._client = PropertyMock(return_value=mock_search_client)
        type(store)._index_client = PropertyMock(return_value=mock_index_client)
        store._index_fields = ["id", "content", "embedding", "category"] 
        
        return store

def test_base_document_store_initialization(azure_search_store):
    assert isinstance(azure_search_store, AzureAISearchDocumentStore)
    assert azure_search_store._index_name == "test-index"
    assert azure_search_store._embedding_dimension == 768

def test_custom_document_store_initialization(azure_search_store):
    assert azure_search_store.search_config.highlight_fields == "content"
    assert azure_search_store.semantic_configuration_name == "test-semantic-config"

def test_convert_search_results_with_facets(azure_search_store):
    azure_docs = [
        {
            "id": "1",
            "content": "test content",
            "embedding": [0.1] * 768,
            "category": "test",
            "@search.score": 0.8,
            "@search.reranker_score": 0.9,
            "@search.facets": {
                "category": [{"value": "test", "count": 1}]
            },
            "@search.highlights": {
                "content": ["<em>test</em> content"]
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
    assert documents[0].meta["highlights"] == {"content": ["<em>test</em> content"]}
    assert documents[0].score == 0.9

def test_hybrid_retrieval_with_facets(azure_search_store, mock_search_client):
    results = azure_search_store._hybrid_retrieval(
        query="test",
        query_embedding=[0.1] * 768,
        top_k=1,
        filters="category eq 'test'"
    )

    assert len(results) == 1
    assert results[0].meta["facets"] == {"category": [{"value": "test", "count": 1}]}
    assert results[0].score == 0.0 # reranker_score is not in mock_docs

    mock_search_client.search.assert_called_once()
    call_args = mock_search_client.search.call_args[1]
    assert call_args["search_text"] == "test"
    assert call_args["filter"] == "category eq 'test'"
    assert call_args["semantic_configuration_name"] == "test-semantic-config"
    assert call_args["highlight_fields"] == "content"

def test_write_documents_with_metadata(azure_search_store):
    doc = Document(
        id="1",
        content="test content",
        meta={"category": "test"}
    )
    
    azure_search_store.write_documents([doc])
    
    azure_search_store.client.upload_documents.assert_called_once()
    uploaded_docs = azure_search_store.client.upload_documents.call_args[0][0]
    assert len(uploaded_docs) == 1
    assert uploaded_docs[0]["category"] == "test"

def test_base_class_compatibility(azure_search_store):
    docs = azure_search_store.search_documents("test query")
    assert isinstance(docs, list)
    assert all(isinstance(doc, Document) for doc in docs)

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

def test_hybrid_retrieval_validation_errors(azure_search_store):
    with pytest.raises(ValueError, match="query must not be None"):
        azure_search_store._hybrid_retrieval(query=None, query_embedding=[0.1], top_k=1)
    
    with pytest.raises(ValueError, match="query_embedding must be a non-empty list of floats"):
        azure_search_store._hybrid_retrieval(query="test", query_embedding=[], top_k=1)

def test_hybrid_retrieval_facets_attribute_error(azure_search_store, mock_search_client):
    # Mock result that raises AttributeError on get_facets
    class BuggyResult:
        def __iter__(self):
            return iter([])
        def get_facets(self):
            raise AttributeError("no facets")
            
    mock_search_client.search.return_value = BuggyResult()
    
    results = azure_search_store._hybrid_retrieval(query="test", query_embedding=[0.1], top_k=1)
    assert results == []

def test_collection_field_registration():
    field = MagicMock()
    field.name = "tags"
    field.type = "Collection(Edm.String)"
    
    with patch("haystack_integrations.document_stores.azure_ai_search.document_store.SearchClient"), \
         patch("haystack_integrations.document_stores.azure_ai_search.document_store.SearchIndexClient"), \
         patch("haystack_integrations.document_stores.azure_ai_search.document_store.AzureKeyCredential"):
             
        store = AzureSearchDocumentStore(
            azure_endpoint=Secret.from_token("https://test.search.windows.net"),
            api_key=Secret.from_token("test-key"),
            index_name="test-index",
            index_fields=[field]
        )
        
        from haystack_integrations.document_stores.azure_ai_search import filters
        # The operator should have been rebuilt
        res = filters.COMPARISON_OPERATORS["=="]("tags", "value")
        assert "tags/any(tags: " in res

