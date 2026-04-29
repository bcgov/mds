"""
Shared indexing components and helpers for NoW application document indexing.

Extracted here so that both the FastAPI resource and the Celery task can import
them without circular dependencies. All heavy objects (Document Intelligence,
chunker, OpenAI client) are initialised once at module load time.
"""
import logging
from pathlib import Path
from typing import List

from app.pipelines.document_search.components.document_chunker import (
    DocumentChunkMetadata,
    DocumentChunker,
)
from app.pipelines.document_search.config import config
from app.pipelines.permit_condition_extraction.components.azure_document_intelligence_converter import (
    AzureDocumentIntelligenceConverter,
)
from azure.search.documents import SearchClient
from openai import AzureOpenAI

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Batch sizes
# ---------------------------------------------------------------------------

# Azure OpenAI embeddings API: up to 2048 items per request.
EMBED_BATCH_SIZE = 100
# Azure Search upload_documents: up to 1000 documents per batch.
PUSH_BATCH_SIZE = 500

# ---------------------------------------------------------------------------
# Shared singleton components
# ---------------------------------------------------------------------------

document_intelligence = AzureDocumentIntelligenceConverter(
    endpoint=config.document_intelligence.endpoint,
    api_key=config.document_intelligence.api_key.resolve_value(),
    api_version=config.document_intelligence.api_version,
)

chunker = DocumentChunker()

# Used exclusively for batch embedding during indexing.
openai_client = AzureOpenAI(
    azure_endpoint=config.openai.endpoint.resolve_value(),
    api_key=config.openai.api_key.resolve_value(),
    api_version=config.openai.api_version,
)

# Re-export for convenience so callers only need to import from this module.
__all__ = [
    "DocumentChunkMetadata",
    "document_intelligence",
    "chunker",
    "openai_client",
    "embed_chunks",
    "push_to_index",
    "EMBED_BATCH_SIZE",
    "PUSH_BATCH_SIZE",
]


# ---------------------------------------------------------------------------
# Helper functions
# ---------------------------------------------------------------------------

def embed_chunks(chunks: List[dict]) -> List[dict]:
    """
    Generates embeddings for all chunks and attaches them in-place.
    Batches calls to stay within Azure OpenAI request limits.
    Returns the same list with an 'embedding' key added to each dict.
    """
    texts = [chunk["content"] for chunk in chunks]

    embeddings: List[List[float]] = []
    for i in range(0, len(texts), EMBED_BATCH_SIZE):
        batch = texts[i: i + EMBED_BATCH_SIZE]
        response = openai_client.embeddings.create(
            input=batch,
            model=config.openai.embedding_model,
        )
        embeddings.extend(item.embedding for item in response.data)

    for chunk, embedding in zip(chunks, embeddings):
        chunk["embedding"] = embedding

    return chunks


def push_to_index(search_client: SearchClient, chunks: List[dict]) -> int:
    """
    Pushes all chunks to Azure AI Search in batches.
    Returns the total number of successfully indexed documents.
    """
    succeeded = 0
    for i in range(0, len(chunks), PUSH_BATCH_SIZE):
        batch = chunks[i: i + PUSH_BATCH_SIZE]
        results = search_client.upload_documents(documents=batch)
        succeeded += sum(1 for r in results if r.succeeded)
    return succeeded


def extract_and_chunk_file(
    tmp_path: str,
    now_application_guid: str,
    doc_meta: dict,
) -> List[dict]:
    """
    Runs Document Intelligence on *tmp_path*, then chunks the result.
    Returns a list of chunk dicts ready for embedding.
    """
    chunk_metadata = DocumentChunkMetadata(
        now_application_guid=now_application_guid,
        mine_guid=doc_meta.get("mine_guid", ""),
        document_manager_guid=doc_meta.get("document_manager_guid", ""),
        document_name=doc_meta.get("document_name", ""),
        document_type=doc_meta.get("document_type", ""),
        submitted_date=doc_meta.get("submitted_date"),
    )

    logger.info(
        "Processing document '%s' for NoW application %s",
        chunk_metadata.document_name,
        now_application_guid,
    )

    di_result = document_intelligence.run(file_path=Path(tmp_path))
    chunk_result = chunker.run(documents=di_result["documents"], metadata=chunk_metadata)
    return chunk_result["chunks"]
