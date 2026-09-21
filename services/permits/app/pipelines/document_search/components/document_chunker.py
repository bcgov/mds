import hashlib
import json
import logging
from dataclasses import dataclass
from typing import List, Optional

from haystack import Document, component

logger = logging.getLogger(__name__)

# Minimum character length for a paragraph to be worth indexing.
# Skips headers, page numbers, and other low-value fragments.
MIN_CHUNK_LENGTH = 50


@dataclass
class DocumentChunkMetadata:
    now_application_guid: str
    mine_guid: str
    document_manager_guid: str
    document_name: str
    document_type: str
    submitted_date: Optional[str] = None


@component
class DocumentChunker:
    """
    Converts a list of Haystack Documents (paragraphs from Azure Document Intelligence)
    into a list of chunk dicts ready for direct upload to Azure AI Search.

    Each paragraph becomes one dict. Very short paragraphs (e.g. page numbers,
    section headers with no content) are filtered out via MIN_CHUNK_LENGTH.

    The chunk ID is deterministic: sha256(now_application_guid + document_manager_guid + chunk_index)
    so re-indexing the same document always overwrites the same records without duplicates.
    """

    @component.output_types(chunks=list, chunk_count=int)
    def run(self, documents: List[Document], metadata: DocumentChunkMetadata) -> dict:
        chunks = []
        chunk_index = 0

        for doc in documents:
            # AzureDocumentIntelligenceConverter serialises each paragraph as a JSON
            # dict: {"id": ..., "text": "<actual paragraph text>", ...}.
            # Extract just the human-readable text for indexing and display.
            try:
                content = json.loads(doc.content).get("text", "") if doc.content else ""
            except (json.JSONDecodeError, AttributeError):
                content = doc.content or ""
            content = content.strip()
            if len(content) < MIN_CHUNK_LENGTH:
                continue

            chunk_id = self._make_id(
                metadata.now_application_guid,
                metadata.document_manager_guid,
                chunk_index,
            )

            artifact_bounding_box = (
                doc.meta.get("bounding_box") if getattr(doc, "meta", None) else None
            )

            chunks.append({
                "id": chunk_id,
                "content": content,
                "now_application_guid": metadata.now_application_guid,
                "mine_guid": metadata.mine_guid,
                "document_manager_guid": metadata.document_manager_guid,
                "document_name": metadata.document_name,
                "document_type": metadata.document_type,
                # None is stored as null in Azure Search (DateTimeOffset field);
                # empty string would cause a type error.
                "submitted_date": metadata.submitted_date or None,
                "artifact_type": "text",
                "artifact_id": None,
                "artifact_page_number": doc.meta.get("page") if getattr(doc, "meta", None) else None,
                "artifact_bounding_box_left": artifact_bounding_box.get("left") if artifact_bounding_box else None,
                "artifact_bounding_box_top": artifact_bounding_box.get("top") if artifact_bounding_box else None,
                "artifact_bounding_box_right": artifact_bounding_box.get("right") if artifact_bounding_box else None,
                "artifact_bounding_box_bottom": artifact_bounding_box.get("bottom") if artifact_bounding_box else None,
            })
            chunk_index += 1

        logger.info(
            "Chunked document '%s' into %d indexable chunks",
            metadata.document_name,
            len(chunks),
        )
        return {"chunks": chunks, "chunk_count": len(chunks)}

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _make_id(self, now_application_guid: str, document_manager_guid: str, index: int) -> str:
        key = f"{now_application_guid}:{document_manager_guid}:{index}"
        return hashlib.sha256(key.encode()).hexdigest()[:16]
