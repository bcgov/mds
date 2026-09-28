from unittest import mock

from app.services.commands_helper import start_zip_job


def test_start_zip_job_queues_task_and_returns_task_id():
    """Should queue the zip task directly on Celery and return its task id"""
    docs = [mock.Mock(document_id=1), mock.Mock(document_id=2)]
    task = mock.Mock()
    task.delay.return_value.id = 'test-task-id'

    response = start_zip_job('create_zip', docs, task, 'test.zip')

    task.delay.assert_called_once()
    job_id, doc_ids, zip_file_name = task.delay.call_args.args
    assert doc_ids == [1, 2]
    assert zip_file_name == 'test.zip'
    assert response['task_id'] == 'test-task-id'
    assert job_id in response['message']
