import json
from typing import Any, Dict, List

from haystack import Document, component
from haystack.components.embedders import AzureOpenAIDocumentEmbedder
from haystack.components.writers import DocumentWriter
from haystack.dataclasses import ChatMessage
from haystack.document_stores.types import DuplicatePolicy


@component
class SearchOutputFormatter:
    @component.output_types(documents=List[Document], replies=List[ChatMessage])
    def run(self, documents: List[Document], replies: List[ChatMessage]) -> Dict[str, Any]:
        return {
            "documents": documents,
            "replies": replies
        }
