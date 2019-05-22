from app.extensions import db, sched, cache
from app.utils.apm import register_apm
from app.constants import ETL, TIMEOUT_24_HOURS
from random import randint
from time import sleep


# the schedule of these jobs is set using server time (UTC)
def _schedule_NRIS_ETL_jobs(app):
    app.apscheduler.add_job(func=_run_nightly_NRIS_ETL(), trigger='cron',
                            id='ETL', hour=11, minute=0)


@register_apm
def _run_nightly_NRIS_ETL():
    """This nightly job initiates the ETL from NRIS into our app domain."""
    raise NotImplementedError
