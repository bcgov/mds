
from app.api.mines.permits.permit_extraction.create_permit_conditions import (
    create_permit_conditions_from_task,
)
from app.api.search.search.permit_search_service import PermitSearchService
from app.tasks.celery import celery


@celery.task(max_retries=360)
def poll_update_permit_extraction_status(permit_extraction_task_id):
    """
    Poll the permit conditions service for the status of the extraction task every 10s
    until the task is complete (SUCCESS or FAILURE).
    """
    task = PermitSearchService().update_task_status(permit_extraction_task_id)

    if task.task_status == 'SUCCESS' or task.task_status == 'FAILURE':
        if task.task_status == 'SUCCESS':
            create_permit_conditions_from_task(task)
        task.save()
        return task
    else:
        task.save()
        poll_update_permit_extraction_status.retry(countdown=10)
