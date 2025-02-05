from typing import Any, Dict, List

from azure.search.documents.indexes.models import SimpleField
from haystack import Document, component
from haystack_integrations.document_stores.azure_ai_search import (
    AzureAISearchDocumentStore,
)


class AzureSearchDocumentStore(AzureAISearchDocumentStore):

    def __init__(self, extra_field_config: Dict[str, Any], **kwargs):
        super(AzureSearchDocumentStore, self).__init__(**kwargs)
        self.extra_field_config = extra_field_config
    
    def _convert_search_result_to_documents(self, azure_docs: List[Dict[str, Any]]) -> List[Document]:
        # Get base documents from parent class
        documents: List[Document] = super()._convert_search_result_to_documents(azure_docs)
        
        # Update each document with score and facets
        for doc in documents:
            azure_doc = next(azure_doc for azure_doc in azure_docs if azure_doc["id"] == doc.id)

            print({i:azure_doc[i] for i in azure_doc if i!='embedding'})

            if azure_doc:
                doc.meta.update({
                    "facets": azure_doc.get('@search.facets', {})
                })

                doc.score = azure_doc.get('@search.score', 0.0)
        
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