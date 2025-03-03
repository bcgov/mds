import json
from typing import Any, Dict, List

from haystack import Document, component
from haystack.components.embedders import AzureOpenAIDocumentEmbedder
from haystack.components.writers import DocumentWriter
from haystack.document_stores.types import DuplicatePolicy


@component
class DocumentEmbedderCache(AzureOpenAIDocumentEmbedder):
    """
    A wrapper around the AzureOpenAIDocumentEmbedder that generates embeddings for documents using OpenAI models.

    The DocumentEmbedderCache expands on this and writes the generated embedinngs to the given document store for caching purposes using the CacheChecker component.

    """

    def __init__(
        self,
        document_store,
        cache_field,
        **kwargs
    ):
        super(DocumentEmbedderCache, self).__init__(**kwargs)
        self.document_store = document_store
        self.cache_field = cache_field

        self.document_writer = DocumentWriter(document_store=document_store, policy=DuplicatePolicy.OVERWRITE)
        
    @component.output_types(documents=List[Document], meta=Dict[str, Any])
    def run(self, documents: List[Document]) -> Dict[str, Any]:
        res = super(DocumentEmbedderCache, self).run(documents)
        
        embedding_docs = [Document(content=json.dumps(doc.embedding), meta={self.cache_field: doc.content}) for doc in documents]

        self.document_writer.run(embedding_docs)

        return res
