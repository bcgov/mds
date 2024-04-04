import click
import psycopg2

from sqlalchemy.exc import DBAPIError
from multiprocessing.dummy import Pool as ThreadPool
from flask import current_app

from app.api.utils.include.user_info import User
from app.extensions import db

from app.api.verifiable_credentials.models.credentials import PartyVerifiableCredentialMinesActPermit
from app.api.mines.permits.permit.models.permit import Permit

from tests.factories import MineFactory, MinePartyAppointmentFactory, MinespaceSubscriptionFactory, MinespaceUserFactory, NOWSubmissionFactory, NOWApplicationIdentityFactory


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

        _create_cypress_data()

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

    def _create_cypress_data():
        User._test_mode = True

        with app.app_context():
            # Set up data to be used in cypress tests

            ## Ensure there is at least one major mine
            mine = MineFactory(
                major_mine_ind=True,
                mine_name='Evergreen Cypress Mine'
            ) 

            ## Create a minespace user with data corresponding to 
            ## the Cypress test user (cypress/keycloak-users.json)
            minespace_user = MinespaceUserFactory(
                email_or_username='cypress@bceid',
                keycloak_guid='a28dfc3a-5e5c-4501-ab2f-399d8e64f2c8'
            )

            ## Subscribe the minespace user to a mine so we have a mine to test with
            ## for Minespace cypress tests
            MinespaceSubscriptionFactory(mine=mine, minespace_user=minespace_user)

            try:
                db.session.commit()
                print(f'Created Data used for cypress testing.')
            except DBAPIError:
                print(f'Failed to create data used for cypress testing.')
                db.session.rollback()
                raise


    def _create_data(num):

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

    @app.cli.command('notify_expiring_party_appointments')
    def notify_expiring_party_appointments():
        from app.api.parties.party_appt import notify_expiring_party_appointments
        from app import auth
        auth.apply_security = False

        with current_app.app_context():
            notify_expiring_party_appointments()

    @app.cli.command('notify_and_update_expired_party_appointments')
    def notify_and_update_expired_party_appointments():
        from app.api.parties.party_appt import notify_and_update_expired_party_appointments
        from app import auth
        auth.apply_security = False

        with current_app.app_context():
            notify_and_update_expired_party_appointments()

    @app.cli.command('revoke_mines_act_permit_vc_and_offer_newest')
    def revoke_mines_act_permit_vc_and_offer_newest(credential_exchange_id, permit_guid):
        from app.api.verifiable_credentials.manager import VerifiableCredentialManager
        from app import auth
        auth.apply_security = False

        with current_app.app_context():
            cred_exch = PartyVerifiableCredentialMinesActPermit.find_by_cred_exch_id(credential_exchange_id)
            permit = Permit.find_by_mine_guid(permit_guid)
            assert cred_exch and permit, "Invalid credential exchange or permit guid"
            VerifiableCredentialManager.revoke_credential_and_offer_newest_amendment(cred_exch,permit.permit_guid)
