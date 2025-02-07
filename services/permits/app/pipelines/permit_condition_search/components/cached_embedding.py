import hashlib
import json
import logging
import os
from typing import List

from haystack import Document, component
from haystack.components.caching import CacheChecker

ROOT_DIR = os.path.abspath(os.curdir)
logger = logging.getLogger(__name__)



def hash_message(message):
    """
    Calculates the SHA256 hash digest of a list of messages.

    Args:
        messages (list): A list of messages.

    Returns:
        str: The SHA256 hash digest of the messages.
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
        Runs the chat generation process in parallel with max 3 concurrent executions.

        Args:
            data (ChatData): The input chat data.
            generation_kwargs (dict, optional): Additional generation parameters.
            iteration (int, optional): The current iteration count.

        Returns:
            dict: The output chat data.
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
