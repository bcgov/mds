from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from fastapi.responses import StreamingResponse

from app.permit_conditions.pipelines.permit_condition_pipeline import permit_condition_pipeline
import tempfile

from fastapi import APIRouter

router = APIRouter()

class FileResponse(BaseModel):
    id: int
    name: str

@router.post("/permit_conditions")
async def extract_permit_conditions(file: UploadFile = File(...)):
    tmp = tempfile.NamedTemporaryFile()

    with open(tmp.name, "w") as f:
        while contents := file.file.read(1024 * 1024):
            tmp.write(contents)
    
    try:
        pipeline = permit_condition_pipeline()

        return pipeline.run({
            "PDFConverter": {"file_path": tmp.name},
            "prompt_builder": {
                "template_variables": {
                    "max_pages": 5,
                }
            }
        })
    finally:
        tmp.close()

@router.post("/permit_conditions/csv")
async def extract_permit_conditions(file: UploadFile = File(...)):
    tmp = tempfile.NamedTemporaryFile()

    with open(tmp.name, "w") as f:
        while contents := file.file.read(1024 * 1024):
            tmp.write(contents)
    
    try:
        pipeline = permit_condition_pipeline()

        text = pipeline.run({"PDFConverter": {"file_path": tmp.name}})['validator']['csv']
        response = StreamingResponse(iter([text]),
                                 media_type="text/csv"
                                )
        response.headers["Content-Disposition"] = "attachment; filename=permit_conditions.csv"
        return response

    finally:
        tmp.close()
