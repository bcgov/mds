from fastapi import HTTPException, UploadFile, File
from pydantic import BaseModel

from app.permit_conditions.pipelines.permit_condition_pipeline import permit_condition_pipeline

from fastapi import APIRouter

from services.permits.app.helpers.temporary_file import store_temporary

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
    tmp = store_temporary(file)

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
