import logging
import os

import celery

logger = logging.getLogger(__name__)
CACHE_REDIS_HOST = os.environ.get('CACHE_REDIS_HOST', 'redis')
CACHE_REDIS_PORT = os.environ.get('CACHE_REDIS_PORT', 6379)
CACHE_REDIS_PASS = os.environ.get('CACHE_REDIS_PASS', 'redis-password')
CACHE_REDIS_URL = 'redis://:{0}@{1}:{2}'.format(CACHE_REDIS_PASS, CACHE_REDIS_HOST,
                                                    CACHE_REDIS_PORT)

celery_app = celery.Celery(__name__, broker=CACHE_REDIS_URL, backend='app.celery.elasticsearch_backend:MDSElasticSearchBackend')

celery_app.conf.task_default_queue = 'permits'
celery_app.autodiscover_tasks([
    'app.permit_conditions.tasks',
])
