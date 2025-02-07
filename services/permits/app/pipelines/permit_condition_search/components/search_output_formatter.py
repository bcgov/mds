from typing import Any, Dict, List

from haystack import Document, component
from haystack.dataclasses import ChatMessage


@component
class SearchOutputFormatter:
    @component.output_types(documents=List[Document], replies=List[ChatMessage])
    def run(self, documents: List[Document], replies: List[str]) -> Dict[str, Any]:
        return {
            "documents": documents,
            "replies": [ChatMessage.from_assistant(text=reply) for reply in replies],
        }
