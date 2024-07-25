import csv
import json
import tempfile
from io import StringIO

from app.helpers.temporary_file import store_temporary
from app.permit_conditions.pipelines.permit_condition_pipeline import (
    permit_condition_pipeline,
)
from app.permit_conditions.validator.permit_condition_model import (
    PermitCondition,
    PermitConditions,
)
from fastapi import APIRouter, File, HTTPException, Response, UploadFile
from pydantic import BaseModel

router = APIRouter()

import logging

logger = logging.getLogger(__name__)


@router.post("/permit_conditions")
async def extract_permit_conditions(file: UploadFile = File(...)) -> PermitConditions:
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
                        "max_pages": 6,
                    }
                },
            }
        )["validator"]
    finally:
        tmp.close()


@router.post("/permit_conditions/csv")
async def extract_permit_conditions_as_csv(
    file: UploadFile = File(...),
) -> PermitConditions:
    # Extract permit conditions as a dictionary
    conditions = (await extract_permit_conditions(file))["conditions"]

    # Create a StringIO object to write CSV data
    csv_data = StringIO()
    # Define the fieldnames for the CSV file
    fieldnames = list(PermitCondition.schema()["properties"].keys())

    # Create a CSV writer
    csv_writer = csv.DictWriter(csv_data, fieldnames=fieldnames)

    # Write the header row
    csv_writer.writeheader()

    # Write each condition as a row in the CSV file
    for condition in conditions:
        csv_writer.writerow(json.loads(condition.json()))

    # Reset the StringIO object to the beginning
    csv_data.seek(0)

    # Return the CSV file as a response
    return Response(
        content=csv_data.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="permit_conditions.csv"'},
    )


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
