from datetime import datetime

from app.api.now_applications.models.now_application_document_index_run import (
    NowApplicationDocumentIndexRun,
)
from app.api.search.search.now_application_search_service import (
    NowApplicationSearchService,
)
from app.tasks.celery import celery
from celery import Task
from flask import current_app
from werkzeug.exceptions import InternalServerError


class NowApplicationIndexTaskBase(Task):
    """
    Ensures a Celery failure while polling for indexing status is recorded on the
    corresponding NowApplicationDocumentIndexRun row.
    """

    def __call__(self, *args, **kwargs):
        from app.tasks.celery_entrypoint import celery_app

        with celery_app.app_context():
            return Task.__call__(self, *args, **kwargs)

    def on_failure(self, exc, task_id, args, kwargs, einfo):
        from app.tasks.celery_entrypoint import celery_app
        with celery_app.app_context():
            now_application_document_index_run_id = args[0]
            run = NowApplicationDocumentIndexRun.query.get(now_application_document_index_run_id)

            if not run:
                current_app.logger.error(
                    f'NowApplicationDocumentIndexRun {now_application_document_index_run_id} not found '
                    f'while handling task failure: {exc}')
                return

            run.status = 'error'
            run.error_message = str(exc)
            run.last_run_end = datetime.utcnow()
            run.save()


@celery.task(base=NowApplicationIndexTaskBase, max_retries=360)
def poll_update_now_application_document_index_status(now_application_document_index_run_id):
    """
    Poll the permits service for the status of a NoW application document indexing
    run every 10s until it reaches a terminal state (anything other than "running").
    """
    run = NowApplicationDocumentIndexRun.query.get(now_application_document_index_run_id)
    if not run:
        raise InternalServerError('NowApplicationDocumentIndexRun not found')

    index_status = NowApplicationSearchService().get_index_status(str(run.now_application_guid))
    status = index_status.get('status')

    if status != 'running':
        run.status = status
        run.items_processed = index_status.get('items_processed') or 0
        run.error_count = index_status.get('error_count') or 0
        run.error_message = index_status.get('error_message')
        run.last_run_end = datetime.utcnow()
        run.save()
        current_app.logger.info(
            f'NoW application document index run {run.now_application_document_index_run_id} '
            f'completed with status {status}')
        return run
    else:
        poll_update_now_application_document_index_status.retry(countdown=10)
