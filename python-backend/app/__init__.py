from datetime import datetime
import random
import sys

import click
from flask import Flask
from flask_cors import CORS
from flask_restplus import Api, Resource
import names
from sqlalchemy.exc import DBAPIError

from .api.constants import PERMIT_STATUS_CODE, MINE_OPERATION_STATUS, MINE_OPERATION_STATUS_REASON, MINE_OPERATION_STATUS_SUB_REASON
from .api.location.models.location import MineLocation
from .api.mine.models.mines import MineIdentity, MineDetail, MineralTenureXref
from .api.party.models.party import Party, PartyTypeCode
from .api.permit.models.permit import Permit, PermitStatusCode
from .api.permittee.models.permittee import Permittee
from .api.status.models.status import MineOperationStatusCode, MineOperationStatusReasonCode, MineOperationStatusSubReasonCode
from .api.mine.resources.mine import Mine, MineListByName
from .api.status.resources.status import MineStatusResource
from .api.party.resources.party import ManagerResource, PartyResource
from .api.location.resources.location import MineLocationResource
from .api.permit.resources.permit import PermitResource
from .api.permittee.resources.permittee import PermitteeResource
from .api.utils.random import generate_mine_no, generate_mine_name, random_geo, random_key_gen
from .config import Config
from .extensions import db, jwt


def create_app(test_config=None):
    """Create and configure an instance of the Flask application."""
    app = Flask(__name__)
    api = Api(app, prefix=Config.BASE_PATH)

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
    api.add_resource(Mine, '/mines', '/mines/<string:mine_no>')
    api.add_resource(MineLocationResource, '/mines/location', '/mines/location/<string:mine_location_guid>')
    api.add_resource(MineListByName, '/mines/names')
    api.add_resource(MineStatusResource, '/mines/status', '/mines/status/<string:mine_status_guid>')
    api.add_resource(PartyResource, '/parties', '/parties/<string:party_guid>')
    api.add_resource(ManagerResource, '/managers', '/managers/<string:mgr_appointment_guid>')
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
    DUMMY_USER_KWARGS = {'create_user': 'DummyUser', 'update_user': 'DummyUser'}

    def create_multiple_mine_tenure(num, mine_identity):
        for _ in range(num):
            MineralTenureXref.create_mine_tenure(mine_identity, random_key_gen(key_length=7, letters=False), DUMMY_USER_KWARGS)

    def create_multiple_permit_permittees(num, mine_identity, party, prev_party_guid):
        for _ in range(num):
            random_year = random.randint(1970, 2017)
            random_month = random.randint(1, 12)
            random_day = random.randint(1, 28)
            random_date = datetime(random_year, random_month, random_day)
            mine_permit = Permit.create_mine_permit(mine_identity, random_key_gen(key_length=12), random.choice(PERMIT_STATUS_CODE['choices']), random_date, DUMMY_USER_KWARGS)
            permittee_party = random.choice([party.party_guid, prev_party_guid]) if prev_party_guid else party.party_guid
            Permittee.create_mine_permittee(mine_permit, permittee_party, random_date, DUMMY_USER_KWARGS)

    # in terminal you can run $flask <cmd> <arg>
    @app.cli.command()
    @click.argument('num')
    def create_data(num):
        party = None
        for _ in range(int(num)):
            # Ability to add previous party to have multiple permittee
            prev_party_guid = party.party_guid if party else None
            mine_identity = MineIdentity.create_mine_identity(DUMMY_USER_KWARGS)
            MineDetail.create_mine_detail(mine_identity, generate_mine_no(), generate_mine_name(), DUMMY_USER_KWARGS)
            MineLocation.create_mine_location(mine_identity, random_geo(), DUMMY_USER_KWARGS)
            party = Party.create_party(names.get_first_name(), names.get_last_name(), DUMMY_USER_KWARGS)

            create_multiple_mine_tenure(random.randint(0, 4), mine_identity)
            create_multiple_permit_permittees(random.randint(0, 6), mine_identity, party, prev_party_guid)

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
        # Reseed Mandatory Data
        PermitStatusCode.create_mine_permit_status_code('O', 'Open permit', 10, DUMMY_USER_KWARGS)
        PermitStatusCode.create_mine_permit_status_code('C', 'Closed permit', 20, DUMMY_USER_KWARGS)
        PartyTypeCode.create_party_type_code('PER', 'Person', 10, DUMMY_USER_KWARGS)
        PartyTypeCode.create_party_type_code('ORG', 'Organzation', 20, DUMMY_USER_KWARGS)

        for k, v in MINE_OPERATION_STATUS.items():
            MineOperationStatusCode.create_mine_operation_status_code(v['value'], v['label'], 1, DUMMY_USER_KWARGS)

        for k, v in MINE_OPERATION_STATUS_REASON.items():
            MineOperationStatusReasonCode.create_mine_operation_status_reason_code(v['value'], v['label'], 1, DUMMY_USER_KWARGS)

        for k, v in MINE_OPERATION_STATUS_SUB_REASON.items():
            MineOperationStatusSubReasonCode.create_mine_operation_status_sub_reason_code(v['value'], v['label'], 1, DUMMY_USER_KWARGS)

        try:
            db.session.commit()
            click.echo(f'Database has been cleared.')
        except DBAPIError:
            db.session.rollback()
            click.echo(f'Error, failed on commit.')
            raise
