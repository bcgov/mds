import os
from unittest import mock

import pytest
from app.permit_conditions.context import context
from app.permit_conditions.tasks.tasks import task_context


def test_task_context():
    task = mock.Mock()

    with task_context(task):
        # Assert that the task is set in the context
        assert task == context.get()

    # Assert that the task is reset after exiting the context
    with pytest.raises(LookupError):
        context.get()
