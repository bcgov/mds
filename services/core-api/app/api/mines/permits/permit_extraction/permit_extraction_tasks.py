from app.extensions import db
from app.tasks.celery import celery

@celery.task()
def initialize_permit_extraction(document_manager_guid):
    document = ""