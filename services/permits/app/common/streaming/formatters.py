import json
import logging
from typing import Any, Dict, List, Optional

from haystack import Document, component

logger = logging.getLogger(__name__)


class StreamBase:
    """Base class for stream handlers with consistent SSE formatting"""

    def add_event(self, event_type: str, data: str):
        """Method to be implemented by subclasses"""
        raise NotImplementedError()

    def add_llm_token(self, token: str):
        """Method to be implemented by subclasses"""
        raise NotImplementedError()

    def end_stream(self):
        """Method to be implemented by subclasses"""
        raise NotImplementedError()


@component
class DocumentResultStreamer:
    """Component that streams document results"""

    @component.output_types(documents=List[Document])
    def run(
        self, stream: StreamBase, documents: List[Document]
    ) -> Dict[str, List[Document]]:
        try:
            logger.info(f"Streaming {len(documents)} document results")

            # Convert documents to a JSON-serializable format
            doc_list = []
            facets = None

            # Extract facets from first document if available
            if documents and len(documents) > 0 and "facets" in documents[0].meta:
                facets = documents[0].meta["facets"]

            for doc in documents:
                doc_list.append(
                    {
                        "id": doc.id,
                        "content": doc.content,
                        "meta": doc.meta,
                        "score": doc.score,
                    }
                )

            # Create response object with documents and facets
            response_data = {"documents": doc_list, "facets": facets}

            # Stream the document results with custom delimiter handling
            # The stream handler itself should already properly format messages with ENDMESSAGE
            stream.add_event("documents", json.dumps(response_data))

            # Signal the start of AI processing
            stream.add_event("ai_start", json.dumps({}))

            return {"documents": documents}
        except Exception as e:
            logger.error(f"Error streaming document results: {str(e)}", exc_info=True)
            stream.add_event("error", json.dumps({"message": f"Error: {str(e)}"}))
            return {"documents": documents}


@component
class LLMResultStreamer:
    """Component that streams LLM results"""

    @component.output_types(replies=List[str])
    def run(self, stream: StreamBase, replies: List[str]) -> Dict[str, List[str]]:
        try:
            logger.info(f"Streaming {len(replies)} LLM replies")

            # Stream each reply
            for reply in replies:
                response_data = {"answers": [reply]}
                stream.add_event("prompt", json.dumps(response_data))

            # Signal the completion of AI processing
            stream.add_event("ai_complete", json.dumps({}))

            return {"replies": replies}
        except Exception as e:
            logger.error(f"Error streaming LLM results: {str(e)}", exc_info=True)
            stream.add_event("error", json.dumps({"message": f"Error: {str(e)}"}))
            return {"replies": replies}
        finally:
            stream.end_stream()
