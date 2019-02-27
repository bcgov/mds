from app.extensions import db, sched
from app.api.utils.apm import register_apm


# @sched.task('cron', id='ETL', hour=11, minute=0)
@register_apm
def _run_ETL():
    with sched.app.app_context():
        db.session.execute('select transfer_mine_information();')
        db.session.execute('commit;')
        db.session.execute('select transfer_mine_manager_information();')
        db.session.execute('commit;')
        db.session.execute('select transfer_permit_permitee_information();')
        db.session.execute('commit;')
        db.session.execute('select transfer_mine_status_information();')
        db.session.execute('commit;')
