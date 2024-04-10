import datetime

import requests
import os
from logging.config import dictConfig

from flask import Flask, request, current_app
from flask_cors import CORS
from flask_restx import Resource
from flask_restx.apidoc import apidoc
from opentelemetry.instrumentation.flask import FlaskInstrumentor
from sqlalchemy.exc import SQLAlchemyError

from app.date_time_helper import get_formatted_current_time
from app.flask_jwt_oidc_local.exceptions import AuthError
from werkzeug.exceptions import Forbidden
import traceback

from app.api.compliance.namespace import api as compliance_api
from app.api.download_token.namespace import api as download_token_api
from app.api.incidents.namespace import api as incidents_api
from app.api.mines.namespace import api as mines_api
from app.api.now_submissions.namespace import api as now_sub_api
from app.api.now_applications.namespace import api as now_app_api
from app.api.parties.namespace import api as parties_api
from app.api.reporting.namespace import api as reporting_api
from app.api.search.namespace import api as search_api
from app.api.variances.namespace import api as variances_api
from app.api.users.namespace import api as users_api
from app.api.exports.namespace import api as exports_api
from app.api.document_generation.namespace import api as doc_gen_api
from app.api.securities.namespace import api as securities_api
from app.api.verify.namespace import api as verify_api
from app.api.orgbook.namespace import api as orgbook_api
from app.api.EMLI_contacts.namespace import api as EMLI_contacts_api
from app.api.projects.namespace import api as projects_api
from app.api.notice_of_departure.namespace import api as notice_of_departure_api
from app.api.activity.namespace import api as activity_api
from app.api.dams.namespace import api as dams_api
from app.api.verifiable_credentials.namespace import api as verifiable_credential_api
from app.api.report_error.namespace import api as report_error_api

from app.commands import register_commands
from app.config import Config
# alias api to avoid confusion with api folder (speifically on unittest.mock.patch calls)
from app.extensions import db, jwtv2, jwt, jwt_bcmi, jwt_fncs, jwt_gentax, jwt_nris, jwt_vfcbc, jwt_bcgw, jwt_docman_celery, jwt_cypress, api as root_api_namespace, cache
from app.api.utils.setup_marshmallow import setup_marshmallow
from app.api.utils.feature_flag import Feature, is_feature_enabled
from sqlalchemy.sql import text
from app.tasks.celery import celery
from app.tasks.celery_health_check import HealthCheckProbe
from app.api.exception.mds_core_api_exceptions import MDSCoreAPIException

from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider

def create_app(test_config=None):
    """Create and configure an instance of the Flask application."""
    if test_config is None:
        dictConfig(Config.LOGGING_DICT_CONFIG)
    app = Flask(__name__)

    trace.set_tracer_provider(TracerProvider())

    FlaskInstrumentor().instrument_app(app)

    @app.after_request
    def log_response_info(response):
        # Get request information
        method = request.method
        path = request.path
        ip_address = request.remote_addr
        http_version = request.environ.get('SERVER_PROTOCOL', 'HTTP/1.1')
        if path != '/health':
            # Log combined request and response information
            current_app.logger.info(f'{ip_address} - - [{get_formatted_current_time()}] "{method} {path} {http_version}" {response.status_code} -')

        return response

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_object(Config)
    else:
        # load the test config if passed in
        app.config.from_object(test_config)

    register_extensions(app, test_config)
    register_routes(app)
    register_commands(app)

    make_celery(app)

    return app


def make_celery(app):
    TaskBase = celery.Task

    class ContextTask(TaskBase):
        """
        Make celery aware of the flask application context
        to enable functionality that requires the application context within tasks
        (e.g. Datbase calls etc.)
        """
        abstract = True
        track_started = True

        def __call__(self, *args, **kwargs):
            with app.app_context():
                return TaskBase.__call__(self, *args, **kwargs)

    celery.Task = ContextTask

    celery.conf.update(
        result_backend=Config.CELERY_RESULT_BACKEND,
        broker_url=Config.CELERY_BROKER_URL,
        # Set default queue to put tasks in
        task_default_queue=Config.CELERY_DEFAULT_QUEUE,
        # Register beat schedule (for triggering scheduled tasks)
        beat_schedule=Config.CELERY_BEAT_SCHEDULE,
        beat_scheduler='redbeat.RedBeatScheduler',
        redbeat_redis_url=Config.CELERY_READBEAT_BROKER_URL,
        redbeat_lock_key='core-api'
    )

    celery.steps['worker'].add(HealthCheckProbe)

    return celery


def register_extensions(app, test_config=None):

    root_api_namespace.app = app

    # Overriding swaggerUI base path to serve content under a prefix
    apidoc.static_url_path = '{}/swaggerui'.format(Config.BASE_PATH)

    root_api_namespace.init_app(app)

    try:

        if test_config is None:
            jwtv2.init_app(app)
            jwt_bcmi.init_app(app)
            jwt_fncs.init_app(app)
            jwt_gentax.init_app(app)
            jwt_nris.init_app(app)
            jwt_vfcbc.init_app(app)
            jwt_bcgw.init_app(app)
            jwt_docman_celery.init_app(app)
        else:
            jwt.init(app)

        if os.environ.get('ALLOW_CYPRESS_AUTH') == 'true':
            jwt_cypress.init_app(app)

    except Exception as error:
        app.logger.error("Failed to initialize JWT library: " + str(error))

    cache.init_app(app)
    db.init_app(app)
    CORS(app)

    # Set up Marshmallow
    with app.app_context():
        setup_marshmallow()


def register_routes(app):
    # Set URL rules for resources
    app.add_url_rule('/', endpoint='index')

    root_api_namespace.add_namespace(compliance_api)
    root_api_namespace.add_namespace(mines_api)
    root_api_namespace.add_namespace(parties_api)
    root_api_namespace.add_namespace(download_token_api)
    root_api_namespace.add_namespace(users_api)
    root_api_namespace.add_namespace(search_api)
    root_api_namespace.add_namespace(variances_api)
    root_api_namespace.add_namespace(incidents_api)
    root_api_namespace.add_namespace(reporting_api)
    root_api_namespace.add_namespace(now_sub_api)
    root_api_namespace.add_namespace(now_app_api)
    root_api_namespace.add_namespace(exports_api)
    root_api_namespace.add_namespace(doc_gen_api)
    root_api_namespace.add_namespace(securities_api)
    root_api_namespace.add_namespace(verify_api)
    root_api_namespace.add_namespace(orgbook_api)
    root_api_namespace.add_namespace(EMLI_contacts_api)
    root_api_namespace.add_namespace(projects_api)
    root_api_namespace.add_namespace(notice_of_departure_api)
    root_api_namespace.add_namespace(activity_api)
    root_api_namespace.add_namespace(dams_api)
    root_api_namespace.add_namespace(verifiable_credential_api)
    root_api_namespace.add_namespace(report_error_api)

    @root_api_namespace.route('/version/')
    class VersionCheck(Resource):

        def get(self):
            return {'commit': os.environ.get('COMMIT_ID', 'local')}

    # General Service status
    @root_api_namespace.route('/health')
    class Healthcheck(Resource):

        def get_health(self):
            service = {
                'database': True,
                'cache': True,
                'nris': True,
                'docgen': True,
                'docman': True
            }
            status = 200
            if (Config.ENVIRONMENT_NAME == 'local'):
                return service, status

            try:
                service['database'] = get_database_status()
            except Exception as error:
                app.logger.error("Database health check failed " + str(error))
                service['database'] = False
                status = 503

            try:
                service['cache'] = get_cache_status()
            except Exception as error:
                app.logger.error("Cache health check failed " + str(error))
                service['cache'] = False
                status = 503

            try:
                service['nris'] = get_service_status('NRIS_API_URL')
            except Exception as error:
                app.logger.error("NRIS health check failed " + str(error))
                service['nris'] = False
                status = 503

            try:
                service['docgen'] = get_service_status('DOCUMENT_GENERATOR_URL')
            except Exception as error:
                app.logger.error("Docgen health check failed " + str(error))
                service['docgen'] = False
                status = 503

            try:
                service['docman'] = get_service_status('DOCUMENT_MANAGER_URL')
            except Exception as error:
                app.logger.error("Document Manager health check failed " + str(error))
                service['docman'] = False
                status = 503

            return service, status

        def get(self):
            return self.get_health()

    # Liveness Endpoint to make sure that python server is ready to accept connections and container / server is running.
    @root_api_namespace.route('/health/live')
    class Livenesscheck(Resource):

        def get(self):
            return {'live': True}

    # Readiness Endpoint to make sure that the container is ready to process the request it receives. Dependencies must be available
    @root_api_namespace.route('/health/ready')
    class Readinesscheck(Resource):

        def get(self):
            try:
                get_database_status()
                get_cache_status()
                return {'ready': True}
            except Exception as error:
                app.logger.error("Readiness Check Failed " + str(error))
                return {'ready': False}, 503

    def get_database_status():
        return db.session.query(text("up")).from_statement(text("SELECT 1 as up")).all()[0][0] == 1

    def get_cache_status():
        now = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        cache.set('ping', now)
        cached_now = cache.get('ping')
        return now == cached_now

    def get_service_status(uri):
        url = app.config[uri] + '/health'
        res = requests.get(url)
        return res.status_code == 200

    def get_trace_id():
        trace_id = ""
        current_span = trace.get_current_span()
        if current_span:
            trace_id = current_span.get_span_context().trace_id
        return trace_id

    @root_api_namespace.errorhandler(AuthError)
    def jwt_oidc_auth_error_handler(error):
        app.logger.error(str(error))
        app.logger.error('REQUEST\n' + str(request))
        app.logger.error('HEADERS\n ' + str(request.headers))
        return {
            'status': getattr(error, 'status_code', 401),
            'message': str(error),
            'trace_id': str(get_trace_id()),
        }, getattr(error, 'status_code', 401)

    @root_api_namespace.errorhandler(Forbidden)
    def forbidden_error_handler(error):
        app.logger.error(str(error))
        app.logger.error('REQUEST\n' + str(request))
        app.logger.error('HEADERS\n ' + str(request.headers))
        return {
            'status': getattr(error, 'status_code', 403),
            'message': str(error),
            'trace_id': str(get_trace_id()),
        }, getattr(error, 'status_code', 403)

    @root_api_namespace.errorhandler(AssertionError)
    def assertion_error_handler(error):
        app.logger.error(str(error))
        return {
            'status': getattr(error, 'code', 400),
            'message': str(error),
            'trace_id': str(get_trace_id()),
        }, getattr(error, 'code', 400)

    # Recursively add handler to every SQLAlchemy Error
    def sqlalchemy_error_handler(error):
        app.logger.error(str(error))
        app.logger.error(type(error))
        app.logger.error(traceback.format_exc())

        return {
            'status': getattr(error, 'status_code', 400),
            'message': "Error occurred while procesing data",
            'trace_id': str(get_trace_id()),
        }, getattr(error, 'status_code', 400)

    def _add_sqlalchemy_error_handlers(classname):
        for subclass in classname.__subclasses__():
            (root_api_namespace.errorhandler(subclass))(sqlalchemy_error_handler)

            if len(subclass.__subclasses__()) != 0:
                _add_sqlalchemy_error_handlers(subclass)

    _add_sqlalchemy_error_handlers(SQLAlchemyError)

    @root_api_namespace.errorhandler(Exception)
    def default_error_handler(error):
        app.logger.error(str(error))
        if isinstance(error, MDSCoreAPIException):
            error_message = str(getattr(error, "message", ""))
        else:
            error_message = str(error)

        return {
            "status": getattr(error, "code", 500),
            "message": error_message,
            "trace_id": str(get_trace_id()),
        }
