import hashlib
import json
from typing import List

from haystack import Document, component
from haystack.components.caching import CacheChecker


def hash_message(message):
    """
    Calculates the SHA256 hash digest of the given message.

    Args:
        message (str): The message to hash.

    Returns:
        str: The SHA256 hash digest of the message.
    """

    return hashlib.sha256(message.encode('utf-8')).hexdigest()


@component
class EmbeddingCache:

    def __init__(self, document_store, cache_field, **kwargs):
        self.cache_field = cache_field
        self.cache_checker = CacheChecker(
            document_store=document_store, cache_field=cache_field
        )


    @component.output_types(hits=List[Document], misses=List[Document])
    def run(self, documents: List[Document]):
        """
        Runs the given documents through the cache checker to determine which documents have previously been embedded.
        If a document has been embedded, the embedding is loaded from the cache and added to the document.

        The purpose of this component is to avoid generating OpenAI embeddings for queries already embedded as it comes with a cost.

        Args:
            documents (List[Document]): The documents to check the cache for.
        Returns:
            hits (List[Document]): The documents that were found in the cache.
            misses (List[Document]): The documents that were not found in the cache.
        """
        hits = []
        misses = []

        cached_results = self.cache_checker.run(items=[doc.content for doc in documents])

        docs_by_content = {doc.content: doc for doc in documents}

        for miss in cached_results["misses"]:
            doc = docs_by_content[miss.meta[self.cache_field]]
            misses.append(doc)

        for hit in cached_results["hits"]:
            doc = docs_by_content[hit.meta[self.cache_field]]
            doc.embedding = json.loads(hit.content)
            hits.append(doc)

        return {"hits": hits, "misses": misses}
