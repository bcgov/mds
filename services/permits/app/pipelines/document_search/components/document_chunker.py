import csv
import hashlib
import io
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
    into a CSV-formatted string ready for upload to Azure Blob Storage and processing
    by the Azure Search indexer.

    Each paragraph becomes one row in the CSV. Very short paragraphs (e.g. page numbers,
    section headers with no content) are filtered out via MIN_CHUNK_LENGTH.

    The chunk ID is deterministic: sha256(now_application_guid + document_manager_guid + chunk_index)
    so re-indexing the same document always overwrites the same records.
    """

    @component.output_types(csv_content=str, chunk_count=int)
    def run(self, documents: List[Document], metadata: DocumentChunkMetadata) -> dict:
        rows = []
        chunk_index = 0

        for doc in documents:
            content = doc.content.strip() if doc.content else ""
            if len(content) < MIN_CHUNK_LENGTH:
                continue

            chunk_id = self._make_id(
                metadata.now_application_guid,
                metadata.document_manager_guid,
                chunk_index,
            )

            rows.append({
                "id": chunk_id,
                "content": content,
                "now_application_guid": metadata.now_application_guid,
                "mine_guid": metadata.mine_guid,
                "document_manager_guid": metadata.document_manager_guid,
                "document_name": metadata.document_name,
                "document_type": metadata.document_type,
                "submitted_date": metadata.submitted_date or "",
            })
            chunk_index += 1

        csv_content = self._to_csv(rows)
        logger.info(
            "Chunked document '%s' into %d indexable chunks",
            metadata.document_name,
            len(rows),
        )
        return {"csv_content": csv_content, "chunk_count": len(rows)}

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _make_id(self, now_application_guid: str, document_manager_guid: str, index: int) -> str:
        key = f"{now_application_guid}:{document_manager_guid}:{index}"
        return hashlib.sha256(key.encode()).hexdigest()[:16]

    def _to_csv(self, rows: List[dict]) -> str:
        if not rows:
            return ""

        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=rows[0].keys(), quoting=csv.QUOTE_ALL)
        writer.writeheader()
        writer.writerows(rows)
        return output.getvalue()
