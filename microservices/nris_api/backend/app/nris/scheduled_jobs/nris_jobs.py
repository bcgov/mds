from app.extensions import db, sched, cache
from app.nris.utils.apm import register_apm
from app.nris.etl.nris_etl import import_nris_xml, clean_nris_xml_import, etl_nris_data, clean_nris_etl_data
from app.constants import ETL, TIMEOUT_12_HOURS, NRIS_JOB_PREFIX, NRIS_ETL_JOB
from flask import current_app
from random import randint
from time import sleep
import sys
import cx_Oracle


def _schedule_nris_etl_jobs(app):
    # the schedule of these jobs is set using server time (UTC)
    app.apscheduler.add_job(func=nris_etl_job, trigger='cron', id='ETL', hour=11, minute=0)


def nris_etl_job():
    """This nightly job initiates the ETL from NRIS into our app domain."""

    job_running = cache.get(NRIS_JOB_PREFIX + NRIS_ETL_JOB)
    if job_running is None:
        try:
            cache.set(NRIS_JOB_PREFIX + NRIS_ETL_JOB, 'True', timeout=TIMEOUT_12_HOURS)
            _run_nris_etl()
        finally:
            cache.delete(NRIS_JOB_PREFIX + NRIS_ETL_JOB)
    else:
        print("Job is running")


@register_apm("NRIS ETL Job")
def _run_nris_etl():
    with sched.app.app_context():

        sched.app.logger.info('Starting ETL process')
        # TODO: More detailed logging

        # Initiate Oracle ETL
        try:
            clean_nris_xml_import()
            import_nris_xml()
            sched.app.logger.info('XML Import completed')
            # TODO: Insert update into status table

            clean_nris_etl_data()
            etl_nris_data()
            sched.app.logger.info('NRIS ETL Completed!')

        except cx_Oracle.DatabaseError as e:
            sched.app.logger.error("Error establishing connection to NRIS database: " + str(e))
        except Exception as e:
            sched.app.logger.error("Unexpected error with NRIS XML import: " + str(e))
