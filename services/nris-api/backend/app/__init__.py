from flask import Flask
from flask_cors import CORS

from flask_restx.apidoc import apidoc

from app.commands import register_commands
from app.routes import register_routes
from app.extensions import api, cache, db, jwt, migrate

from app.nris.models import *
from app.nris.resources import *

from .config import Config


def create_app(config_object=None):
    """Create and configure an instance of the Flask application."""
    app = Flask(__name__)

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

    try:
        jwt.init_app(app)
    except Exception as error:
        app.logger.error("Failed to initialize JWT library: " + str(error))

    cache.init_app(app)
    db.init_app(app)
    migrate.init_app(app, db)

    CORS(app)

    return None
