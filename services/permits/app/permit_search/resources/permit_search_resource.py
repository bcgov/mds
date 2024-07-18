from fastapi import UploadFile, File
from pydantic import BaseModel

from fastapi import APIRouter

from app.helpers.temporary_file import store_temporary
from app.permit_search.pipelines.pipelines import indexing_pipeline, query_pipeline
from pydantic import BaseModel

router = APIRouter()


class SearchRequest(BaseModel):
    query: str


@router.post("/permit/index")
async def index_permit(file: UploadFile = File(...)):
    tmp = store_temporary(file)

    try:
        pipeline = indexing_pipeline()

        return pipeline.run({"PDFConverter": {"sources": [tmp.name]}})
    finally:
        tmp.close()


@router.post("/permit/query")
async def search_permit(req: SearchRequest):
    pipeline = query_pipeline()

    res = pipeline.run({"retriever": {"query": req.query}})

    return res["ranker"]
