import sys
import json
import os
import logging

from flask import Flask, current_app
from flask_cors import CORS
from flask_restplus import Resource
from flask_restplus.apidoc import apidoc
from flask_compress import Compress
from flask_migrate import MigrateCommand

from flask_jwt_oidc.exceptions import AuthError
from sqlalchemy.exc import SQLAlchemyError

from app.commands import register_commands
from app.routes import register_routes
from app.extensions import api, cache, db, jwt, sched, apm, migrate

from app.nris.models import *
from app.nris.resources import *

from .config import Config


def create_app(config_object=None):
    """Create and configure an instance of the Flask application."""
    app = Flask(__name__)
    add_stdout_handler_to_logger()

    config = config_object if config_object else Config
    app.config.from_object(config)

    register_extensions(app)
    register_routes(app)
    register_commands(app)

    return app


def register_extensions(app):

    api.app = app
    # Overriding swaggerUI base path to serve content under a prefix
    apidoc.static_url_path = f'{Config.BASE_PATH}/swaggerui'
    api.init_app(app)

    if app.config['ELASTIC_ENABLED'] == '1':
        apm.init_app(app)

    try:
        jwt.init_app(app)
    except Exception as error:
        app.logger.error("Failed to initialize JWT library: " + str(error))

    cache.init_app(app)
    db.init_app(app)
    migrate.init_app(app, db)
    sched.init_app(app)

    CORS(app)
    Compress(app)

    return None

def add_stdout_handler_to_logger():
    root = logging.getLogger()

    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    root.addHandler(handler)