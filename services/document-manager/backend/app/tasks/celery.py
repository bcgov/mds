import json

from celery.utils.log import get_task_logger
from celery.result import AsyncResult

from app import make_celery
celery = make_celery()


class JobFailure(Exception):
    """The exception that will be raised if one or more of the tasks in a job failed."""
    def __init__(self, message):
        self.message = message
        Exception.__init__(self, message)


@celery.task()
def doc_job_result(task_results, job_type, job_id):
    logger = get_task_logger(job_id)
    logger.info(f'All tasks in {job_type} job with ID {job_id} have completed')

    task_results = [json.loads(result) for result in task_results]
    logger.debug(f'job_id: {job_id}\ntask_results:\n{task_results}')

    success_docs = [doc_id for result in task_results for doc_id in result['success_docs']]
    fail_docs = [doc_id for result in task_results for doc_id in result['fail_docs']]
    errors = [error for result in task_results for error in result['errors']]

    success = []
    for result in task_results:
        result_success = result['success']
        success.append(result_success)
        if (not result_success):
            doc_job_result.update_state(
                task_id=result['task_id'], state='FAILURE', meta=json.dumps(result))

    job_success = all(success)
    result = {
        'job_id': job_id,
        'success': job_success,
        'success_docs': list(sorted(success_docs)),
        'fail_docs': list(sorted(fail_docs)),
        'errors': errors
    }
    logger.debug(json.dumps(result, indent=4))
    result = json.dumps(result)

    if (not job_success):
        raise JobFailure(result)
    return result


def doc_task_result(job_id, task_id, chunk, success, message, success_docs, errors, doc_ids):
    result = {
        'job_id': job_id,
        'task_id': task_id,
        'chunk': chunk,
        'success': success,
        'message': message,
        'success_docs': list(sorted(success_docs)),
        'fail_docs': list(sorted([i for i in doc_ids if i not in success_docs])),
        'errors': errors
    }
    return json.dumps(result)

def get_task(task_id):
    result = AsyncResult(task_id, app=celery)
    return result