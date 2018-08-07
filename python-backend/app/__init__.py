import os

from flask import Flask
from flask_cors import CORS
from flask_restplus import Api, Resource
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine
from .mines.resources.mine import Mine, MineList

DB_HOST = os.environ['DB_HOST']
DB_USER = os.environ['DB_USER']
DB_PASS = os.environ['DB_PASS']
DB_PORT = os.environ['DB_PORT']
DB_NAME = os.environ['DB_NAME']
DB_URL = "postgresql://{0}:{1}@{2}:{3}/{4}".format(DB_USER, DB_PASS, DB_HOST, DB_PORT, DB_NAME)

def create_app(test_config=None):
    """Create and configure an instance of the Flask application."""
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        # a default secret that should be overridden by instance config
        SECRET_KEY='dev',
        # store the database in the instance folder
        DATABASE=os.path.join(app.instance_path, 'flaskr.sqlite'),
    )

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.update(test_config)

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    @app.route('/hello')
    def hello():
        return 'Hello, World!'

    # register the database commands
    from .db import db
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SQLALCHEMY_DATABASE_URI'] = DB_URL
    db.init_app(app)

    api = Api(app)
    cors = CORS(app)

    app.add_url_rule('/', endpoint='index')

    api.add_resource(Mine, '/mine')
    api.add_resource(MineList, '/mines')
    return app
