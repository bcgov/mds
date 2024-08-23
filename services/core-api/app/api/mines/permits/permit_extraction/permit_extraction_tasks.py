from app.extensions import db
from app.tasks.celery import celery

@celery.task()
def initialize_permit_extraction(permit_amendment_guid, permit_amendment_document_guid):
