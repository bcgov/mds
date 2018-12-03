import sys
import json

from flask import Flask
from flask_cors import CORS
from flask_restplus import Resource
from flask_uploads import UploadSet, configure_uploads, patch_request_class
from flask_compress import Compress

from .api.parties.namespace.parties import api as parties_api
from .api.mines.namespace.mines import api as mines_api
from .api.permits.namespace.permits import api as permits_api
from .api.documents.namespace.documents import api as document_api
from .api.document_manager.namespace.document_manager import api as document_manager_api
from .commands import register_commands
from .config import Config
from .extensions import db, jwt, api, documents

def create_app(test_config=None):
    """Create and configure an instance of the Flask application."""
    app = Flask(__name__)

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_object(Config)
    else:
        # load the test config if passed in
        app.config.from_object(test_config)
    
    configure_uploads(app, documents)
    patch_request_class(app, Config.FILE_BYTE_LIMIT)

    configure_uploads(app, documents)

    register_extensions(app)
    register_routes(app)
    register_commands(app)
    
    return app


def register_extensions(app):
    api.app = app
    api.init_app(app)

    db.init_app(app)
    jwt.init_app(app)

    CORS(app)
    Compress(app)

    return None


def register_routes(app):
    # Set URL rules for resources
    app.add_url_rule('/', endpoint='index')

    api.add_namespace(mines_api)
    api.add_namespace(parties_api)
    api.add_namespace(permits_api)
    api.add_namespace(document_api)
    api.add_namespace(document_manager_api)
    
    # Healthcheck endpoint
    @api.route('/health')
    class Healthcheck(Resource):
        def get(self):
            return {'success': 'true'}

    # Default error handler to propogate lower level errors up to the API level
    @api.errorhandler
    def default_error_handler(error):
        _, value, traceback = sys.exc_info()
        return json.loads({"error": str(traceback)})
