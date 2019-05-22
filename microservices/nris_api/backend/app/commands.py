import click

from app.extensions import db, oracle_db, sched
from app.nris.models.nris_raw_data import NRISRawData
from app.nris.etl.nris_etl import _etl_nris_data
from app.nris.scheduled_jobs import NRIS_etl


def register_commands(app):
    @app.cli.command()
    def _test_oracle_db():
        cursor = oracle_db.cursor()

        cursor.execute(
            "select xml_document from CORS.CORS_CV_ASSESSMENTS_XVW where business_area = 'EMPR'")
        results = cursor.fetchall()

        for result in results:
            data = NRISRawData.create(result[0].read())
            db.session.add(data)
            db.session.commit()

        cursor.close()

    @app.cli.command()
    def _test_xml():
        nris_data = db.session.query(NRISRawData).all()
        for item in nris_data:
            _etl_nris_data(item.nris_data)

    if app.config.get('ENVIRONMENT_NAME') in ['test', 'prod']:

        @sched.app.cli.command()
        def __run_nightly_NRIS_ETL():
            with sched.app.app_context():
                print('Starting the ETL.')
                NRIS_etl._run_nightly_NRIS_ETL()
                print('Completed running the ETL.')
