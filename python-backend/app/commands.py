from datetime import datetime
import random
from concurrent.futures import ThreadPoolExecutor, as_completed

import click
import names
from sqlalchemy.exc import DBAPIError

from .api.constants import PERMIT_STATUS_CODE, MINE_OPERATION_STATUS, MINE_OPERATION_STATUS_REASON, MINE_OPERATION_STATUS_SUB_REASON
from .api.mines.location.models.location import MineLocation
from .api.mines.mine.models.mine import MineIdentity, MineDetail, MineralTenureXref
from .api.parties.party.models.party import Party, PartyTypeCode
from .api.permits.permit.models.permit import Permit, PermitStatusCode
from .api.permits.permittee.models.permittee import Permittee
from .api.mines.status.models.status import MineOperationStatusCode, MineOperationStatusReasonCode, MineOperationStatusSubReasonCode
from .api.utils.random import generate_mine_no, generate_mine_name, random_geo, random_key_gen

from .extensions import db


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
    @click.argument('threading', default=True)
    def create_data(num, threading):
        """
        Creates dummy data in the database. If threading=True
        Use Threading and multiprocessing to create records in chunks of 100.

        :param num: number of records create
        :param threading: use threading or not
        :return: None
        """
        if threading:
            with ThreadPoolExecutor() as executor:
                num = int(num)
                number_batches = []
                if(num >= 100):
                    number_batches = [100 for _ in range(100, num, 100)]
                number_batches.append(num % 100) if num % 100 is not 0 else None

                task_list = []
                for batch in number_batches:
                    task_list.append(executor.submit(_create_data, batch))
                for task in as_completed(task_list):
                    try:
                        data = task.result()
                    except Exception as exc:
                        print(f'generated an exception: {exc}')
        else:
            _create_data(num)

    def _create_data(num):
        with app.app_context():
            party = None
            for _ in range(int(num)):
                # Ability to add previous party to have multiple permittee
                prev_party_guid = party.party_guid if party else None
                mine_identity = MineIdentity.create_mine_identity(DUMMY_USER_KWARGS)
                MineDetail.create_mine_detail(mine_identity, generate_mine_no(), generate_mine_name(),
                                              DUMMY_USER_KWARGS)
                MineLocation.create_mine_location(mine_identity, random_geo(), DUMMY_USER_KWARGS)
                party = Party.create_party(names.get_first_name(), names.get_last_name(), DUMMY_USER_KWARGS)

                create_multiple_mine_tenure(random.randint(0, 4), mine_identity)
                create_multiple_permit_permittees(random.randint(0, 6), mine_identity, party, prev_party_guid)

            try:
                db.session.commit()
                print(f'Created {num} random mines with tenure, permits, and permittee.')
            except DBAPIError:
                db.session.rollback()
                raise

    @app.cli.command()
    def delete_data():
        meta = db.metadata
        for table in reversed(meta.sorted_tables):
            if 'view' in table.name:
                continue
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
