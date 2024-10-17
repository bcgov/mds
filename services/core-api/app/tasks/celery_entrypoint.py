
from app import create_app

from .celery import celery

celery_app = create_app()
