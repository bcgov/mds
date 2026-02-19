import re
import os
import uuid
from multiprocessing.dummy import Pool as ThreadPool
from typing import List

import click
from app.api.mines.mine.models.mine import Mine
from app.api.mines.permits.permit.models.permit import Permit
from app.api.mines.permits.permit_amendment.models.permit_amendment import (
    PermitAmendment,
)
from app.api.users.minespace.models.minespace_user import MinespaceUser
from app.api.utils.include.user_info import User
from app.config import Config
from app.extensions import db
from app.api.constants import PERMIT_LINKED_CONTACT_TYPES
from flask import current_app
from sqlalchemy.exc import DBAPIError
from tests.factories import (
    MineFactory,
    MinePartyAppointmentFactory,
    MinespaceSubscriptionFactory,
    MinespaceUserFactory,
    NOWApplicationIdentityFactory,
    NOWApplicationProgressFactory,
    NOWApplicationReviewFactory,
    create_mine_and_permit,
    create_mine_and_tailing_storage_facility,
)

DUMMY_SIGNATURE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="

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
                bceid_username='cypress@bceid')

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

    @app.cli.command('create_new_recurring_report_requests')
    def create_new_recurring_report_requests():
        from app import auth
        from app.api.mines.reports.tasks import create_new_recurring_report_requests
        auth.apply_security = False

        with current_app.app_context():
            create_new_recurring_report_requests()
            print("celery job started: create_new_recurring_report_requests")

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
            print("celery job started: process_all_untp_map_for_orgbook")

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
                minespace_user = MinespaceUser.find_by_username(full_user_name)
                subscribed_mine_guids = []
                if not minespace_user:
                    minespace_user = MinespaceUserFactory(
                        bceid_username=full_user_name,
                        keycloak_guid='b28dfc3a-5e5c-4501-ab2f-399d8e64f2c8')
                else:
                    from app.api.users.minespace.models.minespace_user_mine import (
                        MinespaceUserMine,
                    )
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

    CHUNKED_FIELDS = ('contacts_data', 'state_of_land_data', 'blasting_operation_data', 'now_application_progress_data', 'now_application_review_data', 'documents_data', 'permit_amendments_data')

    def process_override_input(paste_data):
        # Unescape common characters
        paste_data = paste_data.replace('\\n', '\n').replace('\\r', '\r')
        
        reassembled = {}
        
        # 1. Handle chunked fields: {key}=SEGMENT_START {content} SEGMENT_END
        # These can appear multiple times for the same key (matched via MULTILINE)
        chunks = re.findall(r'^\s*([\w\.]+)=SEGMENT_START (.*?) SEGMENT_END', paste_data, re.MULTILINE | re.DOTALL)
        for key, val in chunks:
            reassembled[key] = reassembled.get(key, '') + val
            
        # 2. Handle simple fields: {key}={content}###END###
        # We use a negative lookahead to skip keys handled by the chunked regex
        simples = re.findall(r'^\s*([\w\.]+)=(?!SEGMENT_START)(.*?)###END###', paste_data, re.MULTILINE | re.DOTALL)
        for key, val in simples:
            # Only add if not already reassembled (prioritize chunks)
            if key not in reassembled:
                reassembled[key] = val
        
        # Return as ||| joined pairs for _parse_overrides
        return '|||'.join([f"{k}={v}" for k, v in reassembled.items()])

    def generate_now_application_sql(now_number):
        def sql_chunk(field_sql, alias):
            # Split the JSON field into 2000-char segments with robust start/end markers for reassembly.
            return f"(SELECT string_agg(' {alias}=SEGMENT_START ' || substring(t.data from i for 2000) || ' SEGMENT_END ', E'\\n') || '###END###' FROM (SELECT COALESCE(({field_sql})::text, '[]') as data) t, generate_series(1, length(t.data), 2000) i)"
        return (
            "SELECT 'now_application_guid=' || i.now_application_guid || '###END###' || E'\\n' || "
            "'now_number=' || i.now_number || '###END###' || E'\\n' || "
            + sql_chunk("SELECT json_agg(json_build_object('mine_party_appt_type_code', npa.mine_party_appt_type_code, 'party_name', p.party_name, 'first_name', p.first_name, 'email', p.email, 'phone_no', p.phone_no, 'has_signature', (p.signature IS NOT NULL), 'address', (SELECT json_build_object('address_line_1', address_line_1, 'city', city, 'sub_division_code', sub_division_code, 'post_code', post_code) FROM address WHERE party_guid = p.party_guid LIMIT 1)))::text FROM now_party_appointment npa JOIN party p ON npa.party_guid = p.party_guid WHERE npa.now_application_id = a.now_application_id AND npa.deleted_ind = false", "contacts_data") + " || E'\\n' || "
            "'now_application.type_of_application=' || COALESCE(a.type_of_application, '') || '###END###' || E'\\n' || "
            "'now_application.now_application_status_code=' || COALESCE(a.now_application_status_code, '') || '###END###' || E'\\n' || "
            "'now_application.notice_of_work_type_code=' || COALESCE(a.notice_of_work_type_code, '') || '###END###' || E'\\n' || "
            "'now_application.property_name=' || REPLACE(COALESCE(a.property_name, ''), ',', ' ') || '###END###' || E'\\n' || "
            "'now_application.tenure_number=' || COALESCE(a.tenure_number, '') || '###END###' || E'\\n' || "
            "'now_application.latitude=' || COALESCE(a.latitude::text, '') || '###END###' || E'\\n' || "
            "'now_application.longitude=' || COALESCE(a.longitude::text, '') || '###END###' || E'\\n' || "
            "'now_application.submitted_date=' || COALESCE(a.submitted_date::text, '') || '###END###' || E'\\n' || "
            "'now_application.received_date=' || COALESCE(a.received_date::text, '') || '###END###' || E'\\n' || "
            "'now_application.proposed_start_date=' || COALESCE(a.proposed_start_date::text, '') || '###END###' || E'\\n' || "
            "'now_application.proposed_end_date=' || COALESCE(a.proposed_end_date::text, '') || '###END###' || E'\\n' || "
            "'now_application.proponent_submitted_permit_number=' || COALESCE(a.proponent_submitted_permit_number, '') || '###END###' || E'\\n' || "
            "'now_application.annual_summary_submitted=' || COALESCE(a.annual_summary_submitted::text, '') || '###END###' || E'\\n' || "
            "'now_application.is_first_year_of_multi=' || COALESCE(a.is_first_year_of_multi::text, '') || '###END###' || E'\\n' || "
            "'now_application.application_permit_type_code=' || COALESCE(a.application_permit_type_code, '') || '###END###' || E'\\n' || "
            "'site_property_tenure_type_code=' || COALESCE((SELECT mine_tenure_type_code FROM mine_type WHERE now_application_guid = i.now_application_guid AND active_ind = true LIMIT 1), '') || '###END###' || E'\\n' || "
            "'issuing_inspector_name=' || COALESCE((SELECT p.first_name || ' ' || p.party_name FROM party p WHERE p.party_guid = a.issuing_inspector_party_guid), '') || '###END###' || E'\\n' || "
            + sql_chunk("SELECT json_build_object('has_community_water_shed', has_community_water_shed, 'has_archaeology_sites_affected', has_archaeology_sites_affected, 'authorization_details', authorization_details, 'has_licence_of_occupation', has_licence_of_occupation, 'licence_of_occupation', licence_of_occupation)::text FROM state_of_land WHERE now_application_id = a.now_application_id", "state_of_land_data") + " || E'\\n' || "
            + sql_chunk("SELECT json_build_object('has_storage_explosive_on_site', has_storage_explosive_on_site, 'explosive_permit_issued', explosive_permit_issued, 'explosive_permit_number', explosive_permit_number)::text FROM blasting_operation WHERE now_application_id = a.now_application_id", "blasting_operation_data") + " || E'\\n' || "
            + sql_chunk("SELECT json_agg(json_build_object('application_progress_status_code', application_progress_status_code, 'start_date', start_date::text, 'end_date', end_date::text, 'created_by', created_by, 'active_ind', active_ind))::text FROM now_application_progress WHERE now_application_id = a.now_application_id", "now_application_progress_data") + " || E'\\n' || "
            + sql_chunk("SELECT json_agg(json_build_object('now_application_review_type_code', now_application_review_type_code, 'response_date', response_date::text, 'referee_name', REPLACE(COALESCE(referee_name, ''), ',', ' '), 'referral_number', REPLACE(COALESCE(referral_number, ''), ',', ' '), 'response_url', REPLACE(COALESCE(response_url, ''), ',', ' ')))::text FROM now_application_review WHERE now_application_id = a.now_application_id", "now_application_review_data") + " || E'\\n' || "
            + sql_chunk("SELECT json_agg(json_build_object('now_application_document_type_code', now_application_document_type_code, 'is_final_package', is_final_package))::text FROM now_application_document_xref WHERE now_application_id = a.now_application_id AND now_application_document_type_code IN ('MRP', 'ACP') AND is_final_package = true AND deleted_ind = false", "documents_data") + " || E'\\n' || "
            + sql_chunk("SELECT json_agg(json_build_object('permit_amendment_status_code', pa.permit_amendment_status_code, 'permit_amendment_type_code', pa.permit_amendment_type_code, 'received_date', pa.received_date::text, 'issue_date', pa.issue_date::text, 'authorization_end_date', pa.authorization_end_date::text, 'description', pa.description, 'permit_no', p.permit_no, 'permit_status_code', p.permit_status_code))::text FROM permit_amendment pa JOIN permit p ON pa.permit_id = p.permit_id WHERE pa.now_application_guid = i.now_application_guid AND pa.deleted_ind = false", "permit_amendments_data") + " "
            "FROM now_application a JOIN now_application_identity i ON a.now_application_id = i.now_application_id "
            f"WHERE i.now_number = '{now_number}';"
        )

    @app.cli.command('generate-now-query')
    @click.option('--now-number', required=True, help='The NoW Number (e.g. 0400022-2025-01)')
    def generate_now_query(now_number):
        import logging
        logging.getLogger().setLevel(logging.CRITICAL) 
        import sys
        sys.stdout.write(generate_now_application_sql(now_number))

    @app.cli.command('create-test-data')
    @click.option('--scenario', type=click.Choice(['mine-with-permit', 'mine-with-tsf', 'now-application', 'random-mine']), help='The data scenario to create.')
    @click.option('--name', help='Mine name override.')
    @click.option('--mine-guid', help='Existing Mine GUID to link the data to.')
    @click.option('--num', default=1, help='Number of entities to create (if applicable).')
    @click.option('--override', multiple=True, help='Field overrides in key=value format (e.g. --override mine_name="New Name")')
    @click.option('--interactive/--non-interactive', default=True, help='Run in interactive mode if no arguments provided.')
    def create_test_data_command(scenario, name, mine_guid, num, override, interactive):
        """
        Creates test data for a given scenario. Restricted to non-production environments.
        """
        if Config.ENVIRONMENT_NAME not in ['local', 'dev', 'test']:
            click.echo(f"Error: Command not allowed in {Config.ENVIRONMENT_NAME} environment.", err=True)
            return

        User._test_mode = True

        # Check for piped input from STDIN (e.g. from oc exec or cat)
        import sys
        if not sys.stdin.isatty():
            # Read all available input
            piped_data = sys.stdin.read().strip()
            if piped_data:
                processed_data = process_override_input(piped_data)
                override = list(override) + [processed_data]

        # If no core arguments provided, force interactive mode
        if not (scenario or name or mine_guid or override) and interactive:
            click.echo("--- MDS Test Data Generator (Interactive Mode) ---")
            scenario = click.prompt("Select Scenario", type=click.Choice(['mine-with-permit', 'mine-with-tsf', 'now-application', 'random-mine']), default='random-mine')
            
            if scenario == 'now-application':
                click.echo("\n[Production Data Helper]")
                now_num_for_sql = click.prompt("Enter the NoW Number you want to replicate (e.g. 0400022-2025-01)", default="YOUR_NOW_NUMBER")
                click.echo("\nTip: Run this SQL in the Prod Read-Only DB to get the override string.")
                click.echo("--------------------------------------------------------------------------------")
                
                sql = generate_now_application_sql(now_num_for_sql)
                click.echo(sql)
                click.echo("--------------------------------------------------------------------------------")
                
                click.echo("Paste the override string, OR the path to a .txt file containing it.")
                click.echo("If pasting, type 'DONE' on a new line or Ctrl+D to finish.")
                import sys
                paste_lines = []
                while True:
                    try:
                        line = sys.stdin.readline()
                        if not line: # EOF
                            break
                        if line.strip() == "DONE":
                            break
                        paste_lines.append(line)
                    except EOFError:
                        break
                
                paste_data = "".join(paste_lines).strip()
                
                if paste_data:
                    data_to_add = process_override_input(paste_data)
                    override = list(override) + [data_to_add]
                    # Handle file:// prefix often added by file explorers when copying paths
                    clean_path = paste_data.replace('file://', '')
                    clean_path = os.path.expanduser(clean_path)
                    
                    # Inside Docker, the repo root is often /app
                    # Check absolute path, then check relative to /app (repo root)
                    possible_paths = [clean_path]
                    if not clean_path.startswith('/app/'):
                        relative_path = os.path.join('/app', clean_path.lstrip('/'))
                        possible_paths.append(relative_path)
                    
                    found_file = False
                    # Only check for file if the paste_data looks like a single line path
                    if "\n" not in paste_data and len(paste_data) < 1000:
                        for p in possible_paths:
                            if os.path.isfile(p):
                                with open(p, 'r') as f:
                                    data_to_add = f.read().strip()
                                    click.echo(f"  - SUCCESS: Loaded {len(data_to_add)} characters from {p}")
                                    found_file = True
                                    break
                    
                    # If loaded from file, apply same sanitization
                    if found_file:
                        if data_to_add.startswith('"') and data_to_add.endswith('"'):
                            data_to_add = data_to_add[1:-1]
                        data_to_add = data_to_add.replace('\\n', '\n')
                        data_to_add = data_to_add.replace('\\r', '\r')
                        data_to_add = data_to_add.replace('""', '"')
                
                    if not found_file and any(p.endswith(('.txt', '.json')) for p in possible_paths) and "\n" not in paste_data:
                        click.secho(f"  - WARNING: Treated input as raw string because no file was found at: {', '.join(possible_paths)}", fg='yellow')
                        click.secho(f"    (Note: Since this runs in Docker, files must be inside the repo folder to be visible)", fg='yellow')
                    elif not found_file and len(paste_data) >= 4095 and "\n" not in paste_data:
                        click.secho("  - WARNING: Input is exactly 4095 characters. This common terminal limit often truncates pasted data.", fg='red', bold=True)
                    
                    override = list(override) + [data_to_add]
            
            if not mine_guid and scenario != 'random-mine':
                mine_guid = click.prompt("Existing Mine GUID (the mine you want this record attached to)", default="")
            
            if not name and not mine_guid:
                name = click.prompt("Mine Name Override (optional)", default="")
            
            if scenario == 'random-mine':
                num = click.prompt("Number of entities", default=1, type=int)

        with app.app_context():
            # Reset sequences to avoid IntegrityErrors in persistent environments
            _reset_factory_sequences()

            try:
                mine = None
                if mine_guid:
                    mine = Mine.find_by_mine_guid(mine_guid)
                    if not mine:
                        click.echo(f"Error: Mine with GUID {mine_guid} not found.", err=True)
                        return
                    click.echo(f"Using existing Mine: {mine.mine_name} ({mine.mine_guid})")

                overrides = _parse_overrides(override)

                if scenario == 'mine-with-permit':
                    mine_kwargs = {'mine_name': name} if name and not mine else {}
                    if mine:
                        mine_kwargs['mine_guid'] = mine.mine_guid
                    
                    # Merge overrides (permit_kwargs, mine_kwargs etc)
                    # We expect overrides like 'permit.permit_no=TEST' or 'mine.mine_name=TEST'
                    # create_mine_and_permit expects separate dicts
                    m_kwargs = {k.replace('mine__', ''): v for k, v in overrides.items() if k.startswith('mine__')}
                    p_kwargs = {k.replace('permit__', ''): v for k, v in overrides.items() if k.startswith('permit__')}
                    mine_kwargs.update(m_kwargs)
                    
                    if mine:
                        _, permit = create_mine_and_permit(mine_kwargs={'mine_guid': mine.mine_guid}, permit_kwargs=p_kwargs)
                    else:
                        mine, permit = create_mine_and_permit(mine_kwargs=mine_kwargs, permit_kwargs=p_kwargs)
                    click.echo(f"Created/Linked Mine: {mine.mine_name} [GUID: {mine.mine_guid}]")
                    click.echo(f"Created Permit: {permit.permit_no} [GUID: {permit.permit_guid}]")
                    for amendment in permit.permit_amendments:
                        click.echo(f"Created Amendment [GUID: {amendment.permit_amendment_guid}]")
                
                elif scenario == 'mine-with-tsf':
                    mine_kwargs = {'mine_name': name} if name and not mine else {}
                    m_kwargs = {k.replace('mine__', ''): v for k, v in overrides.items() if k.startswith('mine__')}
                    t_kwargs = {k.replace('tsf__', ''): v for k, v in overrides.items() if k.startswith('tsf__')}
                    mine_kwargs.update(m_kwargs)
                    
                    if mine:
                        _, tsf = create_mine_and_tailing_storage_facility(mine_kwargs={'mine_guid': mine.mine_guid}, tsf_kwargs=t_kwargs)
                    else:
                        mine, tsf = create_mine_and_tailing_storage_facility(mine_kwargs=mine_kwargs, tsf_kwargs=t_kwargs)
                    click.echo(f"Created/Linked Mine: {mine.mine_name} [GUID: {mine.mine_guid}]")
                    click.echo(f"Created TSF: {tsf.mine_tailings_storage_facility_name} [GUID: {tsf.mine_tailings_storage_facility_guid}]")
                
                elif scenario == 'now-application':
                    from datetime import datetime
                    from app.api.parties.party.models.party import Party
                    from app.api.parties.party.models.address import Address
                    from app.api.now_applications.models.now_party_appointment import NOWPartyAppointment
                    from app.api.now_applications.models.now_application_identity import NOWApplicationIdentity
                    from app.api.now_applications.models.now_application_progress import NOWApplicationProgress
                    from app.api.now_applications.models.now_application_review import NOWApplicationReview
                    from app.api.now_applications.models.now_application_delay import NOWApplicationDelay
                    from app.api.mines.mine.models.mine_type import MineType
                    from app.api.now_applications.models.now_application_document_xref import NOWApplicationDocumentXref
                    from app.api.mines.documents.models.mine_document import MineDocument

                    mine_kwargs = {}
                    if not mine:
                        mine_kwargs = {'mine_name': name} if name else {}
                        m_kwargs = {k.replace('mine__', ''): v for k, v in overrides.items() if k.startswith('mine__')}
                        mine_kwargs.update(m_kwargs)
                        mine = MineFactory(**mine_kwargs)
                    
                    # Extract related data before passing to main factory
                    progress_data = overrides.pop('now_application_progress_data', None)
                    review_data = overrides.pop('now_application_review_data', None)
                    state_of_land_data = overrides.pop('state_of_land_data', None)
                    blasting_data = overrides.pop('blasting_operation_data', None)
                    contacts_data = overrides.pop('contacts_data', None)
                    documents_data = overrides.pop('documents_data', None)
                    inspector_name = overrides.pop('issuing_inspector_name', None)
                    tenure_type_code = overrides.pop('site_property_tenure_type_code', None)
                    permit_amendments_data = overrides.pop('permit_amendments_data', None)

                    now_kwargs = {'mine': mine}
                    now_kwargs.update(overrides)
                    
                    # Extract submitted permit number for potential linkage
                    submitted_permit_no = now_kwargs.get('proponent_submitted_permit_number')
                    local_permit = None
                    if submitted_permit_no and mine:
                        local_permit = Permit.find_by_permit_no(submitted_permit_no)
                        if local_permit:
                            click.echo(f"  - DEBUG: Found matching local permit {submitted_permit_no} for role linkage.")
                    
                    for k in list(now_kwargs.keys()):
                        if k.startswith('now_application.') or k.startswith('now_application__'):
                            key_part = k.replace('now_application.', '').replace('now_application__', '')
                            app_overrides[key_part] = now_kwargs.pop(k)

                        if k.startswith('mine__'):
                            del now_kwargs[k]


                    # Check for existing application to prompt overwrite
                    now_num = now_kwargs.get('now_number')
                    if now_num:
                        existing_identity = NOWApplicationIdentity.find_by_now_number(now_num)
                        if existing_identity:
                            if interactive:
                                if not click.confirm(f"Application {now_num} already exists. Would you like to OVERWRITE it?", abort=True):
                                    return
                            click.echo(f"Overwriting application {now_num}...")
                            from sqlalchemy import text
                            nid = existing_identity.now_application_id
                            nguid = str(existing_identity.now_application_guid)
                            
                            # Use raw SQL to bypass SQLAlchemy's complex relationship/PK management for clean deletion
                            if nid:
                                # 1. Delete Activity Sub-children (Details and Xrefs)
                                db.session.execute(text("DELETE FROM activity_equipment_xref WHERE activity_summary_id IN (SELECT activity_summary_id FROM activity_summary WHERE now_application_id = :id)"), {"id": nid})
                                db.session.execute(text("DELETE FROM activity_summary_detail_xref WHERE activity_summary_id IN (SELECT activity_summary_id FROM activity_summary WHERE now_application_id = :id)"), {"id": nid})
                                db.session.execute(text("DELETE FROM activity_summary_staging_area_detail_xref WHERE activity_summary_id IN (SELECT activity_summary_id FROM activity_summary WHERE now_application_id = :id)"), {"id": nid})
                                db.session.execute(text("DELETE FROM activity_summary_building_detail_xref WHERE activity_summary_id IN (SELECT activity_summary_id FROM activity_summary WHERE now_application_id = :id)"), {"id": nid})
                                
                                # 2. Delete Activity Specific (Polymorphic Children) - ONLY those with their own tables (Joined Inheritance)
                                activity_tables = [
                                    'camp', 'placer_operation', 'settling_pond', 'surface_bulk_sample',
                                    'sand_gravel_quarry_operation', 'underground_exploration',
                                    'exploration_access', 'exploration_surface_drilling'
                                ]
                                for table in activity_tables:
                                    db.session.execute(text(f"DELETE FROM {table} WHERE activity_summary_id IN (SELECT activity_summary_id FROM activity_summary WHERE now_application_id = :id)"), {"id": nid})
                                
                                # 3. Delete Activity Summaries
                                db.session.execute(text("DELETE FROM activity_summary WHERE now_application_id = :id"), {"id": nid})
                                
                                # 4. Delete Direct Children of NOWApplication
                                db.session.execute(text("DELETE FROM blasting_operation WHERE now_application_id = :id"), {"id": nid})
                                db.session.execute(text("DELETE FROM state_of_land WHERE now_application_id = :id"), {"id": nid})
                                db.session.execute(text("DELETE FROM now_application_review WHERE now_application_id = :id"), {"id": nid})
                                db.session.execute(text("DELETE FROM now_application_progress WHERE now_application_id = :id"), {"id": nid})
                                db.session.execute(text("DELETE FROM now_party_appointment WHERE now_application_id = :id"), {"id": nid})
                                db.session.execute(text("DELETE FROM now_application_document_xref WHERE now_application_id = :id"), {"id": nid})
                                db.session.execute(text("DELETE FROM application_reason_code_xref WHERE now_application_id = :id"), {"id": nid})
                                db.session.execute(text("DELETE FROM now_application_document_identity_xref WHERE now_application_id = :id"), {"id": nid})
                                # Delete linked permit amendments
                                db.session.execute(text("DELETE FROM permit_amendment WHERE now_application_guid = :guid"), {"guid": nguid})
                                
                            # 5. Clean up Identity-linked records
                            db.session.execute(text("DELETE FROM now_application_delay WHERE now_application_guid = :guid"), {"guid": nguid})
                            db.session.execute(text("DELETE FROM mine_type WHERE now_application_guid = :guid"), {"guid": nguid})
                            
                            # 6. Delete Identity itself (Must happen before NOWApplication because it references it)
                            db.session.execute(text("DELETE FROM now_application_identity WHERE now_application_guid = :guid"), {"guid": nguid})
                            
                            # 7. Finally delete the application itself
                            if nid:
                                db.session.execute(text("DELETE FROM now_application WHERE now_application_id = :id"), {"id": nid})
                            
                            db.session.commit()
                            click.echo(f"Existing record deleted successfully. Recreating...")

                    # Create NOWApplication
                    now_identity = NOWApplicationIdentityFactory(**now_kwargs)
                    now_app = now_identity.now_application
                    db.session.flush()

                    # Apply application-level overrides
                    for k, v in app_overrides.items():
                        if hasattr(now_app, k):
                            setattr(now_app, k, v)

                    # Replicate Inspector if provided
                    if inspector_name:
                        name_parts = inspector_name.split()
                        last_name = name_parts[-1] if name_parts else 'Inspector'
                        first_name = name_parts[0] if len(name_parts) > 1 else 'Lead'
                        
                        inspector = Party.find_by_name(last_name, first_name)
                        if not inspector:
                            inspector = Party.create(last_name, "604-555-1212", "PER", first_name=first_name)
                            db.session.flush()
                        
                        if not inspector.signature:
                            inspector.signature = DUMMY_SIGNATURE
                            db.session.add(inspector)
                            db.session.flush()
                        
                        now_app.issuing_inspector_party_guid = inspector.party_guid

                    # Replicate Site Property (MineType)
                    if tenure_type_code:
                        MineType.create_or_update_mine_type_with_details(
                            mine_guid=mine.mine_guid,
                            now_application_guid=now_identity.now_application_guid,
                            mine_tenure_type_code=tenure_type_code
                        )

                    # Update StateOfLand and BlastingOperation
                    if state_of_land_data and isinstance(state_of_land_data, dict):
                        for k, v in state_of_land_data.items():
                            if hasattr(now_app.state_of_land, k): setattr(now_app.state_of_land, k, v)
                    
                    if blasting_data and isinstance(blasting_data, dict):
                        for k, v in blasting_data.items():
                            if hasattr(now_app.blasting_operation, k): setattr(now_app.blasting_operation, k, v)

                    def _parse_date(d_str):
                        if not d_str or d_str == 'None': return None
                        try:
                            # Split to handle both 'YYYY-MM-DD' and 'YYYY-MM-DD HH:MM:SS+00'
                            return datetime.strptime(d_str.split(' ')[0], '%Y-%m-%d').date()
                        except: return None

                    # Replicate Progress records
                    if progress_data and isinstance(progress_data, list):
                        from app.api.now_applications.models.now_application_progress import NOWApplicationProgress
                        db.session.query(NOWApplicationProgress).filter_by(now_application_id=now_app.now_application_id).delete()
                        for p in progress_data:
                            p['start_date'] = _parse_date(p.get('start_date'))
                            p['end_date'] = _parse_date(p.get('end_date'))
                            NOWApplicationProgressFactory(now_application=now_app, **p)

                    # Replicate Review records
                    if review_data and isinstance(review_data, list):
                        from app.api.now_applications.models.now_application_review import NOWApplicationReview
                        db.session.query(NOWApplicationReview).filter_by(now_application_id=now_app.now_application_id).delete()
                        for r in review_data:
                            r['response_date'] = _parse_date(r.get('response_date'))
                            NOWApplicationReviewFactory(now_application=now_app, **r)

                    last_processed_permit = local_permit
                    if permit_amendments_data and isinstance(permit_amendments_data, list):
                        click.echo(f"  - DEBUG: Ingesting {len(permit_amendments_data)} permit fragments")
                        for pa_doc in permit_amendments_data:
                            click.echo(f"    - Processing '{pa_doc['permit_no']}' / Status: {pa_doc['permit_amendment_status_code']}")

                            # 1. Fetch or Create Parent Permit
                            permit = Permit.find_by_permit_no(pa_doc['permit_no'])
                            if not permit:
                                permit = Permit.create(
                                    mine=mine,
                                    permit_no=pa_doc['permit_no'],
                                    permit_status_code=pa_doc['permit_status_code'],
                                    is_exploration=False,
                                    exemption_fee_status_code=None,
                                    exemption_fee_status_note=None
                                )
                                if permit._mine_associations:
                                    permit._mine_associations[0].start_date = datetime.utcnow()
                                db.session.flush()
                                click.echo(f"    - Created matching permit {pa_doc['permit_no']}")
                            else:
                                if mine.mine_guid not in [m.mine_guid for m in permit._all_mines]:
                                    from app.api.mines.permits.permit.models.mine_permit_xref import MinePermitXref
                                    permit._mine_associations.append(MinePermitXref(mine_guid=mine.mine_guid, start_date=datetime.utcnow()))
                                    db.session.flush()
                                    click.echo(f"    - Added mine association for existing permit {pa_doc['permit_no']}")

                            last_processed_permit = permit

                            # 2. Check for existing amendment for this NoW on this permit
                            existing_pa = PermitAmendment.query.filter_by(
                                now_application_guid=now_identity.now_application_guid,
                                permit_id=permit.permit_id,
                                deleted_ind=False
                            ).first()

                            if not existing_pa:
                                pa_guid = uuid.UUID(str(now_identity.now_application_guid))
                                status = pa_doc['permit_amendment_status_code']

                                new_pa = PermitAmendment.create(
                                    permit=permit,
                                    mine=mine,
                                    received_date=_parse_date(pa_doc['received_date']),
                                    issue_date=_parse_date(pa_doc['issue_date']),
                                    authorization_end_date=_parse_date(pa_doc['authorization_end_date']),
                                    permit_amendment_type_code=pa_doc['permit_amendment_type_code'],
                                    description=pa_doc['description'],
                                    permit_amendment_status_code=status,
                                    now_application_guid=pa_guid,
                                    add_to_session=True
                                )
                                click.echo(f"    - Linked {status} amendment for permit {pa_doc['permit_no']}")
                            else:
                                click.echo(f"    - Amendment for {pa_doc['permit_no']} already exists.")

                    # Replicate Documents (MRP/ACP metadata)
                    if documents_data and isinstance(documents_data, list):
                        for doc in documents_data:
                            mine_doc = MineDocument(mine_guid=mine.mine_guid, document_name=f"Replicated_{doc['now_application_document_type_code']}.pdf", document_manager_guid=uuid.uuid4())
                            db.session.add(mine_doc)
                            db.session.flush()
                            db.session.add(NOWApplicationDocumentXref(now_application_id=now_app.now_application_id, mine_document_guid=mine_doc.mine_document_guid, now_application_document_type_code=doc['now_application_document_type_code'], is_final_package=True))

                    # Replicate Contacts (Permittees) 
                    # Handled AFTER permits to ensure we have a permit_id to link to for PMT role
                    if contacts_data:
                        if isinstance(contacts_data, list):
                            from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointment
                            
                            for c in contacts_data:
                                p_name = c.pop('party_name', '')
                                f_name = c.pop('first_name', '')
                                has_sig = c.pop('has_signature', False)
                                address_data = c.pop('address', None)
                                type_code = c.get('mine_party_appt_type_code', 'PMT')
                                
                                party = Party.find_by_name(p_name, f_name)
                                if not party:
                                    mock_email = f"{f_name or 'info'}.{p_name}@example.com".replace(' ', '.').lower()
                                    mock_phone = "604-555-0000"
                                    party = Party.create(p_name, mock_phone, "PER" if f_name else "ORG", first_name=f_name, email=mock_email)
                                    db.session.flush()
                                    
                                    if address_data:
                                        addr = Address(party_guid=party.party_guid, **address_data)
                                        db.session.add(addr)
                                        db.session.flush()
                                    
                                if has_sig and not party.signature:
                                    party.signature = DUMMY_SIGNATURE
                                    db.session.add(party)
                                
                                npa = NOWPartyAppointment(now_application_id=now_app.now_application_id, party_guid=party.party_guid, mine_party_appt_type_code=type_code)
                                db.session.add(npa)
                                click.echo(f"  - DEBUG: Linked contact {p_name} as {type_code}")
                                
                                if type_code in PERMIT_LINKED_CONTACT_TYPES or type_code == 'MMG':
                                        # Link to permit if it's a permit-linked type
                                        is_permit_linked = type_code in PERMIT_LINKED_CONTACT_TYPES
                                        target_permit_id = last_processed_permit.permit_id if (is_permit_linked and last_processed_permit) else None
                                        
                                        if is_permit_linked and not target_permit_id:
                                            click.echo(f"  - WARNING: Skipping MinePartyAppointment for {type_code} {p_name} because no permit_id found.")
                                            continue

                                        # Retire existing active appointments for this ROLE on this MINE/PERMIT to avoid date overlap
                                        query = MinePartyAppointment.query.filter_by(
                                            mine_party_appt_type_code=type_code,
                                            deleted_ind=False
                                        ).filter(MinePartyAppointment.end_date == None)
                                        
                                        if is_permit_linked:
                                            query = query.filter_by(permit_id=target_permit_id)
                                        else:
                                            query = query.filter_by(mine_guid=mine.mine_guid)

                                        existing_active = query.all()
                                        for ea in existing_active:
                                            ea.end_date = datetime.utcnow().date()
                                            db.session.add(ea)
                                        db.session.flush()

                                        db.session.add(MinePartyAppointment(
                                            mine_guid=mine.mine_guid if not is_permit_linked else None,
                                            party_guid=party.party_guid,
                                            mine_party_appt_type_code=type_code,
                                            permit_id=target_permit_id,
                                            start_date=datetime.utcnow().date()
                                        ))
                            db.session.flush()
                            click.echo(f"  - Replicated {len(contacts_data)} Contacts")
                        else:
                            click.echo(f"Warning: contacts_data was not a list (got {type(contacts_data).__name__}). Skipping contact replication.", err=True)

                    click.echo(f"Created/Linked Mine: {mine.mine_name} [GUID: {mine.mine_guid}]")
                    click.echo(f"Created NoW Application: {now_identity.now_number} [ID: {now_identity.now_application_id}] [GUID: {now_identity.now_application_guid}]")
                    
                    if progress_data is not None:
                        click.echo(f"  - Replicated {len(progress_data) if isinstance(progress_data, list) else 0} Progress records")
                    if review_data is not None:
                        count = len(review_data) if isinstance(review_data, list) else 0
                        click.echo(f"  - Replicated {count} Review records")
                    if documents_data:
                        click.echo(f"  - Replicated {len(documents_data)} Final Package document placeholders")
                    if permit_amendments_data:
                        count = len(permit_amendments_data) if isinstance(permit_amendments_data, list) else 0
                        click.echo(f"  - Replicated {count} Permit Amendment fragments")

                elif scenario == 'random-mine':
                    for _ in range(num):
                        mine_kwargs = {'mine_name': name} if name else {}
                        mine_kwargs.update(overrides)
                        new_mine = MineFactory(**mine_kwargs)
                        db.session.add(new_mine)
                        click.echo(f"Created Random Mine: {new_mine.mine_name} [GUID: {new_mine.mine_guid}]")
                
                db.session.commit()
                click.echo("Success: Test data committed to database.")
            except Exception as e:
                db.session.rollback()
                click.echo(f"Error: Failed to create test data. {e}", err=True)
                raise e

    def _reset_factory_sequences():
        """
        Queries the database for the maximum IDs and resets factory-boy sequences
        to prevent IntegrityError (UniqueViolation) in environments with existing data.
        """
        from sqlalchemy import func
        from app.api.now_submissions.models.client import Client as NOWClient
        from app.api.now_submissions.models.application import Application as NOWApplication
        from app.api.now_submissions.models.placer_activity import PlacerActivity as NOWPlacerActivity
        from app.api.now_submissions.models.settling_pond import SettlingPondSubmission as NOWSettlingPond
        from app.api.now_applications.models.now_application_identity import NOWApplicationIdentity
        
        from tests.now_submission_factories import (
            NOWClientFactory, NOWSubmissionFactory, 
            NOWPlacerActivityFactory, NOWSettlingPondFactory,
            NOWApplicationNDAFactory
        )
        from tests.now_application_factories import NOWApplicationIdentityFactory

        # Client ID (now_submissions.client)
        max_client_id = db.session.query(func.max(NOWClient.clientid)).scalar() or 1000
        NOWClientFactory.reset_sequence(max_client_id + 1)

        # Message ID (now_submissions.application)
        max_message_id = db.session.query(func.max(NOWApplication.messageid)).scalar() or 1000
        NOWSubmissionFactory.reset_sequence(max_message_id + 1)
        NOWApplicationNDAFactory.reset_sequence(max_message_id + 1)

        # Activity IDs
        max_placer_id = db.session.query(func.max(NOWPlacerActivity.placeractivityid)).scalar() or 1000
        NOWPlacerActivityFactory.reset_sequence(max_placer_id + 1)

        max_pond_id = db.session.query(func.max(NOWSettlingPond.settlingpondid)).scalar() or 1000
        NOWSettlingPondFactory.reset_sequence(max_pond_id + 1)

        # NOW Application Identity
        max_mms_cid = db.session.query(func.max(func.cast(NOWApplicationIdentity.mms_cid, db.Integer))).scalar() or 1000
        NOWApplicationIdentityFactory.reset_sequence(max_mms_cid + 1)
        
        click.echo(f"Factory sequences reset (Client: {max_client_id}, Msg: {max_message_id}, MMS: {max_mms_cid})")

    def split_top_level_commas(s):
        """Split a string by commas or newlines, but only those at the top level and followed by a key=val part."""
        import re
        parts = []
        current = []
        depth = 0
        in_quote = False
        quote_char = None
        
        click.echo(f"  - DEBUG Splitter: Processing string of length {len(s)}")
        
        for i, char in enumerate(s):
            # Track quotes at any depth to avoid counting braces/commas inside strings
            if char in '"\'' and (i == 0 or s[i-1] != '\\'):
                if not in_quote:
                    in_quote = True
                    quote_char = char
                elif char == quote_char:
                    in_quote = False
            
            if not in_quote:
                if char in '[{':
                    depth += 1
                elif char in ']}':
                    depth -= 1
                elif char in (',', '\n') and depth == 0:
                    # Look ahead to see if the next part looks like "key="
                    lookahead = s[i+1:].lstrip()
                    # Match key= or key.subkey= and allow for spaces
                    if re.match(r'^[\w\.]+\s*=', lookahead):
                        p = ''.join(current).strip()
                        if p:
                            # Handle potential truncation if the field starts with [ or {
                            # by ensuring we at least try to close it if it's the last part.
                            # Actually, split_top_level_commas is called BEFORE _parse_overrides.
                            parts.append(p)
                        current = []
                        continue
            
            current.append(char)
        
        if current:
            p = ''.join(current).strip()
            if p:
                parts.append(p)
        
        click.echo(f"  - DEBUG Splitter: Split into {len(parts)} segments. Final depth={depth}, in_quote={in_quote}")
        return parts

    def _parse_overrides(overrides):
        import json
        parsed = {}
        clean_pairs = []
        
        for o in overrides:
            if '|||' in o:
                clean_pairs.extend(o.split('|||'))
            elif '--override' in o:
                clean_pairs.extend([p.strip() for p in o.split('--override ') if p.strip()])
            else:
                clean_pairs.extend(split_top_level_commas(o))

        for pair in clean_pairs:
            if '=' in pair:
                key, value = pair.split('=', 1)
                key = key.replace('.', '__').strip()
                
                # Debug: show raw value for contacts
                if 'contacts' in key.lower():
                    click.echo(f"  - DEBUG: Raw pair for {key}, value length={len(value)}")
                    click.echo(f"    - Value starts: '{value[:50]}'")
                    click.echo(f"    - Value ends: '{value[-50:]}'")
                
                value = value.strip().strip('"\'')
                
                # Try JSON parsing - be more aggressive in detecting JSON
                v_clean = value.strip()
                if (v_clean.startswith('[') or v_clean.startswith('{')):
                    # If it looks like JSON but is missing the closing bracket/brace,
                    # it might have been truncated by the terminal. Try to fix it.
                    if v_clean.startswith('[') and not v_clean.endswith(']'):
                        v_clean += ']'
                    if v_clean.startswith('{') and not v_clean.endswith('}'):
                        v_clean += '}'
                    
                    try:
                        parsed[key] = json.loads(v_clean)
                        # click.echo(f"  - DEBUG: Parsed JSON for {key}") # Keep quiet if success
                        continue
                    except json.JSONDecodeError as e:
                        # If still failing, it might be truncated in the middle of a string/object
                        # We try one more level of aggressive fixing for common list truncation
                        if v_clean.startswith('[') and '},' in v_clean:
                            try:
                                fixed_v = v_clean[:v_clean.rindex('}')+1] + ']'
                                parsed[key] = json.loads(fixed_v)
                                click.secho(f"  - FIXED: Recovered truncated JSON for {key}", fg='green')
                                continue
                            except: pass
                        click.echo(f"Warning: JSON decode error for key {key}: {str(e)}", err=True)
                        click.echo(f"  - Raw value starts: '{v_clean[:100]}'")
                        click.echo(f"  - Raw value ends:   '{v_clean[-100:]}'")
                elif key == 'contacts_data':
                    click.echo(f"  - DEBUG: contacts_data did NOT parse as JSON.")
                    click.echo(f"    - Cleaned value starts with: '{v_clean[:20]}'")
                    click.echo(f"    - Cleaned value ends with:   '{v_clean[-20:]}'")
                    # If it's missing the final bracket, maybe it was split wrong
                    if '[' in v_clean and ']' not in v_clean:
                        click.echo(f"    - WARNING: contacts_data appears truncated (has '[' but no ']')")
                
                v_lower = value.lower()
                if v_lower in ('true', 't'):
                    parsed[key] = True
                elif v_lower in ('false', 'f'):
                    parsed[key] = False
                elif v_lower in ('none', 'null', ''):
                    parsed[key] = None
                else:
                    try:
                        parsed[key] = int(value)
                    except ValueError:
                        try:
                            parsed[key] = float(value)
                        except ValueError:
                            parsed[key] = value
        
        if 'contacts_data' in parsed:
            c_data = parsed['contacts_data']
            click.echo(f"  - DEBUG: contacts_data found, type={type(c_data).__name__}, len={len(c_data)}")
        else:
            click.echo(f"  - DEBUG: contacts_data NOT found in overrides. Keys present: {list(parsed.keys())}")
            
        return parsed

    
    def _batch( items: list, batch_size: int) -> List[List]:
        """Split a list into batches of specified size"""
        return [items[i : i + batch_size] for i in range(0, len(items), batch_size)]

    
    @app.cli.command('bulk_export_and_index_permit_conditions')
    @click.argument('permit_type', type=click.STRING, required=False)
    @click.option('--amendment_guids', type=click.STRING, required=False)
    @click.option('--batch_size', type=click.INT, required=False, default=500)
    @click.option('--apply', is_flag=True, default=False, help="If provided, uploads to blob storage to trigger indexing. Otherwise saves to local CSV.")
    @click.option('--output-dir', type=click.Path(exists=True, file_okay=False, dir_okay=True), required=False, help="Directory to save the CSV file in dry-run mode.")
    def bulk_export_and_index_permit_conditions(permit_type, amendment_guids, batch_size, apply, output_dir):
        """
        Bulk export permit conditions.
        """
        import csv
        import datetime
        import os

        from app import auth
        from app.api.mines.permits.permit_conditions.tasks import (
            export_and_index_permit_amendments,
        )

        from .cli_commands.export_permit_conditions import (
            export_permit_conditions,
            headers,
        )
        
        auth.apply_security = False
        is_now = permit_type.lower() == 'now' if permit_type else False

        if amendment_guids:
            print(f"Exporting permit amendments with guids: {amendment_guids}")
            permit_amendment_guids = amendment_guids.split(',')
        elif permit_type:
            permit_amendment_guids = PermitAmendment.find_all_guids_with_extracted_conditions(is_now)
            print(f"Exporting {len(permit_amendment_guids)} {'Notice of Work' if is_now else 'Major Mine'} permit amendments")
        else:
            permit_amendment_guids = PermitAmendment.find_all_guids_with_extracted_conditions()
            print(f"Exporting {len(permit_amendment_guids)} permit amendments with extracted conditions for all types")

        if apply:
            print("Apply flag set: Uploading to blob storage for indexing...")
            batches = _batch(permit_amendment_guids, batch_size)
            for guids in batches:
                with current_app.app_context():
                    export_and_index_permit_amendments(permit_amendment_guids=guids, is_manual=True)
        else:
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f'permit_conditions_verify_{timestamp}.csv'
            
            if output_dir:
                filename = os.path.join(output_dir, filename)

            print(f"Dry run: Exporting to local file {filename}...")
            
            with open(filename, 'w', newline='') as csvfile:
                writer = csv.DictWriter(csvfile, fieldnames=headers)
                writer.writeheader()
                
                count = 0
                total = len(permit_amendment_guids)
                
                for guid in permit_amendment_guids:
                    try:
                        export_permit_conditions(guid, csv_writer=writer)
                        count += 1
                        if count % 10 == 0:
                            print(f"Processed {count}/{total}...")
                    except Exception as e:
                        print(f"Error processing {guid}: {e}")
            
            print(f"Done. Verify content in {filename}")