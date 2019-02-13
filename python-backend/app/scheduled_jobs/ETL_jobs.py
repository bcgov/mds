import requests
from app.extensions import db, cache, sched
from app.api.nris_services import NRIS_service
from app.api.mines.mine.models.mine import Mine
from app.api.constants import NRIS_JOB_PREFIX, NRIS_MMLIST_JOB, NRIS_MAJOR_MINE_LIST, TIMEOUT_24_HOURS, TIMEOUT_60_MINUTES


#the schedule of these jobs is set using server time (UTC)
def _schedule_ETL_jobs(app):
    app.apscheduler.add_job(func=_run_ETL, trigger='cron', id='ETL', hour=17, minute=15)


def _run_ETL():
    with sched.app.app_context():
        db.session.execute('select transfer_mine_information();')
        db.session.execute('commit;')
        db.session.execute('select transfer_mine_manager_information();')
        db.session.execute('commit;')
        db.session.execute('select transfer_premit_permitee_information();')
        db.session.execute('commit;')
        db.session.execute('select transfer_mine_status_information();')
        db.session.execute('commit;')
