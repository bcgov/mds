import os
from logging.config import dictConfig

from app.commands import register_commands
from app.docman.models import *
from app.docman.resources import *
from app.extensions import api, cache, db, jwt, jwt_core_internal, jwt_cypress, jwt_main, migrate
from app.routes import register_routes
from app.utils.celery_health_check import HealthCheckProbe
from celery import Celery
from flask import Flask, current_app, request
from flask_cors import CORS
from flask_restx.apidoc import apidoc
from opentelemetry import trace
from opentelemetry.instrumentation.flask import FlaskInstrumentor
from opentelemetry.sdk.trace import TracerProvider

from .config import Config, TestConfig
from .date_time_helper import get_formatted_current_time


def create_app(test_config=None):
    """Create and configure an instance of the Flask application."""
    if test_config is None:
        dictConfig(Config.LOGGING_DICT_CONFIG)
    app = Flask(__name__)

    if not os.path.exists('/tmp/spatial'):
        os.makedirs('/tmp/spatial')

    trace.set_tracer_provider(TracerProvider())

    FlaskInstrumentor().instrument_app(app)

    @app.after_request
    def log_response_info(response):
        # Get request information
        method = request.method
        path = request.full_path
        ip_address = request.remote_addr
        http_version = request.environ.get('SERVER_PROTOCOL', 'HTTP/1.1')

        # Log combined request and response information
        current_app.logger.info(f'{ip_address} - - [{get_formatted_current_time()}] "{method} {path} {http_version}" {response.status_code} -')

        return response

    config = test_config if test_config else Config
    app.config.from_object(config)

    if isinstance(config, TestConfig):
        register_extensions(app, config)
    else:
        register_extensions(app)

    register_routes(app)
    register_commands(app)

    # Register CLI commands
    from app.cli import document_cli
    app.cli.add_command(document_cli)

    @api.errorhandler(Exception)
    def default_error_handler(error):
        app.logger.error(str(error))
        app.logger.error('REQUEST\n' + str(request))
        app.logger.error('HEADERS\n ' + str(request.headers))
        return {
            'status': getattr(error, 'code', 500),
            'message': str(error),
        }, getattr(error, 'code', 500)

    @app.cli.command("fix-versions")
    def fix_versions_command():
        from fix_versions import fix_all_versions
        fix_all_versions()

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
        jwt_core_internal.init_app(app)
    else:
        jwt.init_app(app)

    if os.environ.get('ALLOW_CYPRESS_AUTH') == 'true':
        try:
            jwt_cypress.init_app(app)
        except Exception as e:
            with app.app_context():
                current_app.logger.error(f'Failed to initialize cypress auth. Make sure keycloak is running: {e}')

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
