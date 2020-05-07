import logging
from logging.config import dictConfig

from flask import Flask, request

from flask_cors import CORS
from flask_restplus import Resource, apidoc
from sqlalchemy.exc import SQLAlchemyError
from marshmallow.exceptions import MarshmallowError

from flask_jwt_oidc.exceptions import AuthError
from werkzeug.exceptions import Forbidden, BadRequest

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

from app.commands import register_commands
from app.config import Config
from app.extensions import db, jwt, api, cache, apm

import app.api.utils.setup_marshmallow


def create_app(test_config=None):
    """Create and configure an instance of the Flask application."""
    if test_config is None:
        dictConfig(Config.LOGGING_DICT_CONFIG)
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

    return app


def register_extensions(app):

    api.app = app
    # Overriding swaggerUI base path to serve content under a prefix
    apidoc.apidoc.static_url_path = '{}/swaggerui'.format(Config.BASE_PATH)
    api.init_app(app)
    if app.config['ELASTIC_ENABLED'] == '1':
        apm.init_app(app)
        logging.getLogger('elasticapm').setLevel(30)

    else:
        app.logger.info('ELASTIC_ENABLED: FALSE, set ELASTIC_ENABLED=1 to enable')

    try:
        jwt.init_app(app)
    except Exception as error:
        app.logger.error("Failed to initialize JWT library: " + str(error))

    cache.init_app(app)
    db.init_app(app)

    CORS(app)

    return None


def register_routes(app):
    # Set URL rules for resources
    app.add_url_rule('/', endpoint='index')

    api.add_namespace(compliance_api)
    api.add_namespace(mines_api)
    api.add_namespace(parties_api)
    api.add_namespace(download_token_api)
    api.add_namespace(users_api)
    api.add_namespace(search_api)
    api.add_namespace(variances_api)
    api.add_namespace(incidents_api)
    api.add_namespace(reporting_api)
    api.add_namespace(now_sub_api)
    api.add_namespace(now_app_api)
    api.add_namespace(exports_api)
    api.add_namespace(doc_gen_api)
    api.add_namespace(securities_api)
    api.add_namespace(verify_api)
    api.add_namespace(orgbook_api)

    # Healthcheck endpoint
    @api.route('/health')
    class Healthcheck(Resource):
        def get(self):
            return {'status': 'pass'}

    @api.errorhandler(AuthError)
    def jwt_oidc_auth_error_handler(error):
        app.logger.error(str(error))
        app.logger.error('REQUEST\n' + str(request))
        app.logger.error('HEADERS\n ' + str(request.headers))
        return {
            'status': getattr(error, 'status_code', 401),
            'message': str(error),
        }, getattr(error, 'status_code', 401)

    @api.errorhandler(Forbidden)
    def forbidden_error_handler(error):
        app.logger.error(str(error))
        app.logger.error('REQUEST\n' + str(request))
        app.logger.error('HEADERS\n ' + str(request.headers))
        return {
            'status': getattr(error, 'status_code', 403),
            'message': str(error),
        }, getattr(error, 'status_code', 403)

    @api.errorhandler(AssertionError)
    def assertion_error_handler(error):
        app.logger.error(str(error))
        return {
            'status': getattr(error, 'code', 400),
            'message': str(error),
        }, getattr(error, 'code', 400)

    # Recursively add handler to every SQLAlchemy Error
    def sqlalchemy_error_handler(error):
        app.logger.error(str(error))
        app.logger.error(type(error))
        return {
            'status': getattr(error, 'status_code', 400),
            'message': str(error),
        }, getattr(error, 'status_code', 400)

    def _add_sqlalchemy_error_handlers(classname):
        for subclass in classname.__subclasses__():
            (api.errorhandler(subclass))(sqlalchemy_error_handler)

            if len(subclass.__subclasses__()) != 0:
                _add_sqlalchemy_error_handlers(subclass)

    _add_sqlalchemy_error_handlers(SQLAlchemyError)

    @api.errorhandler(Exception)
    def default_error_handler(error):
        app.logger.error(str(error))
        return {
            'status': getattr(error, 'code', 500),
            'message': str(error),
        }, getattr(error, 'code', 500)
