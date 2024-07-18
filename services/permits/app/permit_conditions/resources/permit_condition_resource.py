from fastapi import HTTPException, Response, UploadFile, File
from pydantic import BaseModel
import tempfile
from app.permit_conditions.pipelines.permit_condition_pipeline import (
    permit_condition_pipeline,
)

from fastapi import APIRouter

from app.helpers.temporary_file import store_temporary

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
        raise HTTPException(
            400, detail="Invalid file type. Only PDF files are supported."
        )

    # Write the uploaded file to a temporary file
    # so it can be processed by the pipeline.
    tmp = store_temporary(file)

    try:
        pipeline = permit_condition_pipeline()

        return pipeline.run(
            {
                "pdf_converter": {"file_path": tmp.name},
                "prompt_builder": {
                    "template_variables": {
                        "max_pages": 5,
                    }
                },
            }
        )
    finally:
        tmp.close()


@router.get("/permit_conditions/flow")
async def render_permit_conditions_flow():
    """
    Renders the permit conditions flow as an image

    Returns:
        dict: A dictionary containing the rendered permit conditions flow.
    """
    pipeline = permit_condition_pipeline()

    tmp_file = tempfile.NamedTemporaryFile()

    try:
        pipeline.draw(tmp_file.name)
        with open(tmp_file.name, "rb") as img_content:
            return Response(content=img_content.read(), media_type="image/png")
    finally:
        tmp_file.close()
