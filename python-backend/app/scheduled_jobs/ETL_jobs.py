from app.extensions import db, sched
from app.api.utils.apm import register_apm


#the schedule of these jobs is set using server time (UTC)
def _schedule_ETL_jobs(app):
    app.apscheduler.add_job(func=_run_ETL, trigger='interval', id='ETL', hour=2)


@register_apm
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
