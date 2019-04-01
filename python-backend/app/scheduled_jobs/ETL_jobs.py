from app.extensions import db, sched, cache
from app.api.utils.apm import register_apm
from app.api.constants import ETL, TIMEOUT_24_HOURS


#the schedule of these jobs is set using server time (UTC)
def _schedule_ETL_jobs(app):
    app.apscheduler.add_job(func=_run_ETL, trigger='cron', id='ETL', hour=11, minute=0)


@register_apm
def _run_ETL():
    with sched.app.app_context():
        job_running = cache.get(ETL)
        if not job_running:
            cache.set(ETL, 'True', timeout=TIMEOUT_24_HOURS)
            db.session.execute('select transfer_mine_information();')
            db.session.execute('commit;')
            db.session.execute('select transfer_mine_manager_information();')
            db.session.execute('commit;')
            db.session.execute('select transfer_permit_permitee_information();')
            db.session.execute('commit;')
            db.session.execute('select transfer_mine_status_information();')
            db.session.execute('commit;')
