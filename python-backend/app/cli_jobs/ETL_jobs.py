from app.extensions import db
from app.api.utils.apm import register_apm


@register_apm()
def run_ETL():
    db.session.execute('select transfer_mine_information();')
    db.session.execute('commit;')
    db.session.execute('select transfer_mine_manager_information();')
    db.session.execute('commit;')
    db.session.execute('select transfer_permit_permitee_information();')
    db.session.execute('commit;')
    db.session.execute('select transfer_mine_status_information();')
    db.session.execute('commit;')
