from typing import Any, Dict, List, Optional

from app.helpers.temporary_file import store_temporary
from app.permit_conditions.pipelines.permit_condition_search_pipeline import (
    permit_condition_search_indexing_pipeline,
    permit_condition_search_retrieval_pipeline,
)
from app.permit_conditions.resources.job_status import JobStatus
from fastapi import APIRouter, File, HTTPException, UploadFile
from haystack import Document
from haystack.dataclasses import ChatMessage
from pydantic import BaseModel

router = APIRouter()

import logging

logger = logging.getLogger(__name__)


@router.post("/permit_conditions/search/index")
async def index_permit_conditions(file: UploadFile = File(...)) -> JobStatus:
    """
    Asynchronously extracts permit conditions from the given PDF file.

    Args:
        file (UploadFile): The file to extract permit conditions from.

    Returns:
        dict: A dictionary containing the id of the job and its status.

    Raises:
        Any exceptions that occur during the extraction process.
    """
    if file.content_type != "text/csv":
        raise HTTPException(
            400, detail="Invalid file type. Only CSV files are supported."
        )

    # Write the uploaded file to a temporary file
    # so it can be processed by the pipeline.
    tmp = store_temporary(file, suffix=".csv")

    try:
        pipeline = permit_condition_search_indexing_pipeline()

        res = pipeline.run(
            {
                "csv_converter": {"file_path": tmp.name, "meta": {"original_file_name": file.filename}},
            }
        )

        return JobStatus(id="", status="SUCCESS", meta=dict(res))
    finally:
        tmp.close()



class SearchParams(BaseModel):
    query: str
    filters: Optional[dict] = None


class SearchDocumentResponse(BaseModel):
    id: str
    content: Optional[str]
    meta: Dict[str, Any]
    score: Optional[float]

class SearchPromptResponse(BaseModel):
    answers: List[str]

class SearchResponse(BaseModel):
    documents: List[SearchDocumentResponse]
    prompt: Optional[SearchPromptResponse]


@router.post("/permit_conditions/search")
async def search_permit_conditions(params: SearchParams):
        pipeline = permit_condition_search_retrieval_pipeline

        res = pipeline.run(
            {
                "text_embedder": {"text": params.query},
                "retriever": {"query": params.query},
                "prompt_builder": {"question": params.query},
            }
        )

        doc_response = []

        for doc in res['output']['documents']:
            doc_response.append(SearchDocumentResponse(
                id=doc.id,
                content=doc.content,
                meta=doc.meta,
                score=doc.score,
            ))

        prompt_response = SearchPromptResponse(
            answers=[res.text for res in res['output']['replies']]
        )

        resp = SearchResponse(
            documents=doc_response,
            prompt=prompt_response
        )
        return resp