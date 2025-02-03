import json
from typing import Any, Dict, List

from haystack import Document, component
from haystack.components.embedders import AzureOpenAIDocumentEmbedder
from haystack.components.writers import DocumentWriter
from haystack.document_stores.types import DuplicatePolicy


@component
class DocumentEmbedderCache(AzureOpenAIDocumentEmbedder):
    """
    A component for embedding strings using OpenAI models on Azure.

    Usage example:
    ```python
    from haystack.components.embedders import AzureOpenAITextEmbedder

    text_to_embed = "I love pizza!"

    text_embedder = AzureOpenAITextEmbedder()

    print(text_embedder.run(text_to_embed))

    # {'embedding': [0.017020374536514282, -0.023255806416273117, ...],
    # 'meta': {'model': 'text-embedding-ada-002-v2',
    #          'usage': {'prompt_tokens': 4, 'total_tokens': 4}}}
    ```
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
