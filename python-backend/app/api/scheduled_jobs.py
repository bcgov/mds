from app.extensions import cache, sched
from .nris_services import NRIS_service
from .mines.mine.models.mine import Mine
from .constants import NRIS_JOB_PREFIX, NRIS_MMLIST_JOB, NRIS_MAJOR_MINE_LIST, TIMEOUT_24_HOURS, TIMEOUT_30_MINUTES


def _schedule_jobs(app):
    app.apscheduler.add_job(
        func=_cache_major_mines_list, trigger='cron', id='get_major_mine_list', minute='*')
    app.apscheduler.add_job(
        func=_cache_all_NRIS_major_mines_data,
        trigger='cron',
        id='get_major_mine_NRIS_data',
        minute='*/30')


def _cache_major_mines_list():
    with sched.app.app_context():
        cache.set(NRIS_JOB_PREFIX + NRIS_MMLIST_JOB, 'True', timeout=TIMEOUT_24_HOURS)
        major_mines = Mine.find_all_major_mines()
        major_mine_list = []
        for mine in major_mines:
            major_mine_list.append(mine.mine_no)
            cache.set(NRIS_JOB_PREFIX + mine.mine_no, 'False', timeout=TIMEOUT_30_MINUTES)
        cache.set(
            NRIS_JOB_PREFIX + NRIS_MAJOR_MINE_LIST, major_mine_list, timeout=TIMEOUT_30_MINUTES)


def _cache_all_NRIS_major_mines_data():
    major_mine_list = cache.get(NRIS_JOB_PREFIX + NRIS_MAJOR_MINE_LIST)
    if major_mine_list is None:
        return

    for mine in major_mine_list:
        if cache.get(NRIS_JOB_PREFIX + mine) == 'False':
            cache.set(NRIS_JOB_PREFIX + mine, 'True', timeout=TIMEOUT_30_MINUTES)
            data = NRIS_service._get_EMPR_data_from_NRIS(mine)
            NRIS_service._process_NRIS_data(data, mine)
