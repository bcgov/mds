from app.extensions import db, sched, cache
from app.nris.utils.apm import register_apm
from app.nris.etl.nris_etl import import_nris_xml, clean_nris_xml_import, etl_nris_data, clean_nris_data
from app.constants import ETL, TIMEOUT_24_HOURS, NRIS_JOB_PREFIX, NRIS_ETL_JOB
from flask import current_app
from random import randint
from time import sleep
import sys
import cx_Oracle

# the schedule of these jobs is set using server time (UTC)


def _schedule_nris_etl_jobs(app):
    app.apscheduler.add_job(func=run_nightly_nris_etl,
                            trigger='cron', id='ETL', hour=11, minute=0)


@register_apm
def run_nightly_nris_etl():
    """This nightly job initiates the ETL from NRIS into our app domain."""

    job_running = cache.get(NRIS_JOB_PREFIX + NRIS_ETL_JOB)
    if job_running is None:
        cache.set(NRIS_JOB_PREFIX + NRIS_ETL_JOB,
                  'True', timeout=TIMEOUT_24_HOURS)

        with sched.app.app_context():

            sched.app.logger.info('Starting ETL process')
            # TODO: More detailed logging

            # Initiate Oracle ETL
            try:
                clean_nris_xml_import()
                import_nris_xml()
                sched.app.logger.info('XML Import completed')
                # TODO: Insert update into status table

                clean_nris_data()
                etl_nris_data()
                sched.app.logger.info('NRIS ETL Completed!')

            except cx_Oracle.DatabaseError as e:
                sched.app.logger.error(
                    "Error establishing connection to NRIS database: " + str(e))
            except Exception as e:
                sched.app.logger.error(
                    "Unexpected error with NRIS XML import: " + str(e))
            finally:
                cache.delete(NRIS_JOB_PREFIX + NRIS_ETL_JOB)
