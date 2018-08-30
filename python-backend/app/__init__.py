from datetime import datetime
import sys
import uuid

import click
from flask import Flask
from flask_cors import CORS
from flask_restplus import Api
from .mines.models.mines import MineIdentity, MineDetail
from .mines.models.location import MineLocation
from .mines.resources.mine import Mine, MineList, MineListByName
from .mines.resources.person import ManagerResource, PersonResource, PersonList
from .mines.resources.location import MineLocationResource, MineLocationListResource
from .mines.utils.random import generate_mine_no, generate_name, random_geo
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
    register_commands(app)
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
    api.add_resource(MineLocationResource, '/mine/location', '/mine/location/<string:mine_location_guid>')
    api.add_resource(MineList, '/mines')
    api.add_resource(MineListByName, '/mines/names')
    api.add_resource(MineLocationListResource, '/mines/location')
    api.add_resource(PersonResource, '/person', '/person/<string:person_guid>')
    api.add_resource(PersonList, '/persons')
    api.add_resource(ManagerResource, '/manager', '/manager/<string:mgr_appointment_guid>')

    # Default error handler to propogate lower level errors up to the API level
    @api.errorhandler
    def default_error_handler(error):
        _, value, traceback = sys.exc_info()
        raise value(None).with_traceback(traceback)


def register_commands(app):
    # in terminal you can run $flask <cmd> <arg>
    @app.cli.command()
    @click.argument('num')
    def create_data(num):
        DUMMY_USER_KWARGS = {'create_user': 'DummyUser', 'update_user': 'DummyUser'}
        for i in range(int(num)):
            random_location = random_geo()
            mine_identity = MineIdentity(mine_guid=uuid.uuid4(), **DUMMY_USER_KWARGS)
            mine_detail = MineDetail(
                mine_detail_guid=uuid.uuid4(),
                mine_guid=mine_identity.mine_guid,
                mine_no=generate_mine_no(),
                mine_name=generate_name(),
                **DUMMY_USER_KWARGS
            )
            mine_location = MineLocation(
                mine_location_guid=uuid.uuid4(),
                mine_guid=mine_identity.mine_guid,
                latitude=random_location.get('latitude', 0),
                longitude=random_location.get('longitude', 0),
                effective_date=datetime.today(),
                expiry_date=datetime.today(),
                **DUMMY_USER_KWARGS,
            )
            mine_identity.save()
            mine_detail.save()
            mine_location.save()

    @app.cli.command()
    def delete_data():
        meta = db.metadata
        for table in reversed(meta.sorted_tables):
            db.session.execute(table.delete())
        db.session.commit()
