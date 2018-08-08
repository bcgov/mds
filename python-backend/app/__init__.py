import os

from flask import Flask
from flask_cors import CORS
from flask_restplus import Api, Resource
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine
from .mines.resources.mine import Mine, MineList
from .config import Config


def create_app(test_config=None):
    """Create and configure an instance of the Flask application."""
    app = Flask(__name__)

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_object(Config)
    else:
        # load the test config if passed in
        app.config.update(test_config)

    @app.route('/hello')
    def hello():
        return 'Hello, World!'

    # register the database commands
    from .db import db
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SQLALCHEMY_DATABASE_URI'] = app.config['DB_URL']
    db.init_app(app)

    api = Api(app)
    cors = CORS(app)

    app.add_url_rule('/', endpoint='index')

    api.add_resource(Mine, '/mine/<string:mine_no>')
    api.add_resource(MineList, '/mines')
    return app
