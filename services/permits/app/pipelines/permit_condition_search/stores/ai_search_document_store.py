from typing import Any, Dict, List, Optional

from azure.search.documents.indexes.models import SimpleField
from azure.search.documents.models import (
    QueryType,
    VectorizableTextQuery,
    VectorizedQuery,
)
from haystack import Document, component
from haystack_integrations.document_stores.azure_ai_search import (
    AzureAISearchDocumentStore,
)
from pygments import highlight


class AdditionalAISearchConfig:
    highlight_fields: Optional[str] = None
    highlight_post_tag: Optional[str] = None
    highlight_pre_tag: Optional[str] = None

    def __init__(
        self,
        highlight_fields: Optional[str] = None,
        highlight_post_tag: Optional[str] = None,
        highlight_pre_tag: Optional[str] = None,
    ):
        self.highlight_fields = highlight_fields
        self.highlight_post_tag = highlight_post_tag
        self.highlight_pre_tag = highlight_pre_tag

    def to_dict(self) -> Dict[str, Any]:
        return {
            "highlight_fields": self.highlight_fields,
            "highlight_post_tag": self.highlight_post_tag,
            "highlight_pre_tag": self.highlight_pre_tag,
        }
class AzureSearchDocumentStore(AzureAISearchDocumentStore):

        

    def __init__(self, extra_field_config: Optional[Dict[str, Any]]=None, search_config: Optional[AdditionalAISearchConfig]=None, semantic_configuration_name=None,  **kwargs):
        super(AzureSearchDocumentStore, self).__init__(**kwargs)
        self.extra_field_config = extra_field_config
        self.search_config = search_config or AdditionalAISearchConfig()
        self.semantic_configuration_name = semantic_configuration_name
    
    def _convert_search_result_to_documents(self, azure_docs: List[Dict[str, Any]]) -> List[Document]:

        # Get base documents from parent class
        documents: List[Document] = super()._convert_search_result_to_documents(azure_docs)
        
        # Update each document with score and facets
        for doc in documents:
            azure_doc = next((azure_doc for azure_doc in azure_docs if azure_doc["id"] == doc.id), None)

            if azure_doc:
                doc.meta.update({
                    "facets": azure_doc.get('@search.facets', {}),
                    "highlights": azure_doc.get('@search.highlights', {})
                })

                doc.score = azure_doc.get('@search.rerankerScore', 0.0)
        
        return documents

    def _create_metadata_index_fields(self, metadata: Dict[str, Any]) -> List[SimpleField]:
        """Create a list of index fields for storing metadata values."""

        index_fields = super()._create_metadata_index_fields(metadata)

        for field in index_fields:
            field_name = field.name
            if field_name in self.extra_field_config:
                field_options = self.extra_field_config[field_name]
                field.filterable = field_options.get("filterable", field.filterable)
                field.sortable = field_options.get("sortable", field.sortable)
                field.facetable = field_options.get("facetable", field.facetable)

        return index_fields
    

    def _hybrid_retrieval(
        self,
        query: str,
        query_embedding: List[float],
        top_k: int = 10,
        filters: Optional[Dict[str, Any]] = None,
        **kwargs,
    ) -> List[Document]:
        """Retrieves documents similar to query using vector configuration and BM25."""
        if query is None:
            msg = "query must not be None"
            raise ValueError(msg)
        if not query_embedding:
            msg = "query_embedding must be a non-empty list of floats"
            raise ValueError(msg)

        vector_query = VectorizableTextQuery(text=query, k_nearest_neighbors=top_k, fields="embedding", exhaustive=True)

        result = self.client.search(
            search_text=query,
            vector_queries=[vector_query],
            filter=filters,
            top=top_k,
            query_type=QueryType.SEMANTIC,
            semantic_configuration_name=self.semantic_configuration_name,
            **self.search_config.to_dict(),
            **kwargs,
        )
        try:
            facets = result.get_facets()
        except AttributeError:
            facets = {}  # Handle case where facets are not available

        # Convert results to list and extract facets
        azure_docs = list(result)

        # Add facets to each document
        for doc in azure_docs:
            doc["@search.facets"] = facets

        return self._convert_search_result_to_documents(azure_docs)
