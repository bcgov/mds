import sys
import json
import os


from flask import Flask, current_app, request
from flask_cors import CORS
from flask_restx import Resource
from flask_restx.apidoc import apidoc
from flask_migrate import MigrateCommand

from flask_jwt_oidc.exceptions import AuthError
from sqlalchemy.exc import SQLAlchemyError

from app.docman.models import *
from app.docman.resources import *

from app.commands import register_commands
from app.routes import register_routes
from app.extensions import api, cache, db, jwt, migrate, jwt_main, jwt_cypress
from app.utils.celery_health_check import HealthCheckProbe

from .config import Config, TestConfig

from celery import Celery


def create_app(config_object=None):
    """Create and configure an instance of the Flask application."""
    app = Flask(__name__)

    config = config_object if config_object else Config
    app.config.from_object(config)

    if isinstance(config, TestConfig):
        register_extensions(app, config)
    else:
        register_extensions(app)

    register_routes(app)
    register_commands(app)

    @api.errorhandler(Exception)
    def default_error_handler(error):
        app.logger.error(str(error))
        app.logger.error('REQUEST\n' + str(request))
        app.logger.error('HEADERS\n ' + str(request.headers))
        return {
            'status': getattr(error, 'code', 500),
            'message': str(error),
        }, getattr(error, 'code', 500)

    return app


def register_extensions(app, test_config=None):

    api.app = app
    # Overriding swaggerUI base path to serve content under a prefix
    apidoc.static_url_path = f'{Config.BASE_PATH}/swaggerui'
    api.init_app(app)

    cache.init_app(app)
    db.init_app(app)

    if test_config is None:
        jwt_main.init_app(app)
    else:
        jwt.init_app(app)

    if os.environ.get('ALLOW_CYPRESS_AUTH') == 'true':
        jwt_cypress.init_app(app)

    migrate.init_app(app, db)
    CORS(app)

    return None


def make_celery(app=None):
    app = app or create_app()
    celery = Celery(
        app.import_name,
        backend=app.config['CELERY_RESULT_BACKEND'],
        broker=app.config['CELERY_BROKER_URL'])
    celery.conf.update(app.config)

    # Add Celery StartStopStep for Health Check Probing
    celery.steps['worker'].add(HealthCheckProbe)

    TaskBase = celery.Task

    class ContextTask(TaskBase):
        abstract = True
        track_started = True

        def __call__(self, *args, **kwargs):
            with app.app_context():
                return TaskBase.__call__(self, *args, **kwargs)

    celery.Task = ContextTask
    return celery
