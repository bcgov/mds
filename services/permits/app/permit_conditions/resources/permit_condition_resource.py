import csv
import json
import os
import tempfile
from io import StringIO
from typing import Optional, Union

from app.helpers.celery_task_status import CeleryTaskStatus
from app.helpers.temporary_file import store_temporary
from app.permit_conditions.pipelines.permit_condition_pipeline import (
    permit_condition_pipeline,
)
from app.permit_conditions.tasks.tasks import run_permit_condition_pipeline
from app.permit_conditions.validator.permit_condition_model import (
    PermitCondition,
    PermitConditions,
)
from fastapi import APIRouter, File, HTTPException, Response, UploadFile
from fastapi.responses import JSONResponse
from pydantic import BaseModel

router = APIRouter()

import logging

logger = logging.getLogger(__name__)


class JobStatus(BaseModel):
    id: str
    status: str
    meta: Optional[dict] = None


class InProgressJobStatusResponse(BaseModel):
    detail: str


@router.post("/permit_conditions")
async def extract_permit_conditions(file: UploadFile = File(...)) -> JobStatus:
    """
    Asynchronously extracts permit conditions from the given PDF file.

    Args:
        file (UploadFile): The file to extract permit conditions from.

    Returns:
        dict: A dictionary containing the id of the job and its status.

    Raises:
        Any exceptions that occur during the extraction process.
    """
    if file.content_type != "application/pdf":
        raise HTTPException(
            400, detail="Invalid file type. Only PDF files are supported."
        )

    # Write the uploaded file to a temporary file
    # so it can be processed by the pipeline.
    tmp = store_temporary(file, suffix=".pdf")

    try:
        res = run_permit_condition_pipeline.delay(
            tmp.name,
            {
                "original_file_name": file.filename,
                "size": file.size,
                "content_type": file.content_type,
            },
        )
        return JobStatus(id=res.task_id, status=res.status, meta=res.info)
    except:
        tmp.close()
        raise


@router.get("/permit_conditions/status")
def status(task_id: str) -> JobStatus:
    """
    Get the status of a permit conditions extraction job.
    Args:
        The task ID of the job.
    """
    res = run_permit_condition_pipeline.app.AsyncResult(task_id)
    return JobStatus(id=res.task_id, status=res.status, meta=res.info)


@router.get(
    "/permit_conditions/results",
    response_model=PermitConditions,
    responses={202: {"model": InProgressJobStatusResponse}},
)
def results(task_id: str) -> PermitConditions:
    """
    Get the results of a permit conditions extraction job.
    Args:
        The task ID of the job.
    Raises:
        400 Bad Request: If the task has not completed successfully
    """
    res = run_permit_condition_pipeline.app.AsyncResult(task_id)

    if res.status == CeleryTaskStatus.SUCCESS.name:
        return res.get()
    elif res.status == CeleryTaskStatus.FAILURE.name:
        raise HTTPException(500, detail=f"Task failed to complete: {res.status}")
    else:
        return JSONResponse(
            status_code=202,
            content={
                "detail": f"Task has not completed yet. Current status: {res.status}"
            },
        )


@router.get(
    "/permit_conditions/results/csv",
    responses={202: {"model": InProgressJobStatusResponse}},
)
def csv_results(task_id: str) -> JSONResponse:
    """
    Get the results of a permit conditions extraction job in a csv format
    Args:
        The task ID of the job.
    Raises:
        400 Bad Request: If the task has not completed successfully
    """
    res = run_permit_condition_pipeline.app.AsyncResult(task_id)

    if res.status == CeleryTaskStatus.SUCCESS.name:
        conditions = PermitConditions(conditions=res.get()["conditions"])

        for c in conditions.conditions:
            c.meta = json.dumps(c.meta)
        # Create a StringIO object to write CSV data
        csv_data = StringIO()
        # Define the fieldnames for the CSV file
        fieldnames = list(PermitCondition.model_json_schema()["properties"].keys())

        # Create a CSV writer
        csv_writer = csv.DictWriter(csv_data, fieldnames=fieldnames)

        # Write the header row
        csv_writer.writeheader()

        # Write each condition as a row in the CSV file
        for condition in conditions.conditions:
            csv_writer.writerow(json.loads(condition.model_dump_json()))

        # Reset the StringIO object to the beginning
        csv_data.seek(0)

        # Return the CSV file as a response
        return Response(
            content=csv_data.getvalue(),
            media_type="text/csv",
            headers={
                "Content-Disposition": 'attachment; filename="permit_conditions.csv"'
            },
        )

    elif res.status == CeleryTaskStatus.FAILURE.name:
        raise HTTPException(500, detail=f"Task failed to complete: {res.status}")
    else:
        return JSONResponse(
            status_code=202,
            content={
                "detail": f"Task has not completed yet. Current status: {res.status}"
            },
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
