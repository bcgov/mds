import click
import psycopg2

from sqlalchemy.exc import DBAPIError
from multiprocessing.dummy import Pool as ThreadPool
from flask import current_app

from app.api.utils.include.user_info import User
from app.extensions import db

from tests.factories import MineFactory, MinePartyAppointmentFactory, NOWSubmissionFactory, NOWApplicationIdentityFactory


def register_commands(app):
    @app.cli.command()
    def import_idir():
        from app.cli_jobs.IDIR_jobs import import_empr_idir_users
        import_empr_idir_users()

    @app.cli.command()
    def test_nris_api():
        from app.api.services.NRIS_API_service import _get_NRIS_data_by_mine
        print(_get_NRIS_data_by_mine("", "0100287"))

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
                MinePartyAppointmentFactory(mine=mine, mine_party_appt_type_code='EOR')
                MinePartyAppointmentFactory(mine=mine, mine_party_appt_type_code='MMG')
                if len(mine.mine_permit) > 0:
                    MinePartyAppointmentFactory(permittee=True, party__company=True, mine=mine)
                NOWApplicationIdentityFactory(mine=mine)
            try:
                db.session.commit()
                print(f'Created {num} random mines with related data.')
            except DBAPIError:
                db.session.rollback()
                raise

    @app.cli.command()
    def run_etl():
        from app.cli_jobs import ETL_jobs
        ETL_jobs.run_ETL()

    @app.cli.command()
    def run_address_etl():
        from app.cli_jobs import ETL_jobs
        ETL_jobs.run_address_etl()

    @app.cli.command()
    def notify_expiring_party_appointments():
        from app.api.parties.party_appt.party_appt_jobs import PartyAppointmentJobs
        from app import auth
        auth.apply_security = False


        PartyAppointmentJobs().notify_expiring_party_appointments()

    @app.cli.command()
    def notify_and_update_expired_party_appointments():
        from app.api.parties.party_appt.party_appt_jobs import PartyAppointmentJobs
        from app import auth
        auth.apply_security = False

        PartyAppointmentJobs().notify_and_update_expired_party_appointments()
