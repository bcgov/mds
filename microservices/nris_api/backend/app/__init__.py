import sys
import json
import os

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
from app.extensions import api, db, jwt, sched, apm, migrate

from app.nris.models import *

from app.nris.scheduled_jobs.NRIS_etl import _schedule_NRIS_ETL_jobs

from app.config import Config


def create_app(test_config=None):
    """Create and configure an instance of the Flask application."""
    app = Flask(__name__)

    config = test_config if test_config else Config
    app.config.from_object(config)

    register_extensions(app)
    register_routes(app)
    register_commands(app)
    register_scheduled_jobs(app)

    return app


def register_extensions(app):

    api.app = app
    # Overriding swaggerUI base path to serve content under a prefix
    apidoc.static_url_path = f'{Config.BASE_PATH}/swaggerui'
    api.init_app(app)

    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    apm.init_app(app) if app.config['ELASTIC_ENABLED'] == '1' else None
    sched.init_app(app)

    CORS(app)
    Compress(app)

    return None


def register_scheduled_jobs(app):
    if app.config.get('ENVIRONMENT_NAME') in ['test', 'prod']:
        if not app.debug or os.environ.get("WERKZEUG_RUN_MAIN") == 'true':
            sched.start()
            _schedule_NRIS_ETL_jobs(app)
