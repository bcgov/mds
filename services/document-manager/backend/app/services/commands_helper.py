import numpy
import uuid
import os

from flask import current_app
from sqlalchemy import and_
from celery import chord

from app.docman.models.document import Document
from app.utils.access_decorators import requires_any_of, MINE_ADMIN
from app.services.object_store_storage_service import ObjectStoreStorageService

from app.tasks.celery import doc_job_result
from app.tasks.transfer import transfer_docs
from app.tasks.verify import verify_docs
from app.tasks.reorganize import reorganize_docs


def transfer_local_files_to_object_store(wait):

    # Get the documents that aren't stored on the object store (return if they all are)
    docs = Document.query.filter_by(object_store_path=None).all()
    if len(docs) == 0:
        return 'No documents need to be transferred'

    # Split the list of documents to transfer into N chunks to upload in parallel
    chunks = numpy.array_split(docs, 8)
    chunks = [x.tolist() for x in chunks if len(x) > 0]

    # Create the transfer tasks
    tasks = []
    job_id = str(uuid.uuid4())
    for i, chunk in enumerate(chunks):
        doc_ids = [doc.document_id for doc in chunk]
        tasks.append(transfer_docs.subtask((job_id, doc_ids, i)))

    # Start the transfer tasks
    callback = doc_job_result.subtask(kwargs={'job_type': 'transfer', 'job_id': job_id})
    job = chord(tasks)(callback)

    # Create the response message
    message = f'Added transfer job with ID {job_id} to the task queue: {len(docs)} docs will be transferred in {len(chunks)} chunks of size {len(chunks[0])}'
    current_app.logger.info(message)
    current_app.logger.debug(chunks)

    if (wait):
        current_app.logger.info('Waiting for job to finish...')
        result = job.get()
        return result

    return message


def verify_transferred_objects(wait):
    # Get the documents that are stored on the object store (return if there are none)
    docs = Document.query.filter(Document.object_store_path != None).all()
    if len(docs) == 0:
        return 'No documents are stored on the object store'

    # Split the list of documents to verify into N chunks to verify in parallel
    chunks = numpy.array_split(docs, 8)
    chunks = [x.tolist() for x in chunks if len(x) > 0]

    # Create the verification tasks
    tasks = []
    job_id = str(uuid.uuid4())
    for i, chunk in enumerate(chunks):
        doc_ids = [doc.document_id for doc in chunk]
        tasks.append(verify_docs.subtask((job_id, doc_ids, i)))

    # Start the verification tasks
    callback = doc_job_result.subtask(kwargs={'job_type': 'verify', 'job_id': job_id})
    job = chord(tasks)(callback)

    # Create the response message
    message = f'Added verification job with ID {job_id} to the task queue: {len(docs)} docs will be verified in {len(chunks)} chunks of size {len(chunks[0])}'
    current_app.logger.info(message)
    current_app.logger.debug(chunks)

    if (wait):
        current_app.logger.info('Waiting for job to finish...')
        result = job.get()
        return result

    return message


def reorganize_files(wait):
    # Get the documents that are stored on the object store but not organized into the proper directory structure (return if there are none)
    docs = Document.query.filter(
        and_(Document.object_store_path != None,
             ~Document.object_store_path.contains(Document.full_storage_path))).all()
    if len(docs) == 0:
        return 'No documents need to be reorganized'

    # Split the list of documents to reorganize into N chunks to reorganize in parallel
    chunks = numpy.array_split(docs, 8)
    chunks = [x.tolist() for x in chunks if len(x) > 0]

    # Create the reorganize tasks
    tasks = []
    job_id = str(uuid.uuid4())
    for i, chunk in enumerate(chunks):
        doc_ids = [doc.document_id for doc in chunk]
        tasks.append(reorganize_docs.subtask((job_id, doc_ids, i)))

    # Start the reorganize tasks
    callback = doc_job_result.subtask(kwargs={'job_type': 'reorganize', 'job_id': job_id})
    job = chord(tasks)(callback)

    # Create the response message
    message = f'Added reorganize job with ID {job_id} to the task queue: {len(docs)} docs will be reorganized in {len(chunks)} chunks of size {len(chunks[0])}'
    current_app.logger.info(message)
    current_app.logger.debug(chunks)

    if (wait):
        current_app.logger.info('Waiting for job to finish...')
        result = job.get()
        return result

    return message


def get_untransferred_files(path):
    docs = Document.query.filter_by(object_store_path=None).all()
    untransferred = [doc.full_storage_path if path else doc.document_id for doc in docs]
    return untransferred


def get_missing_files(path):
    docs = Document.query.all()
    missing = []
    for doc in docs:
        if (not os.path.isfile(doc.full_storage_path)):
            missing.append(doc.full_storage_path if path else doc.document_id)
    return missing


def get_unregistered_files(path):

    # Validate the path
    if (not os.path.isdir(path)):
        raise Exception('Path does not exist')
    if (not os.path.isabs(path)):
        raise Exception('Path is not absolute')

    # Get all files under the path
    files = []
    for dirpath, dirnames, filenames in os.walk(path):
        for filename in filenames:
            files.append(os.path.join(dirpath, filename))

    # Get all files that aren't associated with a Document record
    unregistered = []
    for file in files:
        doc = Document.query.filter_by(full_storage_path=file).first()
        if (not doc):
            unregistered.append(file)
    return unregistered
