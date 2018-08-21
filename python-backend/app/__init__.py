import sys

from flask import Flask
from flask_cors import CORS
from flask_restplus import Api
from .mines.resources.mine import Mine, MineList
from .mines.resources.person import ManagerResource, PersonResource, PersonList
from .config import Config

from .extensions import db, jwt


def create_app(test_config=None):
    """Create and configure an instance of the Flask application."""
    app = Flask(__name__)
    api = Api(app)

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_object(Config)
    else:
        # load the test config if passed in
        app.config.from_object(test_config)

    register_extensions(app)
    register_routes(app, api)

    return app


def register_extensions(app):
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SQLALCHEMY_DATABASE_URI'] = app.config['DB_URL']
    db.init_app(app)

    app.config['JWT_ROLE_CALLBACK'] = lambda jwt_dict: (jwt_dict['realm_access']['roles'])
    jwt.init_app(app)

    CORS(app)

    return None


def register_routes(app, api):
    # Set URL rules for resources
    app.add_url_rule('/', endpoint='index')

    # Set Routes for each resource
    api.add_resource(Mine, '/mine', '/mine/<string:mine_no>')
    api.add_resource(MineList, '/mines')
    api.add_resource(PersonResource, '/person', '/person/<string:person_guid>')
    api.add_resource(PersonList, '/persons')
    api.add_resource(ManagerResource, '/manager', '/manager/<string:mgr_appointment_guid>')

    # Default error handler to propogate lower level errors up to the API level
    @api.errorhandler
    def default_error_handler(error):
        _, value, traceback = sys.exc_info()
        raise value(None).with_traceback(traceback)
