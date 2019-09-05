from flask import Flask
from flask_cors import CORS
from flask_restplus import Resource, apidoc
from flask_compress import Compress
from sqlalchemy.exc import SQLAlchemyError

from flask_jwt_oidc.exceptions import AuthError

from app.api.parties.namespace.parties import api as parties_api
from app.api.applications.namespace.applications import api as applications_api
from app.api.mines.namespace.mines import api as mines_api
from app.api.download_token.namespace.download_token import api as download_token_api
from app.api.users.namespace.users import api as users_api
from app.api.search.namespace.search import api as search_api
from app.api.reporting.namespace.reporting import api as reporting_api
from app.api.variances.namespace.variances import api as variances_api
from app.api.incidents.namespace.incidents import api as incidents_api
from app.api.now_submissions.namespace.now_submissions import api as now_api

from app.commands import register_commands
from app.config import Config
from app.extensions import db, jwt, api, cache, apm


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

    return app


def register_extensions(app):

    api.app = app
    # Overriding swaggerUI base path to serve content under a prefix
    apidoc.apidoc.static_url_path = '{}/swaggerui'.format(Config.BASE_PATH)
    api.init_app(app)

    if app.config['ELASTIC_ENABLED'] == '1':
        apm.init_app(app)
    else:
        app.logger.debug('ELASTIC_ENABLED: FALSE, set ELASTIC_ENABLED=1 to enable')

    try:
        jwt.init_app(app)
    except Exception as error:
        app.logger.error("Failed to initialize JWT library: " + str(error))

    cache.init_app(app)
    db.init_app(app)

    CORS(app)
    Compress(app)

    return None


def register_routes(app):
    # Set URL rules for resources
    app.add_url_rule('/', endpoint='index')

    api.add_namespace(mines_api)
    api.add_namespace(parties_api)
    api.add_namespace(download_token_api)
    api.add_namespace(users_api)
    api.add_namespace(applications_api)
    api.add_namespace(search_api)
    api.add_namespace(variances_api)
    api.add_namespace(incidents_api)
    api.add_namespace(reporting_api)
    api.add_namespace(now_api)

    # Healthcheck endpoint
    @api.route('/health')
    class Healthcheck(Resource):
        def get(self):
            return {'success': 'true'}

    @api.errorhandler(AuthError)
    def jwt_oidc_auth_error_handler(error):
        app.logger.error(str(error))
        return {
            'status': getattr(error, 'status_code', 401),
            'message': str(error),
        }, getattr(error, 'status_code', 401)

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
        return {
            'status': getattr(error, 'status_code', 400),
            'message': str('Invalid request.'),
        }, getattr(error, 'status_code', 400)

    def _add_sqlalchemy_error_handlers(classname):
        for subclass in classname.__subclasses__():
            (api.errorhandler(subclass))(sqlalchemy_error_handler)

            if len(subclass.__subclasses__()) != 0:
                _add_sqlalchemy_error_handlers(subclass)

    _add_sqlalchemy_error_handlers(SQLAlchemyError)

    @api.errorhandler(Exception)
    def default_error_handler(error):
        if getattr(error, 'code', 500) == 500:
            app.logger.error(str(error))
        return {
            'status': getattr(error, 'code', 500),
            'message': str(error),
        }, getattr(error, 'code', 500)
