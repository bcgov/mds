import sys
import json
import os

from flask import Flask, current_app
from flask_cors import CORS
from flask_restplus import Resource, apidoc
from flask_compress import Compress

from flask_jwt_oidc.exceptions import AuthError

from app.api.parties.namespace.parties import api as parties_api
from app.api.applications.namespace.applications import api as applications_api
from app.api.mines.namespace.mines import api as mines_api
from app.api.mines.namespace.variances import api as variances_api
from app.api.permits.namespace.permits import api as permits_api
from app.api.documents.namespace.documents import api as document_api
from app.api.document_manager.namespace.document_manager import api as document_manager_api
from app.api.users.namespace.users import api as users_api
from app.commands import register_commands
from app.config import Config
from app.extensions import db, jwt, api, cache, sched, apm

from app.scheduled_jobs.NRIS_jobs import _schedule_NRIS_jobs
from app.scheduled_jobs.ETL_jobs import _schedule_ETL_jobs
from app.scheduled_jobs.IDIR_jobs import _schedule_IDIR_jobs


def create_app(test_config=None):
    """Create and configure an instance of the Flask application."""
    app = Flask(__name__)

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_object(Config)
    else:
        # load the test config if passed in
        app.config.from_object(test_config)

    register_extensions(app)
    register_routes(app)
    register_commands(app)
    register_scheduled_jobs(app)

    return app


def register_extensions(app):

    api.app = app
    # Overriding swaggerUI base path to serve content under a prefix
    apidoc.apidoc.static_url_path = '{}/swaggerui'.format(Config.BASE_PATH)
    api.init_app(app)

    cache.init_app(app)
    db.init_app(app)
    jwt.init_app(app)
    apm.init_app(app) if app.config['ELASTIC_ENABLED'] == '1' else None
    sched.init_app(app)

    CORS(app)
    Compress(app)

    return None


def register_scheduled_jobs(app):
    if app.config.get('ENVIRONMENT_NAME') in ['test', 'prod']:
        if not app.debug or os.environ.get("WERKZEUG_RUN_MAIN") == 'true':
            sched.start()
            _schedule_IDIR_jobs(app)
            _schedule_NRIS_jobs(app)
            _schedule_ETL_jobs(app)


def register_routes(app):
    # Set URL rules for resources
    app.add_url_rule('/', endpoint='index')

    api.add_namespace(mines_api)
    api.add_namespace(parties_api)
    api.add_namespace(permits_api)
    api.add_namespace(document_api)
    api.add_namespace(document_manager_api)
    api.add_namespace(users_api)
    api.add_namespace(applications_api)
    api.add_namespace(variances_api)

    # Healthcheck endpoint
    @api.route('/health')
    class Healthcheck(Resource):
        def get(self):
            return {'success': 'true'}

    @api.errorhandler(AuthError)
    def jwt_oidc_auth_error_handler(error):
        return {
            'status': getattr(error, 'status_code', 401),
            'message': str(error),
        }, getattr(error, 'status_code', 401)

    @api.errorhandler(AssertionError)
    def assertion_error_handler(error):
        return {
            'status': getattr(error, 'code', 400),
            'message': str(error),
        }, getattr(error, 'code', 400)

    @api.errorhandler(Exception)
    def default_error_handler(error):
        if getattr(error, 'code', 500) == 500:
            current_app.logger.error(str(error))

        return {
            'status': getattr(error, 'code', 500),
            'message': str(error),
        }, getattr(error, 'code', 500)
