import csv
import io
import json
import logging
import os
import tempfile
from pathlib import Path
from typing import AsyncIterator, List

from app.pipelines.document_search.components.document_chunker import (
    DocumentChunkMetadata,
    DocumentChunker,
)
from app.pipelines.document_search.document_search_pipeline import (
    now_document_search_indexing_pipeline,
    now_document_search_retrieval_pipeline,
)
from app.pipelines.document_search.search_index_fields import fields as index_fields
from app.pipelines.permit_condition_search.models.search_models import (
    IndexingResponse,
    IndexStats,
    SearchParams,
)
from app.pipelines.permit_condition_extraction.components.azure_document_intelligence_converter import (
    AzureDocumentIntelligenceConverter,
)
from app.pipelines.document_search.config import config
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from haystack.dataclasses import ChatMessage
from openai import BadRequestError
from sse_starlette import ServerSentEvent
from sse_starlette.sse import EventSourceResponse

router = APIRouter()
logger = logging.getLogger(__name__)

FILE_UPLOAD_PATH = os.environ.get("FILE_UPLOAD_PATH", "/file-uploads")

_document_intelligence = AzureDocumentIntelligenceConverter(
    endpoint=config.document_intelligence.endpoint,
    api_key=config.document_intelligence.api_key.resolve_value(),
    api_version=config.document_intelligence.api_version,
)

_chunker = DocumentChunker()


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
        mine_guid, mine_name, mine_number, submitted_date (optional)

    Processing steps:
        1. Convert each file to text via Azure Document Intelligence
        2. Chunk paragraphs into CSV rows (filtering out fragments too short to be useful)
        3. Upload the combined CSV to Azure Blob Storage
        4. Trigger the Azure Search indexer to generate embeddings and write to the index

    Because chunk IDs are deterministic (guid + document_manager_guid + index), re-indexing
    the same documents always overwrites the same records, avoiding duplicates.
    """
    try:
        doc_metadata_list = json.loads(metadata)
    except json.JSONDecodeError:
        raise HTTPException(400, "metadata must be a valid JSON array")

    if len(files) != len(doc_metadata_list):
        raise HTTPException(
            400,
            f"files count ({len(files)}) must match metadata count ({len(doc_metadata_list)})",
        )

    all_csv_rows: List[dict] = []
    tmp_paths: List[str] = []

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

            # Convert extracted paragraphs to CSV rows
            chunk_result = _chunker.run(documents=documents, metadata=chunk_metadata)
            csv_content = chunk_result["csv_content"]

            if csv_content:
                reader = csv.DictReader(io.StringIO(csv_content))
                all_csv_rows.extend(list(reader))

        if not all_csv_rows:
            raise HTTPException(422, "No indexable content found in the provided documents")

        # Write the combined CSV and upload for indexing
        combined_csv = _rows_to_csv(all_csv_rows)
        csv_filename = f"now_{now_application_guid}.csv"

        with tempfile.NamedTemporaryFile(
            dir=FILE_UPLOAD_PATH, delete=False, suffix=".csv", mode="w"
        ) as csv_tmp:
            csv_tmp.write(combined_csv)
            csv_tmp_path = csv_tmp.name

        tmp_paths.append(csv_tmp_path)

        logger.info(
            "Uploading %d chunks for NoW application %s",
            len(all_csv_rows),
            now_application_guid,
        )

        res = now_document_search_indexing_pipeline.run(
            {
                "blob_uploader": {
                    "file_path": Path(csv_tmp_path),
                    "file_name": csv_filename,
                }
            }
        )

        return IndexingResponse(
            id=now_application_guid,
            status=res["indexer_runner"]["status"],
            stats=(
                IndexStats(**res["indexer_runner"]["stats"])
                if "stats" in res["indexer_runner"]
                else None
            ),
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error indexing NoW application %s: %s", now_application_guid, str(e), exc_info=True)
        raise HTTPException(500, f"Indexing failed: {str(e)}")

    finally:
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


def _rows_to_csv(rows: List[dict]) -> str:
    if not rows:
        return ""
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=rows[0].keys(), quoting=csv.QUOTE_ALL)
    writer.writeheader()
    writer.writerows(rows)
    return output.getvalue()
