from unittest import mock

import httpx
import pytest
from app.app import mds
from app.helpers.celery_task_status import CeleryTaskStatus
from app.permit_conditions.tasks.tasks import run_permit_condition_pipeline
from app.permit_conditions.validator.permit_condition_model import PermitConditions
from fastapi.testclient import TestClient

client = TestClient(mds)
mds.user_middleware.clear()
mds.middleware_stack = mds.build_middleware_stack()


@pytest.fixture
def mock_run_permit_condition_pipeline(mocker):
    pending_task = mock.MagicMock(task_id="123", status="PENDING", info={})
    return mocker.patch.object(
        run_permit_condition_pipeline, "delay", return_value=pending_task
    )


@pytest.fixture
def mock_store_temporary(mocker):
    mocked_file = mock.MagicMock(name="abc.123.pdf", close=mock.MagicMock())
    return mocker.patch(
        "app.permit_conditions.resources.permit_condition_resource.store_temporary",
        return_value=mocked_file,
    )


@pytest.fixture
def mock_async_result(mocker):
    mock_result = mocker.patch(
        "app.permit_conditions.tasks.tasks.run_permit_condition_pipeline.app.AsyncResult"
    )
    return mock_result


@pytest.mark.asyncio
async def test_extract_permit_conditions_success(
    mock_store_temporary, mock_run_permit_condition_pipeline
):
    file_content = b"%PDF-1.4..."
    files = {"file": ("test.pdf", file_content, "application/pdf")}

    response = client.post("/permit_conditions", files=files)

    assert response.status_code == 200

    assert response.json()["status"] == CeleryTaskStatus.PENDING.name


@pytest.mark.asyncio
async def test_extract_permit_conditions_invalid_file_type():
    file_content = b"Not a PDF content"
    files = {"file": ("test.txt", file_content, "text/plain")}

    response = client.post("/permit_conditions", files=files)

    assert response.status_code == 400

    assert (
        response.json()["detail"] == "Invalid file type. Only PDF files are supported."
    )


def test_results_success(mock_async_result):
    task_id = "some-task-id"
    mock_async_result.return_value.status = CeleryTaskStatus.SUCCESS.name
    mock_async_result.return_value.get.return_value = {"conditions": []}

    response = client.get(f"/permit_conditions/results?task_id={task_id}")

    assert response.status_code == 200

    assert response.json() == {"conditions": []}


def test_results_failure(mock_async_result):
    task_id = "some-task-id"
    mock_async_result.return_value.status = CeleryTaskStatus.FAILURE.name

    response = client.get(f"/permit_conditions/results?task_id={task_id}")

    assert response.status_code == 500

    assert response.json()["detail"] == ("Task failed to complete: FAILURE")


def test_results_incomplete(mock_async_result):
    task_id = "some-task-id"
    mock_async_result.return_value.status = CeleryTaskStatus.PENDING.name

    response = client.get(f"/permit_conditions/results?task_id={task_id}")

    assert response.status_code == 202

    assert response.json()["detail"] == (
        "Task has not completed yet. Current status: PENDING"
    )


def test_status_success(mock_async_result):
    task_id = "some-task-id"
    mock_async_result.return_value.task_id = task_id
    mock_async_result.return_value.status = CeleryTaskStatus.SUCCESS.name
    mock_async_result.return_value.info = {"some": "info"}

    response = client.get(f"/permit_conditions/status?task_id={task_id}")

    assert response.status_code == 200

    assert response.json() == {
        "id": task_id,
        "status": CeleryTaskStatus.SUCCESS.name,
        "meta": {"some": "info"},
    }


def test_status_pending(mock_async_result):
    task_id = "some-task-id"
    mock_async_result.return_value.task_id = task_id
    mock_async_result.return_value.status = "PENDING"
    mock_async_result.return_value.info = None

    response = client.get(f"/permit_conditions/status?task_id={task_id}")

    assert response.status_code == 200

    assert response.json() == {"id": task_id, "status": "PENDING", "meta": None}


def test_status_failure(mock_async_result):
    task_id = "some-task-id"
    mock_async_result.return_value.task_id = task_id
    mock_async_result.return_value.status = CeleryTaskStatus.FAILURE.name
    mock_async_result.return_value.info = {"error": "some error"}

    response = client.get(f"/permit_conditions/status?task_id={task_id}")

    assert response.status_code == 200

    assert response.json() == {
        "id": task_id,
        "status": CeleryTaskStatus.FAILURE.name,
        "meta": {"error": "some error"},
    }


def test_results_success(mock_async_result):
    task_id = "some-task-id"
    mock_async_result.return_value.status = CeleryTaskStatus.SUCCESS.name
    mock_async_result.return_value.get.return_value = {
        "conditions": [
            {
                "id": "abc123",
                "condition_text": "condition 1",
                "meta": {"bounding_box": {"top": 1}},
                "section": "A",
                "paragraph": "1",
                "subparagraph": "5",
                "subclause": "1",
                "subsubclause": "1",
                "clause": "1",
            },
            {
                "id": "234",
                "condition_text": "condition 2",
                "meta": {"bounding_box": {"top": 2}},
                "section": "A",
                "paragraph": "2",
                "subparagraph": "5",
                "subclause": "1",
                "subsubclause": "1",
                "clause": None,
            },
        ]
    }

    response = client.get(f"/permit_conditions/results/csv?task_id={task_id}")

    assert response.status_code == 200

    assert (
        response.text
        == "section,section_title,paragraph,subparagraph,clause,subclause,subsubclause,condition_title,page_number,condition_text,original_condition_text,type,meta,id\r\n"
        + 'A,,1,5,1,1,1,,,condition 1,,,"{""bounding_box"": {""top"": 1}}",abc123\r\n'
        + 'A,,2,5,,1,1,,,condition 2,,,"{""bounding_box"": {""top"": 2}}",234\r\n'
    )


def test_results_fail(mock_async_result):
    task_id = "some-task-id"
    mock_async_result.return_value.status = CeleryTaskStatus.FAILURE.name

    response = client.get(f"/permit_conditions/results/csv?task_id={task_id}")

    assert response.status_code == 500

    assert response.json()["detail"] == ("Task failed to complete: FAILURE")


def test_results_not_finished(mock_async_result):
    task_id = "some-task-id"
    mock_async_result.return_value.status = CeleryTaskStatus.PENDING.name

    response = client.get(f"/permit_conditions/results/csv?task_id={task_id}")

    assert response.status_code == 202

    assert response.json()["detail"] == (
        "Task has not completed yet. Current status: PENDING"
    )
