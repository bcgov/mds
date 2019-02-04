import requests
from app.extensions import cache, sched
from app.api.nris_services import NRIS_service
from app.api.mines.mine.models.mine import Mine
from app.api.constants import NRIS_JOB_PREFIX, NRIS_MMLIST_JOB, NRIS_MAJOR_MINE_LIST, TIMEOUT_24_HOURS, TIMEOUT_60_MINUTES


#the schedule of these jobs is set using server time (UTC)
def _schedule_NRIS_jobs(app):
    app.apscheduler.add_job(
        func=_cache_major_mines_list, trigger='cron', id='get_major_mine_list', hour=22, minute=35)
    app.apscheduler.add_job(
        func=_cache_all_NRIS_major_mines_data,
        trigger='cron',
        id='get_major_mine_NRIS_data',
        hour=22,
        minute=40)


# caches a list of mine numbers for all major mines and each major mine indavidually
# to indicate whether of not it has been processed.
def _cache_major_mines_list():
    with sched.app.app_context():
        cache.set(NRIS_JOB_PREFIX + NRIS_MMLIST_JOB, 'True', timeout=TIMEOUT_24_HOURS)
        major_mines = Mine.query.unbound_unsafe().filter_by(major_mine_ind=True).all()
        major_mine_list = []
        for mine in major_mines:
            major_mine_list.append(mine.mine_no)
            cache.set(NRIS_JOB_PREFIX + mine.mine_no, 'False', timeout=TIMEOUT_60_MINUTES)
        cache.set(
            NRIS_JOB_PREFIX + NRIS_MAJOR_MINE_LIST, major_mine_list, timeout=TIMEOUT_60_MINUTES)


# Using the cached list of major mines procees them if they are not already set to true.
def _cache_all_NRIS_major_mines_data():
    with sched.app.app_context():
        major_mine_list = cache.get(NRIS_JOB_PREFIX + NRIS_MAJOR_MINE_LIST)
        if major_mine_list is None:
            return

        for mine in major_mine_list:
            if cache.get(NRIS_JOB_PREFIX + mine) == 'False':
                cache.set(NRIS_JOB_PREFIX + mine, 'True', timeout=TIMEOUT_60_MINUTES)
                try:
                    data = NRIS_service._get_EMPR_data_from_NRIS(mine)
                except requests.exceptions.Timeout:
                    pass
                except requests.exceptions.HTTPError as errhttp:
                    #log error
                    pass
                except TypeError as e:
                    #log error
                    pass

                if data is not None and len(data) > 0:
                    NRIS_service._process_NRIS_data(data, mine)
