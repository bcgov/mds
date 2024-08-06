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
    t = context.set(task)

    try:
        yield
    finally:
        context.reset(t)

@celery_app.task(bind=True)
def run_permit_condition_pipeline(self, file_name: str, meta: dict):
    with task_context(self):
        pipeline = permit_condition_pipeline()

        self.update_state(state="PROGRESS", meta={"stage": "start", file_name: file_name, **meta})

        result = pipeline.run(
            {
                "pdf_converter": {"file_path": file_name},
                "prompt_builder": {
                    "template_variables": {
                        "max_pages": 6,
                    }
                },
            }
        )["validator"]

        conditions = result["conditions"]

        return conditions.model_dump()
