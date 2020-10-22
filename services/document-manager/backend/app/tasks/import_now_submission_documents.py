import json

from celery.utils.log import get_task_logger

from app.extensions import db
from app.services.object_store_storage_service import ObjectStoreStorageService
from app.docman.models.document import Document
from app.tasks.celery import celery, doc_task_result
from app.config import Config


@celery.task()
def import_now_submission_documents(import_id, doc_ids, chunk_index):
    return