from app.extensions import db, oracle_db, sched
from app.nris.utils.apm import register_apm
from app.nris.etl.nris_etl import import_nris_xml, clean_nris_xml_import, etl_nris_data, clean_nris_data
from app.constants import ETL, TIMEOUT_24_HOURS
from flask import current_app
from random import randint
from time import sleep
import sys

# the schedule of these jobs is set using server time (UTC)


def _schedule_NRIS_ETL_jobs(app):
    app.apscheduler.add_job(
        func=run_nightly_NRIS_ETL(), trigger='cron', id='ETL', hour=11, minute=0)


@register_apm
def run_nightly_NRIS_ETL():
    """This nightly job initiates the ETL from NRIS into our app domain."""

    current_app.logger.info('Starting ETL process')
    # TODO: More detailed logging

    # Initiate Oracle ETL
    try:
        clean_nris_xml_import()
        import_nris_xml()
        current_app.logger.info('XML Import completed')
        # TODO: Insert update into status table

    except Exception as e:
        current_app.logger.error(
            "Unexpected error with NRIS XML import:", e)
        return

    try:
        etl_nris_data()
        current_app.logger.info('NRIS ETL Completed!')

    except:
        current_app.logger.error(
            "Unexpected error with NRIS ETL")
