from app.api.mines.permits.permit_conditions.tasks import (
    export_and_index_permit_amendments
)
from app.api.mines.permits.permit_extraction.create_permit_conditions import (
    create_permit_conditions_from_task,
)
from app.api.mines.permits.permit_extraction.models.permit_extraction_task import (
    PermitExtractionTask,
)
from app.api.search.search.permit_search_service import PermitSearchService
from app.tasks.celery import celery
from celery import Task
from flask import current_app
from werkzeug.exceptions import InternalServerError


class PermitExtractionTaskBase(Task):
    """
    This task base class is used to ensure that a Celery task failure is recorded in the database.
    - The on_failure method is called when a task fails AFTER all retries have been exhausted or on an exception.
    """

    def __call__(self, *args, **kwargs):
        from app.tasks.celery_entrypoint import celery_app

        # Make sure app context is set up when running the task so we can access the database
        with celery_app.app_context():
            return Task.__call__(self, *args, **kwargs)

    def on_failure(self, exc, task_id, args, kwargs, einfo):
        from app.tasks.celery_entrypoint import celery_app
        with celery_app.app_context():
            task = PermitExtractionTask.query.filter_by(core_status_task_id=task_id).first()

            if not task:
                raise InternalServerError('Task not found')

            task.task_status = 'FAILURE'
            task.save()


@celery.task(base=PermitExtractionTaskBase)
def initialize_single_permit_extraction(document_manager_guid, permit_amendment_guid):
    """
    Initialize permit extraction for a single document.
    """
    from app.api.mines.permits.permit_amendment.models.permit_amendment import (
        PermitAmendment,
    )
    from app.api.mines.permits.permit_amendment.models.permit_amendment_document import (
        PermitAmendmentDocument,
    )
    
    document = PermitAmendmentDocument.find_by_document_manager_guid(document_manager_guid)
    if not document:
        raise ValueError(f"Invalid document {document_manager_guid}")
        
    amendment = PermitAmendment.find_by_permit_amendment_guid(permit_amendment_guid)
    if not amendment:
        raise ValueError(f"Invalid amendment {permit_amendment_guid}")
        
    if amendment and len(amendment.conditions) > 0:
        raise ValueError(f"Amendment {permit_amendment_guid} already has conditions")
        
    task = PermitSearchService().initialize_permit_extraction(document, with_internal_auth=True)
    if task:
        core_task = poll_update_permit_extraction_status.delay(task.permit_extraction_task_id)
        task.core_status_task_id = core_task.id
        task.save()
        return task.permit_extraction_task_id
    return None


@celery.task(base=PermitExtractionTaskBase, max_retries=360)
def poll_update_permit_extraction_status(permit_extraction_task_id):
    """
    Poll the permit conditions service for the status of the extraction task every 10s
    until the task is complete (SUCCESS or FAILURE).
    """
    task, task_status = PermitSearchService().update_task_status(permit_extraction_task_id)

    if task_status == 'SUCCESS' or task_status == 'FAILURE':
        if task_status == 'SUCCESS':
            create_permit_conditions_from_task(task)
            export_and_index_permit_amendments.delay([task.permit_amendment_guid])

        task.task_status = task_status
        task.save()
        current_app.logger.info(f'Permit extraction task {task.task_id} has completed with status {task_status}')
        return task
    else:
        task.task_status = task_status
        task.save()
        poll_update_permit_extraction_status.retry(countdown=10)
