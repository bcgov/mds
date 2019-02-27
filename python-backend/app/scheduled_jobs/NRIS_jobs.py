import requests
from app.extensions import cache, sched
from app.api.nris_services import NRIS_service
from app.api.mines.mine.models.mine import Mine
from app.api.constants import NRIS_JOB_PREFIX, NRIS_MMLIST_JOB, NRIS_MAJOR_MINE_LIST, TIMEOUT_24_HOURS, TIMEOUT_60_MINUTES
from app.api.utils.apm import register_apm
from concurrent.futures import ThreadPoolExecutor, as_completed


# The schedule of these jobs is set using server time (UTC)

# caches a list of mine numbers for all major mines and each major mine individually
# to indicate whether of not it has been processed.
@register_apm
@sched.task('cron', id='get_major_mine_list', hour=4, minute=35)
def _cache_major_mines_list():
    with sched.app.app_context():
        job_running = cache.get(NRIS_JOB_PREFIX + NRIS_MMLIST_JOB)
        if job_running is None:
            cache.set(NRIS_JOB_PREFIX + NRIS_MMLIST_JOB, 'True', timeout=TIMEOUT_24_HOURS)
            major_mines = Mine.query.unbound_unsafe().filter_by(major_mine_ind=True).all()
            major_mine_list = []
            for mine in major_mines:
                major_mine_list.append(mine.mine_no)
                cache.set(NRIS_JOB_PREFIX + mine.mine_no, 'False', timeout=TIMEOUT_60_MINUTES)
            cache.set(
                NRIS_JOB_PREFIX + NRIS_MAJOR_MINE_LIST, major_mine_list, timeout=TIMEOUT_60_MINUTES)


# Using the cached list of major mines process them if they are not already set to true.
@register_apm
@sched.task('cron', id='get_major_mine_NRIS_data', hour=4, minute=40)
def _cache_all_NRIS_major_mines_data():
    with sched.app.app_context():
        major_mine_list = cache.get(NRIS_JOB_PREFIX + NRIS_MAJOR_MINE_LIST)
        if major_mine_list is None:
            return

        with ThreadPoolExecutor() as executor:
            mines_cache_task_list = {executor.submit(_process_NRIS_data_for_mine, mine): mine for mine in major_mine_list}

        for mine in as_completed(mines_cache_task_list):
            current_mine = mines_cache_task_list[mine]
            print('Thread completed for mine: ', current_mine)


def _process_NRIS_data_for_mine(mine):
    with sched.app.app_context():
        if cache.get(NRIS_JOB_PREFIX + mine) == 'False':
            cache.set(NRIS_JOB_PREFIX + mine, 'True', timeout=TIMEOUT_60_MINUTES)
            try:
                data = NRIS_service._get_EMPR_data_from_NRIS(mine)
            except requests.exceptions.Timeout:
                pass
            except requests.exceptions.HTTPError as errhttp:
                # log error
                pass
            except TypeError as e:
                # log error
                pass

            NRIS_service._process_NRIS_data(data, mine)
