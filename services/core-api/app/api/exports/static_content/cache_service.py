
from app.extensions import cache
from app.api.constants import STATIC_CONTENT_KEY

def reset_static_content_cache():
    cache.delete(STATIC_CONTENT_KEY)
