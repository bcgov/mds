from celery import Task

class TaskBase(Task):
    def __call__(self, *args, **kwargs):
        from app.tasks.celery_entrypoint import celery_app

        with celery_app.app_context():
            return Task.__call__(self, *args, **kwargs)