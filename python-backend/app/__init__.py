from datetime import datetime
import random
import sys
import uuid

import click
from flask import Flask
from flask_cors import CORS
from flask_restplus import Api, Resource
from sqlalchemy.exc import DBAPIError

from .api.constants import PARTY_STATUS_CODE, PERMIT_STATUS_CODE
from .api.location.models.location import MineLocation
from .api.mine.models.mines import MineIdentity, MineDetail, MineralTenureXref
from .api.party.models.party import Party
from .api.permit.models.permit import Permit
from .api.permittee.models.permittee import Permittee
from .api.mine.resources.mine import Mine, MineList, MineListByName
from .api.party.resources.party import ManagerResource, PartyResource, PartyList, PartyListSearch
from .api.location.resources.location import MineLocationResource, MineLocationListResource
from .api.permit.resources.permit import PermitResource
from .api.permittee.resources.permittee import PermitteeResource
from .api.utils.random import generate_mine_no, generate_name, random_geo, random_key_gen
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
    api.add_resource(PartyResource, '/party', '/party/<string:party_guid>')
    api.add_resource(PartyList, '/parties')
    api.add_resource(PartyListSearch, '/parties/names')
    api.add_resource(ManagerResource, '/manager', '/manager/<string:mgr_appointment_guid>')
    api.add_resource(PermitResource, '/permits', '/permits/<string:permit_guid>')
    api.add_resource(PermitteeResource, '/permittees', '/permittees/<string:permittee_guid>')

    # Healthcheck endpoint
    @api.route('/health')
    class Healthcheck(Resource):
        def get(self):
            return {'success': 'true'}

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
        mine_identity_list = []
        mine_detail_list = []
        mine_location_list = []
        mine_permit_list = []
        mine_tenure_list = []
        mine_party_list = []
        mine_permittee_list = []
        party = None
        for i in range(int(num)):
            # Ability to add previous party to have multiple permittee
            prev_party_guid = party.party_guid if party else None
            random_location = random_geo()
            mine_identity = MineIdentity(mine_guid=uuid.uuid4(), **DUMMY_USER_KWARGS)
            mine_identity_list.append(mine_identity)

            mine_detail = MineDetail(
                mine_detail_guid=uuid.uuid4(),
                mine_guid=mine_identity.mine_guid,
                mine_no=generate_mine_no(),
                mine_name=generate_name(),
                **DUMMY_USER_KWARGS
            )
            mine_detail_list.append(mine_detail)

            mine_location = MineLocation(
                mine_location_guid=uuid.uuid4(),
                mine_guid=mine_identity.mine_guid,
                latitude=random_location.get('latitude', 0),
                longitude=random_location.get('longitude', 0),
                effective_date=datetime.today(),
                expiry_date=datetime.today(),
                **DUMMY_USER_KWARGS,
            )
            mine_location_list.append(mine_location)

            party = Party(
                party_guid=uuid.uuid4(),
                first_name=generate_name(),
                party_name=generate_name(),
                email=random_key_gen(key_length=8, numbers=False) + '@' + random_key_gen(key_length=8, numbers=False) + '.com',
                phone_no='123-123-1234',
                party_type_code=PARTY_STATUS_CODE['per'],
                **DUMMY_USER_KWARGS
            )
            mine_party_list.append(party)

            for random_tenure in range(random.randint(0, 4)):
                mine_tenure = MineralTenureXref(
                    mineral_tenure_xref_guid=uuid.uuid4(),
                    mine_guid=mine_identity.mine_guid,
                    tenure_number_id=random_key_gen(key_length=7, letters=False),
                    **DUMMY_USER_KWARGS,
                )
                mine_tenure_list.append(mine_tenure)

            for random_permit in range(random.randint(0, 6)):
                random_year = random.randint(1970, 2017)
                random_month = random.randint(1, 12)
                random_day = random.randint(1,28)
                random_date = datetime(random_year, random_month, random_day)
                mine_permit = Permit(
                    permit_guid=uuid.uuid4(),
                    mine_guid=mine_identity.mine_guid,
                    permit_no=random_key_gen(key_length=12),
                    permit_status_code=random.choice(PERMIT_STATUS_CODE['choices']),
                    issue_date=random_date,
                    **DUMMY_USER_KWARGS,
                )
                mine_permit_list.append(mine_permit)
                permittee_party = random.choice([party.party_guid, prev_party_guid]) if prev_party_guid else party.party_guid
                mine_permittee = Permittee(
                    permittee_guid=uuid.uuid4(),
                    permit_guid=mine_permit.permit_guid,
                    party_guid=permittee_party,
                    effective_date=random_date,
                    **DUMMY_USER_KWARGS
                )
                mine_permittee_list.append(mine_permittee)

        db.session.bulk_save_objects(mine_identity_list)
        db.session.bulk_save_objects(mine_detail_list)
        db.session.bulk_save_objects(mine_location_list)
        db.session.bulk_save_objects(mine_permit_list)
        db.session.bulk_save_objects(mine_tenure_list)
        db.session.bulk_save_objects(mine_party_list)
        db.session.bulk_save_objects(mine_permittee_list)

        try:
            db.session.commit()
            click.echo(f'Created {num} random mines with tenure, permits, and permittee.')
        except DBAPIError:
            db.session.rollback()
            click.echo(f'Error, failed on commit.')
            raise

    @app.cli.command()
    def delete_data():
        meta = db.metadata
        for table in reversed(meta.sorted_tables):
            db.session.execute(table.delete())
        try:
            db.session.commit()
            click.echo(f'Database has been cleared.')
        except DBAPIError:
            db.session.rollback()
            click.echo(f'Error, failed on commit.')
            raise
