import flask
from celery import Celery
from app.config import Config
# from app import create_app

celery = Celery('app', backend=Config.CELERY_RESULT_BACKEND, broker=Config.BROKER_URL)

              # class FlaskCelery(Celery):
              #     def __init__(self, *args, **kwargs):
              #         super(FlaskCelery, self).__init__(*args, **kwargs)
              #         self.patch_task()
              #         if 'app' in kwargs:
              #             self.init_app(kwargs['app'])
              #         else:
              #             self.init_app(create_app(Config))

              #     def patch_task(self):
              #         TaskBase = self.Task
              #         _celery = self

              #         class ContextTask(TaskBase):
              #             abstract = True

              #             def __call__(self, *args, **kwargs):
              #                 if flask.has_app_context():
              #                     return TaskBase.__call__(self, *args, **kwargs)
              #                 else:
              #                     with _celery.app.app_context():
              #                         return TaskBase.__call__(self, *args, **kwargs)

              #         self.Task = ContextTask

              #     def init_app(self, app):
              #         # app.logger.info(f'flask_celery init_app app:\n{app.__dict__}')

              #         # for k, v in app:
              #         #     app.logger.info(f'{k}:{v}')
              #         # app.logger.info(f'flask_celery init_app app.config:\n{app.config.__dict__}')
              #         # app.logger.info(f'flask_celery init_app app.config:\n{app.config.from_object(Config)}')
              #         self.app = app
              #         self.config_from_object(app.config)

              # celery = FlaskCelery()
