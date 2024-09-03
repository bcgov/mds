from contextlib import contextmanager
from contextvars import ContextVar
from time import sleep

from app.celery import celery_app
from app.permit_conditions.context import context
from app.permit_conditions.pipelines.permit_condition_pipeline import (
    permit_condition_pipeline,
)


@contextmanager
def task_context(task):
    # Creates a context that is bound to the given task so the task can be accessed
    # by each step of the pipeline (for example to update the task state / meta (e.g. for a progress indicator))
    # usage:
    # with task_context(self):
    #  ....
    # from app.permit_conditions.context import context
    # context.get().update_state(state="PROGRESS", meta={"stage": "pdf_to_text_converter"})

    t = context.set(task)

    try:
        yield
    finally:
        context.reset(t)


@celery_app.task(bind=True)
def run_permit_condition_pipeline(self, file_name: str, meta: dict):
    with task_context(self):
        pipeline = permit_condition_pipeline()

        self.update_state(
            state="PROGRESS", meta={"stage": "start", file_name: file_name, **meta}
        )

        result = pipeline.run(
            {
                "pdf_converter": {"file_path": file_name},
            }
        )["combine_metadata"]

        conditions = result["conditions"]

        return conditions.model_dump()
