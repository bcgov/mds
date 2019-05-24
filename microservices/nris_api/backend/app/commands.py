import click

from app.extensions import db, oracle_db, sched
from app.nris.models.nris_raw_data import NRISRawData
from app.nris.etl.nris_etl import import_nris_xml, etl_nris_data, clean_nris_data
from app.nris.scheduled_jobs import nris_jobs


def register_commands(app):
    @app.cli.command()
    def _test_oracle_db():
        import_nris_xml()

    @app.cli.command()
    def _test_clean_nris_data():
        clean_nris_data()

    @app.cli.command()
    def _test_xml():
        etl_nris_data()

    # if app.config.get('ENVIRONMENT_NAME') in ['test', 'prod']:

    @sched.app.cli.command()
    def run_nightly_NRIS_ETL():
        with sched.app.app_context():
            nris_jobs.run_nightly_NRIS_ETL()
