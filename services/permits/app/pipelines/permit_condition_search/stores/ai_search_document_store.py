import logging
from typing import Any, Dict, List, Optional

from app.pipelines.permit_condition_search.search_index_fields import fields
from azure.search.documents.models import (
    QueryCaptionType,
    QueryType,
    VectorizableTextQuery,
)
from haystack import Document
from haystack_integrations.document_stores.azure_ai_search import (
    AzureAISearchDocumentStore,
)
from haystack_integrations.document_stores.azure_ai_search import filters as fltrs

logger = logging.getLogger(__name__)

# There's a bug in the Haystack Azure AI Search integration where it doesn't handle collection index field types correctly.
# Issue: Filters on a field of the type Collection(...) fails with an error (it works for single fields).
# Expected Odata filter syntax for a collection field is: 
# `field/any(field: <filter>)` where `field` is the name of the field and `value` is the value to filter on. The haystack integration spits out just the <filter> part.
# Example: `search.in(field, 'value1,value2', ',')` should be `field/any(field: search.in(field, 'value1,value2', ','))`
#
# The following code overrides the comparison operators to handle a collection index field type.
# Why override and not fix the bug in Haystack? This aims to fix it specifically for our use case,
# a more general fix would require more considerations (e.g. handle 'any' vs 'all', complex types etc.).

# Reference: https://learn.microsoft.com/en-us/azure/search/search-query-odata-filter

fields_dict = {field.name: field for field in fields}
og_fltr = fltrs.COMPARISON_OPERATORS

def override_comparison_operators(op, func):
    def handle_collection_index_field_type(field, value, **kwargs):
        res = func(field, value, **kwargs)

        if fields_dict.get(field) and fields_dict[field].type.startswith("Collection("):
            # If the field is a collection, we need to format the value as a list
            res = f"{field}/any({field}: {res})"
        return res
    return handle_collection_index_field_type

new_comparison_operators = {op: override_comparison_operators(op, func) for op, func in og_fltr.items()}
fltrs.COMPARISON_OPERATORS = new_comparison_operators

# This class is used to configure additional search parameters for the Azure AI Search Document Store that are not part of the standard Haystack configuration.
# It allows for highlighting fields and customizing highlight tags.

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
    """
    The AzureSearchDocumentStore extends the AzureAISearchDocumentStore
    to add support for facets, highlights, in the search results and additional configuration that haystack
    does not support out of the box.
    """

    def __init__(
        self,
        search_config: Optional[AdditionalAISearchConfig] = None,
        semantic_configuration_name=None,
        **kwargs,
    ):
        super(AzureSearchDocumentStore, self).__init__(**kwargs)
        self.search_config = search_config or AdditionalAISearchConfig()
        self.semantic_configuration_name = semantic_configuration_name

    def _convert_search_result_to_documents(
        self, azure_docs: List[Dict[str, Any]]
    ) -> List[Document]:

        # Get base documents from parent class
        documents: List[Document] = super()._convert_search_result_to_documents(
            azure_docs
        )

        # Update each document with score and facets
        for doc in documents:
            azure_doc = next(
                (azure_doc for azure_doc in azure_docs if azure_doc["id"] == doc.id),
                None,
            )

            if azure_doc:
                doc.meta.update(
                    {
                        "facets": azure_doc.get("@search.facets", {}),
                        "highlights": azure_doc.get("@search.highlights", {}),
                    }
                )

                doc.score = azure_doc.get("@search.reranker_score", 0.0)

        return documents

    def _hybrid_retrieval(
        self,
        query: str,
        query_embedding: List[float],
        top_k: int = 25,
        filters: Optional[str] = None,
        **kwargs,
    ) -> List[Document]:
        """Retrieves documents similar to query using vector configuration and BM25."""
        if query is None:
            msg = "query must not be None"
            raise ValueError(msg)
        if not query_embedding:
            msg = "query_embedding must be a non-empty list of floats"
            raise ValueError(msg)

        vector_query = VectorizableTextQuery(
            text=query, k_nearest_neighbors=top_k, fields="embedding", exhaustive=True
        )

        logger.error("Test query: %s", filters)

        result = self.client.search(
            search_text=query,
            vector_queries=[vector_query],
            filter=filters,
            top=top_k,
            query_type=QueryType.SEMANTIC,
            query_caption=QueryCaptionType.EXTRACTIVE,
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
