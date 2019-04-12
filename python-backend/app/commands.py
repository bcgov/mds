import random
from concurrent.futures import ThreadPoolExecutor, as_completed

import click
import names
from sqlalchemy.exc import DBAPIError

from .api.mines.location.models.mine_location import MineLocation
from .api.mines.region.models.region import MineRegionCode
from .api.mines.mine.models.mine_type import MineType
from .api.constants import (PERMIT_STATUS_CODE, MINE_OPERATION_STATUS, MINE_OPERATION_STATUS_REASON,
                            MINE_OPERATION_STATUS_SUB_REASON, MINE_REGION_OPTIONS)
from .api.mines.mine.models.mine import Mine
from .api.mines.mine.models.mineral_tenure_xref import MineralTenureXref
from .api.mines.mine.models.mine_tenure_type_code import MineTenureTypeCode
from .api.parties.party.models.party import Party
from .api.parties.party.models.party_type_code import PartyTypeCode
from .api.permits.permit.models.permit import Permit
from .api.mines.mine.models.mine_verified_status import MineVerifiedStatus
from .api.utils.random import generate_mine_no, generate_mine_name, random_geo, random_key_gen, random_date, random_region, random_mine_category
from .api.parties.party_appt.models.mine_party_appt import MinePartyAppointment
from .extensions import db, sched
from .scheduled_jobs import NRIS_jobs
from .scheduled_jobs import ETL_jobs
from app import auth

from tests.factories import MineIncidentFactory

from app.api.utils.include.user_info import User


def register_commands(app):
    DUMMY_USER_KWARGS = {'create_user': 'DummyUser', 'update_user': 'DummyUser'}

    def create_multiple_mine_tenure(num, mine):
        for _ in range(num):
            MineralTenureXref.create_mine_tenure(mine, random_key_gen(key_length=7, letters=False),
                                                 DUMMY_USER_KWARGS)

    def create_multiple_permit_permittees(num, mine, party, prev_party_guid):
        for _ in range(num):
            mine_permit = Permit.create(mine.mine_guid, random_key_gen(key_length=12),
                                        random.choice(PERMIT_STATUS_CODE['choices']))

            permittee_party = random.choice([party.party_guid, prev_party_guid
                                             ]) if prev_party_guid else party.party_guid

            db.session.commit()
            # raise Exception(str(mine_permit.permit_guid) + str(mine_permit.mine_guid))
            mpa = MinePartyAppointment.create(
                mine_guid=mine_permit.mine_guid,
                party_guid=permittee_party,
                permit_guid=mine_permit.permit_guid,
                mine_party_appt_type_code='PMT',
                start_date=None,
                end_date=None,
                processed_by=DUMMY_USER_KWARGS.get('update_user'),
                save=True)

    # in terminal you can run $flask <cmd> <arg>

    @app.cli.command()
    def import_idir():
        from app.scheduled_jobs.IDIR_jobs import _import_empr_idir_users
        _import_empr_idir_users()

    @app.cli.command()
    @click.argument('num')
    @click.argument('threading', default=True)
    def create_data(num, threading):
        from . import auth
        """
        Creates dummy data in the database. If threading=True
        Use Threading and multiprocessing to create records in chunks of 100.

        :param num: number of records create
        :param threading: use threading or not
        :return: None
        """
        User._test_mode = True

        if threading:
            with ThreadPoolExecutor() as executor:
                batch_size = 100
                num = int(num)

                # Break num into a list of ints of size batch_size, then append remainder.
                # E.g. 520 -> [100, 100, 100, 100, 100, 20]
                full_batches = int(num / batch_size)
                batches = [batch_size] * full_batches
                if 0 < num % batch_size:
                    batches.append(num % batch_size)

                task_list = []
                for batch in batches:
                    task_list.append(executor.submit(_create_data, batch))
                for task in as_completed(task_list):
                    try:
                        data = task.result()
                    except Exception as exc:
                        print(f'generated an exception: {exc}')
        else:
            _create_data(num)

    def _create_data(num):
        User._test_mode = True
        with app.app_context():
            party = None
            mine_tenure_type_codes = list(
                map(lambda x: x['value'], MineTenureTypeCode.all_options()))
            for _ in range(int(num)):
                # Ability to add previous party to have multiple permittee
                prev_party_guid = party.party_guid if party else None
                mine = Mine.create_mine(generate_mine_no(), generate_mine_name(),
                                        random_mine_category(), random_region(), DUMMY_USER_KWARGS)
                MineType.create_mine_type(mine.mine_guid, random.choice(mine_tenure_type_codes))
                MineLocation.create_mine_location(mine, random_geo(), DUMMY_USER_KWARGS)
                if random.choice([True, False]):
                    mine.verified_status = MineVerifiedStatus(
                        healthy_ind=random.choice([True, False]))
                first_name = names.get_first_name()
                last_name = names.get_last_name()
                email = f'{first_name.lower()}.{last_name.lower()}@{last_name.lower()}.com'
                party = Party.create(
                    last_name, '123-123-1234', 'PER', first_name=first_name, email=email)
                db.session.commit()
                create_multiple_mine_tenure(random.randint(0, 4), mine)
                create_multiple_permit_permittees(
                    random.randint(0, 6), mine, party, prev_party_guid)
                MineIncidentFactory(mine_guid=mine.mine_guid)

            try:
                db.session.commit()
                print(f'Created {num} random mines with tenure, permits, and permittee.')
            except DBAPIError:
                db.session.rollback()
                raise

    if app.config.get('ENVIRONMENT_NAME') in ['test', 'prod']:

        @sched.app.cli.command()
        def _run_nris_jobs():
            with sched.app.app_context():
                print('Started NRIS job to cache Major Mines list.')
                NRIS_jobs._cache_major_mines_list()
                print('Completed caching the Major Mines list.')
                print('Caching all NRIS data for Major Mines')
                NRIS_jobs._cache_all_NRIS_major_mines_data()
                print('Done!')

        #This is here to prevent this from running in production until we are confident in the permit data.
        if app.config.get('ENVIRONMENT_NAME') == 'test':

            @sched.app.cli.command()
            def _run_etl():
                with sched.app.app_context():
                    print('starting the ETL.')
                    ETL_jobs._run_ETL()
                    print('Completed running the ETL.')
