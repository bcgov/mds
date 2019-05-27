import click

from app.extensions import db, sched
from app.nris.models.nris_raw_data import NRISRawData
from app.nris.etl.nris_etl import import_nris_xml, etl_nris_data, clean_nris_data, clean_nris_xml_import
from app.nris.scheduled_jobs import nris_jobs


def register_commands(app):
    @app.cli.command()
    def _get_nris_raw_data():
        import_nris_xml()

    @app.cli.command()
    def _clean_nris_data():
        clean_nris_data()

    @app.cli.command()
    def _clean_nris_raw_data():
        clean_nris_xml_import()

    @app.cli.command()
    def _run_nris_etl():
        etl_nris_data()

    @sched.app.cli.command()
    def run_nightly_NRIS_ETL():
        with sched.app.app_context():
            nris_jobs.run_nightly_NRIS_ETL()
