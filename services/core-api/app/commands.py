from multiprocessing.dummy import Pool as ThreadPool

import click
from app.api.mines.permits.permit.models.permit import Permit
from app.api.utils.include.user_info import User
from app.config import Config
from app.extensions import db
from flask import current_app
from sqlalchemy.exc import DBAPIError
from tests.factories import (
    MineFactory,
    MinePartyAppointmentFactory,
    MinespaceSubscriptionFactory,
    MinespaceUserFactory,
    NOWApplicationIdentityFactory,
)
from app.api.mines.mine.models.mine import Mine
from app.api.users.minespace.models.minespace_user import MinespaceUser
from .cli_commands.generate_history_table_migration import (
    generate_history_table_migration,
    generate_table_migration,
)


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
            mine = MineFactory(major_mine_ind=True, mine_name='Evergreen Cypress Mine')

            ## Create a minespace user with data corresponding to
            ## the Cypress test user (cypress/keycloak-users.json)
            minespace_user = MinespaceUserFactory(
                email_or_username='cypress@bceid',
                keycloak_guid='a28dfc3a-5e5c-4501-ab2f-399d8e64f2c8')

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
        from app import auth
        from app.api.parties.party_appt import notify_expiring_party_appointments
        auth.apply_security = False

        with current_app.app_context():
            notify_expiring_party_appointments()

    @app.cli.command('notify_and_update_expired_party_appointments')
    def notify_and_update_expired_party_appointments():
        from app import auth
        from app.api.parties.party_appt import (
            notify_and_update_expired_party_appointments,
        )
        auth.apply_security = False

        with current_app.app_context():
            notify_and_update_expired_party_appointments()

    @app.cli.command('revoke_mines_act_permit_vc_and_offer_newest')
    @click.argument('credential_exchange_id')
    @click.argument('permit_guid')
    def revoke_mines_act_permits_for_permit(credential_exchange_id, permit_guid):
        from app import auth
        from app.api.verifiable_credentials.manager import (
            revoke_all_credentials_for_permit,
        )
        auth.apply_security = False
        with current_app.app_context():
            permit = Permit.query.unbound_unsafe().filter_by(permit_guid=permit_guid).first()
            assert permit, "Permit not found"
            revoke_all_credentials_for_permit.apply_async(kwargs={"permit_guid": permit_guid})
            print("celery job started")

    @app.cli.command('process_all_untp_map_for_orgbook')
    def process_all_untp_map_for_orgbook():
        from app import auth
        from app.api.verifiable_credentials.manager import (
            process_all_untp_map_for_orgbook,
        )
        auth.apply_security = False
        with current_app.app_context() as app:
            result = process_all_untp_map_for_orgbook.apply_async()
            print("celery job started: forward_all_pending_untp_vc_to_orgbook")

    @app.cli.command('forward_all_pending_untp_vc_to_orgbook')
    def forward_all_pending_untp_vc_to_orgbook():
        from app import auth
        from app.api.verifiable_credentials.manager import (
            forward_all_pending_untp_vc_to_orgbook,
        )
        auth.apply_security = False
        with current_app.app_context():
            result = forward_all_pending_untp_vc_to_orgbook.apply_async()
            print("celery job started: forward_all_pending_untp_vc_to_orgbook")

    @app.cli.command('push_untp_map_data_to_publisher')
    def push_untp_map_data_to_publisher():
        from app import auth
        from app.api.verifiable_credentials.manager import (
            push_untp_map_data_to_publisher,
        )
        auth.apply_security = False
        with current_app.app_context():
            result = push_untp_map_data_to_publisher.apply_async()
            print("celery job started: push_untp_map_data_to_publisher")

    @app.cli.command('cleanup_untp_map_data_failures')
    @click.argument('live', required=False, default=False)
    def cleanup_untp_map_data_failures(live: bool = False):
        from app import auth
        from app.api.verifiable_credentials.manager import VerifiableCredentialManager
        auth.apply_security = False
        with current_app.app_context():
            if not live:
                print(f"dry run, add `true` as first argument to actually delete")
            result = VerifiableCredentialManager.delete_any_unsuccessful_untp_push(live)

            if not live:
                print(f"dry run, add `true` as first argument to actually delete")
                print(f"delete_any_unsuccessful_untp_push finished: would delete {result} records")
            else:
                print(f"delete_any_unsuccessful_untp_push complete: delete_count={result}")

    @app.cli.command('generate_history_table_migration')
    @click.argument('table')
    def do_generate_history_table_command(table):
        """
        Generate a migration file that contains the history table definition for the specified table.
        Uses SQLAlchemy-continuum to generate the history table definition.

        Example usage:
            flask generate_history_table_migration mine_tailings_storage_facility
        """
        generate_history_table_migration(table)

    @app.cli.command('generate_table_migration')
    @click.argument('table')
    def do_generate_table_command(table):
        """
        Generate a migration file that contains the table definition for the specified table.
        Uses SQLAlchemy-continuum to generate the table definition.

        Example usage:
            flask generate_table_migration mine_tailings_storage_facility
        """
        generate_table_migration(table)

    @app.cli.command('seed_user_data')
    @click.argument('user_name')
    @click.argument('is_idir', default=True)
    def do_seed_user_data(user_name, is_idir):
        """
        Creates subscriptions for MS/Core users
        - first 5 (alphabetical) major mines
        - last 5 regional mines
        - uses MS user if they already exist, or else creates a new one
        - core user isn't a foreign key so no user created/queried

        Example usage:
            flask seed_user_data myidir true
            flask seed_user_data mybceid false    
        """
        _seed_user_data(user_name, is_idir)

    def _seed_user_data(user_name, is_idir):
        major_mine_count = 5
        regional_mine_count = 5        

        full_user_name = f'idir\\{user_name}' if is_idir else f'{user_name}@bceid'
        print(f'Seeding user data for {full_user_name}')

        with app.app_context():
            major_mines = db.session.query(Mine).filter_by(major_mine_ind=True).order_by(Mine.mine_name).limit(major_mine_count)
            regional_mines = db.session.query(Mine).filter_by(major_mine_ind=False).order_by(Mine.mine_name.desc()).limit(regional_mine_count)
            all_mines = list(major_mines) + list(regional_mines)

            if is_idir:
                from app.api.mines.subscription.models.subscription import Subscription
                existing_subscriptions = Subscription.query.filter_by(user_name=full_user_name).all()
                subscribed_mine_guids = [s.mine_guid for s in existing_subscriptions]
                for mine in all_mines:
                    if mine.mine_guid in subscribed_mine_guids:
                        print(f'Skipping already subscribed mine. Username: {full_user_name}, Mine: {mine.mine_name}')
                    else:
                        print(f'Creating mine subscription. Username: {full_user_name}, Mine: {mine.mine_name}')
                        subscription = Subscription(mine_guid=mine.mine_guid, user_name=full_user_name)
                        db.session.add(subscription)                    
            else:
                minespace_user = MinespaceUser.find_by_email(full_user_name)
                subscribed_mine_guids = []
                if not minespace_user:
                    minespace_user = MinespaceUserFactory(
                        email_or_username=full_user_name,
                        keycloak_guid='b28dfc3a-5e5c-4501-ab2f-399d8e64f2c8')
                else:
                    from app.api.users.minespace.models.minespace_user_mine import MinespaceUserMine
                    existing_subscriptions = MinespaceUserMine.query.filter_by(user_id=minespace_user.user_id).all()
                    subscribed_mine_guids = [s.mine_guid for s in existing_subscriptions]
                for mine in all_mines:
                    if mine.mine_guid in subscribed_mine_guids:
                        print(f'Skipping already subscribed mine. Username: {full_user_name}, Mine: {mine.mine_name}')
                    else:
                        print(f'Creating mine subscription. Username: {full_user_name}, Mine: {mine.mine_name}')
                        MinespaceSubscriptionFactory(mine=mine, minespace_user=minespace_user)                        

            try:
                db.session.commit()
                print(f'Successfully created user access data for {full_user_name}.')
            except DBAPIError:
                print(f'Failed to create user access data for {user_name}.')
                db.session.rollback()
                raise
                
                

    @app.cli.command('export_permit_conditions')
    @click.argument('permit_amendment_guid')
    def export_permit_conditions(permit_amendment_guid):
        from app import auth
        auth.apply_security = False
        with current_app.app_context():
            from .cli_commands.export_permit_conditions import export_permit_conditions
            export_permit_conditions(permit_amendment_guid)

    @app.cli.command('prepare_permit_data')
    @click.argument('csv_path', type=click.Path(exists=True))
    @click.option('--token', help='Authentication token (optional)', default=None)
    def do_prepare_permit_data(csv_path, token):
        """
        Import permit data from CSV file and create/update mines, permits and amendments.
        
        Example usage:
            flask prepare_permit_data path/to/permits.csv
            flask prepare_permit_data path/to/permits.csv --token=your_auth_token
        """
        from app import auth
        from app.cli_commands.prepare_data import prepare_permit_data
        from flask import current_app
        

        auth.apply_security = False
        
        with current_app.app_context():
            if Config.ENVIRONMENT_NAME not in ['local', 'dev', 'test']:
                click.echo("This command is only available in local, dev and test environments.", err=True)
                return

            try:
                prepare_permit_data(csv_path, token)
            except Exception as e:
                click.echo(f"Error: {e}", err=True)
                return

    @app.cli.command('bulk_permit_extraction')
    @click.argument('csv_path', type=click.Path(exists=True))
    def bulk_permit_extraction(csv_path):
        """
        Trigger permit condition extraction for multiple documents from a CSV file.
        CSV should have columns: permit_amendment_guid,document_manager_guid
        
        Example usage:
            flask bulk_permit_extraction path/to/extractions.csv
        """
        import csv

        from app import auth
        from app.api.mines.permits.permit_extraction.tasks import (
            initialize_single_permit_extraction,
        )

        auth.apply_security = False
        
        with current_app.app_context():
            with open(csv_path, 'r') as file:
                reader = csv.DictReader(file)
                task_count = 0
                error_count = 0
                
                for row in reader:
                    try:
                        permit_amendment_guid = row['permit_amendment_guid']
                        document_manager_guid = row['document_manager_guid']
                        
                        # Queue initialization task
                        initialize_single_permit_extraction.delay(document_manager_guid, permit_amendment_guid)
                        task_count += 1
                        print(f"Queued initialization task for amendment {permit_amendment_guid}")
                            
                    except Exception as e:
                        print(f"Error queuing task for row: {e}")
                        error_count += 1
                        
                print(f"Completed: {task_count} tasks queued, {error_count} errors")

    @app.cli.command('bulk_export_permit_conditions')
    @click.argument('csv_path', type=click.Path(exists=True))
    @click.option('--output_dir', help='Output directory (optional)', default="/tmp")
    def bulk_export_permit_conditions(csv_path, output_dir):
        """
        Export permit conditions for multiple permits from a CSV file.
        CSV should have a column named 'permit_no' containing permit numbers.
        
        Example usage:
            flask bulk_export_permit_conditions path/to/permits.csv
        """
        from app import auth

        from .cli_commands.export_permit_conditions import bulk_export_permit_conditions
        
        auth.apply_security = False
        with current_app.app_context():
            bulk_export_permit_conditions(csv_path, output_dir)
