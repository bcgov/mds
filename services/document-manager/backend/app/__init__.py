import sys
import json
import os

from flask import Flask, current_app, request
from flask_cors import CORS
from flask_restplus import Resource
from flask_restplus.apidoc import apidoc
from flask_migrate import MigrateCommand

from flask_jwt_oidc.exceptions import AuthError
from sqlalchemy.exc import SQLAlchemyError

from app.docman.models import *
from app.docman.resources import *

from app.commands import register_commands
from app.routes import register_routes
from app.extensions import api, cache, db, jwt, apm, migrate

from .config import Config


def create_app(config_object=None):
    """Create and configure an instance of the Flask application."""
    app = Flask(__name__)

    config = config_object if config_object else Config
    app.config.from_object(config)

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


def register_extensions(app):

    api.app = app
    # Overriding swaggerUI base path to serve content under a prefix
    apidoc.static_url_path = f'{Config.BASE_PATH}/swaggerui'
    api.init_app(app)

    if app.config['ELASTIC_ENABLED'] == '1':
        apm.init_app(app)

    cache.init_app(app)
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

    CORS(app)

    return None
