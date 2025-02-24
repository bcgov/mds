from pathlib import Path
from typing import Any, Dict, List, Optional

from app.common.types.job_status import JobStatus
from app.helpers.temporary_file import store_temporary
from app.pipelines.permit_condition_search.permit_condition_search_pipeline import (
    permit_condition_search_indexing_pipeline,
    permit_condition_search_retrieval_pipeline,
)
from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel

router = APIRouter()

import logging

logger = logging.getLogger(__name__)

class IndexStats(BaseModel):
    document_count: int
    success_count: int
    error_count: int
    warnings: List[str]
    duration_in_ms: float

class IndexingResponse(JobStatus):
    stats: Optional[IndexStats]

@router.post("/permit_conditions/search/index")
async def index_permit_conditions(file: UploadFile = File(...)) -> IndexingResponse:
    """
    Asynchronously indexes permit conditions from the given CSV file by uploading it to blob storage
    and running the Azure Search indexer.

    Args:
        file (UploadFile): The CSV file containing permit conditions to index.

    Returns:
        IndexingResponse: Status of the indexing job including statistics.

    Raises:
        HTTPException: If file type is invalid or processing fails.
    """
    if file.content_type != "text/csv":
        raise HTTPException(
            400, detail="Invalid file type. Only CSV files are supported."
        )

    # Write the uploaded file to a temporary file
    tmp = store_temporary(file, suffix=".csv")

    try:
        pipeline = permit_condition_search_indexing_pipeline
        logger.info(f"Starting indexing pipeline for file {file.filename}")

        res = pipeline.run({"blob_uploader": { "file_path": Path(tmp.name)}})
        logger.debug(f"Pipeline response: {res}")
        
        return IndexingResponse(
            id="",
            status=res["indexer_runner"]["status"],
            stats=IndexStats(**res["indexer_runner"]["stats"]) if "stats" in res["indexer_runner"] else None,
        )

    except Exception as e:
        logger.error(f"Error during indexing: {str(e)}", exc_info=True)
        raise HTTPException(500, f"Error during indexing: {str(e)}")
    finally:
        tmp.close()


class SearchParams(BaseModel):
    query: str
    filters: Optional[Dict[str, Any]] = None


class SearchDocumentResponse(BaseModel):
    id: str
    content: Optional[str]
    meta: Dict[str, Any]
    score: Optional[float]

class SearchPromptResponse(BaseModel):
    answers: List[str]

class Facet(BaseModel):
    value: str
    count: int

class SearchResponse(BaseModel):
    documents: List[SearchDocumentResponse]
    prompt: Optional[SearchPromptResponse]
    facets: Optional[Dict[str, List[Facet]]]


@router.post("/permit_conditions/search")
async def search_permit_conditions(params: SearchParams) -> SearchResponse:
        res = permit_condition_search_retrieval_pipeline.run(
            {
                "text_embedder": {"text": params.query},
                "retriever": {"query": params.query, "filters": params.filters},
                "prompt_builder": {"question": params.query},
            }
        )

        doc_response = []
        facets = res['output_formatter']['documents'][0].meta.get("facets") if len(res["output_formatter"]["documents"]) else None

        facet_responses = {k: [Facet(value=facet["value"], count=facet["count"]) for facet in v] for k, v in facets.items()} if facets else None

        for doc in res['output_formatter']['documents']:
            doc_response.append(SearchDocumentResponse(
                id=doc.id,
                content=doc.content,
                meta=doc.meta,
                score=doc.score,
            ))

        prompt_response = SearchPromptResponse(
            answers=[res.text for res in res['output_formatter']['replies']]
        )

        resp = SearchResponse(
            documents=doc_response,
            prompt=prompt_response,
            facets=facet_responses
        )
        return resp