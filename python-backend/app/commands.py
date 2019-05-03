import random
import click
import names

from concurrent.futures import ThreadPoolExecutor, as_completed
from sqlalchemy.exc import DBAPIError
from multiprocessing.dummy import Pool as ThreadPool

from app import auth
from app.api.utils.include.user_info import User
from app.api.mines.region.models.region import MineRegionCode
from app.api.constants import (PERMIT_STATUS_CODE, MINE_OPERATION_STATUS,
                               MINE_OPERATION_STATUS_REASON, MINE_OPERATION_STATUS_SUB_REASON,
                               MINE_REGION_OPTIONS)
from app.api.mines.mine.models.mine import Mine
from app.api.mines.mine.models.mineral_tenure_xref import MineralTenureXref
from app.api.mines.mine.models.mine_tenure_type_code import MineTenureTypeCode
from app.api.parties.party.models.party import Party
from app.api.parties.party.models.party_type_code import PartyTypeCode
from app.api.permits.permit.models.permit import Permit
from app.api.mines.mine.models.mine_verified_status import MineVerifiedStatus
from app.api.utils.random import generate_mine_no, generate_mine_name, random_geo, random_key_gen, random_date, random_region, random_mine_category
from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointment
from app.extensions import db, sched
from app.scheduled_jobs import NRIS_jobs
from app.scheduled_jobs import ETL_jobs

from tests.factories import MineFactory, MinePartyAppointmentFactory


def register_commands(app):
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
            batch_size = 25
            num = int(num)

            # Break num into a list of ints of size batch_size, then append remainder.
            # E.g. 520 -> [100, 100, 100, 100, 100, 20]
            full_batches = int(num / batch_size)
            batches = [batch_size] * full_batches
            if 0 < num % batch_size:
                batches.append(num % batch_size)

            pool = ThreadPool(processes=16)
            results = pool.map(_create_data, batches)
            pool.close()
        else:
            _create_data(num)

    def _create_data(num):
        User._test_mode = True
        with app.app_context():
            for _ in range(int(num)):
                mine = MineFactory()
                eor = MinePartyAppointmentFactory(mine=mine, mine_party_appt_type_code='EOR')
                mine_manager = MinePartyAppointmentFactory(
                    mine=mine, mine_party_appt_type_code='MMG')
                permitee = MinePartyAppointmentFactory(
                    mine=mine, mine_party_appt_type_code='PMT', party__company=True)
            try:
                db.session.commit()
                print(f'Created {num} random mines with related data.')
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

        @sched.app.cli.command()
        def _run_etl():
            with sched.app.app_context():
                print('starting the ETL.')
                ETL_jobs._run_ETL()
                print('Completed running the ETL.')
