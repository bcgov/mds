import json
import logging
import os
import tempfile
import uuid
from pathlib import Path
from typing import AsyncIterator, List

from app.pipelines.document_search.components.document_chunker import (
    DocumentChunkMetadata,
    DocumentChunker,
)
from app.pipelines.document_search.document_search_pipeline import (
    now_document_search_retrieval_pipeline,
    now_document_search_search_client,
)
from app.pipelines.permit_condition_search.models.search_models import (
    IndexingResponse,
    IndexStats,
    SearchParams,
)
from app.pipelines.permit_condition_extraction.components.azure_document_intelligence_converter import (
    AzureDocumentIntelligenceConverter,
)
from app.pipelines.document_search.config import config
from azure.search.documents import SearchClient
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from haystack.dataclasses import ChatMessage
from openai import AzureOpenAI, BadRequestError
from sse_starlette import ServerSentEvent
from sse_starlette.sse import EventSourceResponse

router = APIRouter()
logger = logging.getLogger(__name__)

FILE_UPLOAD_PATH = os.environ.get("FILE_UPLOAD_PATH", "/file-uploads")

# Tracks which now_application_guids are currently being indexed.
# In-memory only — resets on server restart, which is acceptable since a restart
# also clears any in-flight work. Prevents duplicate concurrent index runs and
# lets the status endpoint return "running" during the embed+push phase.
_indexing_in_progress: set[str] = set()

# Batch sizes chosen to stay comfortably within Azure OpenAI and Azure Search limits.
# Azure OpenAI embeddings API: up to 2048 items per request.
# Azure Search upload_documents: up to 1000 documents per batch.
_EMBED_BATCH_SIZE = 100
_PUSH_BATCH_SIZE = 500

_document_intelligence = AzureDocumentIntelligenceConverter(
    endpoint=config.document_intelligence.endpoint,
    api_key=config.document_intelligence.api_key.resolve_value(),
    api_version=config.document_intelligence.api_version,
)

_chunker = DocumentChunker()

# OpenAI client used exclusively for batch embedding during indexing.
# The same proxy endpoint that works for retrieval also works here.
_openai_client = AzureOpenAI(
    azure_endpoint=config.openai.endpoint.resolve_value(),
    api_key=config.openai.api_key.resolve_value(),
    api_version=config.openai.api_version,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _validate_guid(value: str, label: str) -> None:
    try:
        uuid.UUID(value)
    except ValueError:
        raise HTTPException(400, f"{label} must be a valid UUID")


def _embed_chunks(chunks: List[dict]) -> List[dict]:
    """
    Generates embeddings for all chunks and attaches them in-place.
    Batches calls to stay within Azure OpenAI request limits.
    Returns the same list with an 'embedding' key added to each dict.
    """
    texts = [chunk["content"] for chunk in chunks]

    embeddings: List[List[float]] = []
    for i in range(0, len(texts), _EMBED_BATCH_SIZE):
        batch = texts[i: i + _EMBED_BATCH_SIZE]
        response = _openai_client.embeddings.create(
            input=batch,
            model=config.openai.embedding_model,
        )
        embeddings.extend(item.embedding for item in response.data)

    for chunk, embedding in zip(chunks, embeddings):
        chunk["embedding"] = embedding

    return chunks


def _push_to_index(search_client: SearchClient, chunks: List[dict]) -> int:
    """
    Pushes all chunks to Azure AI Search in batches.
    Returns the total number of successfully indexed documents.
    """
    succeeded = 0
    for i in range(0, len(chunks), _PUSH_BATCH_SIZE):
        batch = chunks[i: i + _PUSH_BATCH_SIZE]
        results = search_client.upload_documents(documents=batch)
        succeeded += sum(1 for r in results if r.succeeded)
    return succeeded


# ---------------------------------------------------------------------------
# Indexing endpoint
# ---------------------------------------------------------------------------

@router.post("/document_search/{now_application_guid}/index")
async def index_now_application_documents(
    now_application_guid: str,
    files: List[UploadFile] = File(...),
    metadata: str = Form(...),
) -> IndexingResponse:
    """
    Index all documents belonging to a NoW application for search.

    Accepts one or more files (PDFs and other Document Intelligence-supported formats)
    alongside a JSON metadata array. Each metadata entry corresponds positionally to
    a file and must include:
        document_manager_guid, document_name, document_type,
        mine_guid, submitted_date (optional)

    Processing steps:
        1. Convert each file to text via Azure Document Intelligence
        2. Chunk paragraphs into dicts (filtering fragments too short to be useful)
        3. Generate embeddings for all chunks via Azure OpenAI (batched)
        4. Push chunks + embeddings directly to the Azure AI Search index (batched)

    Because chunk IDs are deterministic (sha256 of guid + document_manager_guid + index),
    re-indexing the same documents always overwrites the same records, avoiding duplicates.
    """
    _validate_guid(now_application_guid, "now_application_guid")
    if now_document_search_search_client is None:
        raise HTTPException(503, "Search client is not available in this environment")
    if now_application_guid in _indexing_in_progress:
        raise HTTPException(409, "Indexing already in progress for this application. Please wait for it to complete.")

    try:
        doc_metadata_list = json.loads(metadata)
    except json.JSONDecodeError:
        raise HTTPException(400, "metadata must be a valid JSON array")

    if len(files) != len(doc_metadata_list):
        raise HTTPException(
            400,
            f"files count ({len(files)}) must match metadata count ({len(doc_metadata_list)})",
        )

    all_chunks: List[dict] = []
    tmp_paths: List[str] = []
    _indexing_in_progress.add(now_application_guid)

    try:
        for file, doc_meta in zip(files, doc_metadata_list):
            # Write upload to a temp file so Document Intelligence can read it
            tmp = tempfile.NamedTemporaryFile(
                dir=FILE_UPLOAD_PATH, delete=False, suffix=Path(file.filename or "doc").suffix
            )
            tmp_paths.append(tmp.name)

            contents = await file.read()
            with open(tmp.name, "wb") as f:
                f.write(contents)

            chunk_metadata = DocumentChunkMetadata(
                now_application_guid=now_application_guid,
                mine_guid=doc_meta.get("mine_guid", ""),
                document_manager_guid=doc_meta.get("document_manager_guid", ""),
                document_name=doc_meta.get("document_name", file.filename or ""),
                document_type=doc_meta.get("document_type", ""),
                submitted_date=doc_meta.get("submitted_date"),
            )

            logger.info(
                "Processing document '%s' for NoW application %s",
                chunk_metadata.document_name,
                now_application_guid,
            )

            # Extract text from the document
            di_result = _document_intelligence.run(file_path=Path(tmp.name))
            documents = di_result["documents"]

            # Convert extracted paragraphs to chunk dicts
            chunk_result = _chunker.run(documents=documents, metadata=chunk_metadata)
            all_chunks.extend(chunk_result["chunks"])

        if not all_chunks:
            raise HTTPException(422, "No indexable content found in the provided documents")

        logger.info(
            "Embedding and pushing %d chunks for NoW application %s",
            len(all_chunks),
            now_application_guid,
        )

        # Generate embeddings then push directly to Azure AI Search.
        # No blob storage or indexer required.
        chunks_with_embeddings = _embed_chunks(all_chunks)
        succeeded = _push_to_index(now_document_search_search_client, chunks_with_embeddings)

        return IndexingResponse(
            id=now_application_guid,
            status="success",
            stats=IndexStats(
                document_count=succeeded,
                storage_size=0,
            ),
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            "Error indexing NoW application %s: %s", now_application_guid, str(e), exc_info=True
        )
        raise HTTPException(500, f"Indexing failed: {str(e)}")

    finally:
        _indexing_in_progress.discard(now_application_guid)
        for path in tmp_paths:
            try:
                os.unlink(path)
            except OSError:
                pass


# ---------------------------------------------------------------------------
# Search endpoint
# ---------------------------------------------------------------------------

@router.post("/document_search/{now_application_guid}/search")
async def search_now_application_documents(
    now_application_guid: str, params: SearchParams
) -> EventSourceResponse:
    """
    Search documents within a specific NoW application and stream results via SSE.

    The now_application_guid from the URL path is injected as a mandatory AND filter
    before the query reaches Azure Search. Any additional filters in the request body
    are merged on top. This guarantees that results are scoped exclusively to the
    requested application — documents from other applications can never appear.
    """
    _validate_guid(now_application_guid, "now_application_guid")
    if now_document_search_retrieval_pipeline is None:
        raise HTTPException(503, "Search pipeline is not available in this environment")
    return EventSourceResponse(
        _stream_search_results(now_application_guid, params),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream",
            "X-Accel-Buffering": "no",
            "Transfer-Encoding": "chunked",
        },
    )


async def _stream_search_results(
    now_application_guid: str, params: SearchParams
) -> AsyncIterator[ServerSentEvent]:
    try:
        yield _format_event("status", {"message": "Starting search..."})

        # Always inject the now_application_guid filter — this is the isolation guarantee.
        guid_filter = {
            "operator": "AND",
            "conditions": [
                {
                    "field": "now_application_guid",
                    "operator": "==",
                    "value": now_application_guid,
                }
            ],
        }

        # Merge any caller-supplied filters under an AND with the guid filter.
        combined_filters = _merge_filters(guid_filter, params.filters)

        inputs = {
            "text_embedder": {"text": params.query},
            "retriever": {"query": params.query, "filters": combined_filters},
            "prompt_builder": {"question": params.query},
        }

        async for partial_output in now_document_search_retrieval_pipeline.run_async_generator(
            data=inputs,
            include_outputs_from={"retriever", "llm"},
        ):
            if "retriever" in partial_output:
                async for event in _process_documents(partial_output["retriever"]["documents"]):
                    yield event

            if "llm" in partial_output:
                async for event in _process_llm_output(partial_output["llm"]["replies"]):
                    yield event

    except BadRequestError as e:
        err = e.response.json() or {}
        message = err.get("error", {}).get("message", "Search failed. Please try again.")
        yield _format_event("error", {"message": message})

    except Exception as e:
        logger.exception("Error during NoW document search: %s", str(e))
        yield _format_event("error", {"message": "Search failed. Please try again."})


async def _process_documents(documents):
    doc_list = []
    facets = None

    if documents and "facets" in documents[0].meta:
        facets = documents[0].meta["facets"]
        for doc in documents:
            doc.meta.pop("facets")

    for doc in documents:
        doc_list.append({
            "id": doc.id,
            "content": doc.content,
            "meta": doc.meta,
            "score": doc.score,
        })

    yield _format_event("documents", {"documents": doc_list, "facets": facets})
    yield _format_event("ai_start", {})


async def _process_llm_output(replies: list[ChatMessage]):
    for reply in replies:
        yield _format_event("prompt", {"answers": [reply.text]})
    yield _format_event("ai_complete", {})


def _format_event(event_type: str, data) -> ServerSentEvent:
    return ServerSentEvent(json.dumps(data), event=event_type)


# ---------------------------------------------------------------------------
# Status endpoint
# ---------------------------------------------------------------------------

@router.get("/document_search/{now_application_guid}/index/status")
async def get_indexing_status(now_application_guid: str):
    """
    Returns the indexing status for a NoW application by querying the search index
    for documents belonging to it.

    Since indexing is now push-based (no async Azure Search indexer), status is
    derived from what's actually in the index:
      never_run  — no documents found for this application
      success    — documents are present; items_processed reflects the chunk count
    """
    _validate_guid(now_application_guid, "now_application_guid")
    if now_document_search_search_client is None:
        raise HTTPException(503, "Search client is not available in this environment")

    if now_application_guid in _indexing_in_progress:
        return {
            "status": "running",
            "items_processed": 0,
            "error_count": 0,
            "last_run_start": None,
            "last_run_end": None,
            "error_message": None,
        }

    try:
        results = now_document_search_search_client.search(
            search_text="*",
            filter=f"now_application_guid eq '{now_application_guid}'",
            select=["id"],
            include_total_count=True,
            top=0,
        )
        count = results.get_count() or 0
    except Exception as e:
        logger.error(
            "Failed to fetch index status for NoW application %s: %s", now_application_guid, e
        )
        raise HTTPException(502, "Could not retrieve status from Azure Search")

    if count == 0:
        return {
            "status": "never_run",
            "items_processed": 0,
            "error_count": 0,
            "last_run_start": None,
            "last_run_end": None,
            "error_message": None,
        }

    return {
        "status": "success",
        "items_processed": count,
        "error_count": 0,
        "last_run_start": None,
        "last_run_end": None,
        "error_message": None,
    }


def _merge_filters(base: dict, extra: dict | None) -> dict:
    """
    Combines the mandatory guid filter with any additional caller-supplied filters.
    Both are wrapped under a top-level AND so neither can be bypassed.
    """
    if not extra:
        return base

    return {
        "operator": "AND",
        "conditions": [base, extra],
    }
