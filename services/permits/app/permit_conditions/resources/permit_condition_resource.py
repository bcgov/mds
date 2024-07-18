from fastapi import FastAPI, HTTPException, UploadFile, File
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
    """
    Extracts permit conditions from a file.

    Args:
        file (UploadFile): The file to extract permit conditions from.

    Returns:
        dict: A dictionary containing the extracted permit conditions.

    Raises:
        Any exceptions that occur during the extraction process.
    """
    if file.content_type != "application/pdf":
        raise HTTPException(400, detail="Invalid file type. Only PDF files are supported.")

    # Write the uploaded file to a temporary file
    # so it can be processed by the pipeline.
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
