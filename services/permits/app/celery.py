import os

from celery.app import Celery

CACHE_REDIS_HOST = os.environ.get('CACHE_REDIS_HOST', 'redis')
CACHE_REDIS_PORT = os.environ.get('CACHE_REDIS_PORT', 6379)
CACHE_REDIS_PASS = os.environ.get('CACHE_REDIS_PASS', 'redis-password')
CACHE_REDIS_URL = 'redis://:{0}@{1}:{2}'.format(CACHE_REDIS_PASS, CACHE_REDIS_HOST,
                                                    CACHE_REDIS_PORT)


celery_app = Celery(__name__, broker=CACHE_REDIS_URL)

ca_cert = os.environ.get("ELASTICSEARCH_CA_CERT", None)
host = os.environ.get("ELASTICSEARCH_HOST", None) or "http://elasticsearch:9200"
username = os.environ.get("ELASTICSEARCH_USERNAME", "")
password = os.environ.get("ELASTICSEARCH_PASSWORD", "")


scheme, hostname = host.split('://')

backend_url = f'elasticsearch+{scheme}://{username}:{password}@{hostname}/celery'
celery_app = Celery(__name__, broker=CACHE_REDIS_URL, backend=backend_url)
celery_app.backend.doc_type = None
celery_app.conf.task_default_queue = 'permits'
celery_app.autodiscover_tasks([
    'app.permit_conditions.tasks',
])
