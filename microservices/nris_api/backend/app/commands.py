from app.extensions import db, sched
from app.nris.models.nris_raw_data import NRISRawData
from app.nris.etl.nris_etl import import_nris_xml, etl_nris_data, clean_nris_etl_data, clean_nris_xml_import
from app.nris.scheduled_jobs import nris_jobs


def register_commands(app):
    @app.cli.command()
    def import_nris_raw_data():
        print("Importing Raw Data from NRIS...")
        import_nris_xml()
        print("Import complete")

    @app.cli.command()
    def clean_nris_data():
        print("Cleaning NRIS Data...")
        clean_nris_etl_data()
        print("Cleanup complete")

    @app.cli.command()
    def clean_nris_raw_data():
        print("Cleaning NRIS Raw Data...")
        clean_nris_xml_import()
        print("Cleanup complete")

    @app.cli.command()
    def run_nris_etl():
        print("Running NRIS ETL...")
        etl_nris_data()
        print("NRIS ETL complete")

    @app.cli.command()
    def test_cli_command():
        print("Flask commands working")

    @sched.app.cli.command()
    def run_nris_etl_job():
        with sched.app.app_context():
            nris_jobs.nris_etl_job()
