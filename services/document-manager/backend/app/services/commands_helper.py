import numpy
import uuid
import os

from flask import current_app
from sqlalchemy import and_
from celery import chord

from app.docman.models.document import Document
from app.docman.models.import_now_submission_documents_job import ImportNowSubmissionDocumentsJob
from app.tasks.celery import doc_job_result
from app.tasks.transfer import transfer_docs
from app.tasks.verify import verify_docs
from app.tasks.reorganize import reorganize_docs
from app.tasks.import_now_submission_documents import import_now_submission_documents


def create_transfer_files_job(wait):
    """Creates a job that transfers documents that exist at their full_storage_path to the object store."""
    docs = Document.query.filter_by(object_store_path=None).all()
    docs = [doc for doc in docs if os.path.isfile(doc.full_storage_path)]
    if (len(docs) == 0):
        return 'No documents need to be transferred'
    return start_job(wait, 'transfer', docs, transfer_docs)


def create_verify_files_job(wait):
    """Creates a job that verifies that documents that exist at their full_storage_path equal the file stored at their object_store_path."""
    docs = Document.query.filter(Document.object_store_path != None).all()
    docs = [doc for doc in docs if os.path.isfile(doc.full_storage_path)]
    if (len(docs) == 0):
        return 'No documents are stored on the object store'
    return start_job(wait, 'verify', docs, verify_docs)


def create_reorganize_files_job(wait):
    """Creates a job that reorganizes documents on the object store so that their key includes their full_storage_path."""
    docs = Document.query.filter(
        and_(Document.object_store_path != None,
             ~Document.object_store_path.contains(Document.full_storage_path))).all()
    if (len(docs) == 0):
        return 'No documents need to be reorganized'
    return start_job(wait, 'reorganize', docs, reorganize_docs)


def create_import_now_submission_documents(import_now_submission_documents_job_id):
    """Creates a job that imports a Notice of Work's submission documents to the object store."""

    # Get the Import NoW Document Job
    import_job = ImportNowSubmissionDocumentsJob.query.filter_by(
        import_now_submission_documents_job_id=import_now_submission_documents_job_id).one()

    # Create the task for this job
    import_now_submission_documents.delay(import_now_submission_documents_job_id)

    # Create the response message
    message = f'Added a Import Notice of Work Submission Documents job with ID {import_now_submission_documents_job_id} to the task queue: {len(import_job.import_now_submission_documents)} docs will be imported'
    current_app.logger.info(message)

    return message


def get_untransferred_files(path):
    """Returns a list of documents that have no object_store_path set."""
    docs = Document.query.filter_by(object_store_path=None).all()
    untransferred = [doc.full_storage_path if path else doc.document_id for doc in docs]
    return untransferred


def get_missing_files(path):
    """Returns a list of documents that do not exist at their full_storage_path."""
    docs = Document.query.all()
    missing = []
    for doc in docs:
        if (not os.path.isfile(doc.full_storage_path)):
            missing.append(doc.full_storage_path if path else doc.document_id)
    return missing


def get_unregistered_files(path):
    """Get files under the provided path that do not have a document record with it as its full_storage_path."""

    # Validate that the path exists and is absolute
    if (not os.path.isdir(path)):
        raise Exception('Path does not exist')
    if (not os.path.isabs(path)):
        raise Exception('Path is not absolute')

    # Get all files under the path
    files = []
    for dirpath, dirnames, filenames in os.walk(path):
        for filename in filenames:
            files.append(os.path.join(dirpath, filename))

    # Get all files that aren't associated with a document record
    unregistered = []
    for file in files:
        doc = Document.query.filter_by(full_storage_path=file).first()
        if (not doc):
            unregistered.append(file)
    return unregistered


def start_job(wait, job_type, docs, task):
    # Split the list of documents into chunks to perform on in parallel
    chunks = numpy.array_split(docs, 8)
    chunks = [x.tolist() for x in chunks if len(x) > 0]

    # Create a task for each chunk
    tasks = []
    job_id = str(uuid.uuid4())
    for i, chunk in enumerate(chunks):
        doc_ids = [doc.document_id for doc in chunk]
        tasks.append(task.subtask((job_id, doc_ids, i)))

    # Create and start a job using the tasks
    callback = doc_job_result.subtask(kwargs={'job_type': job_type, 'job_id': job_id})
    job = chord(tasks)(callback)

    # Create the response message
    message = f'Added a {job_type} job with ID {job_id} to the task queue: {len(docs)} docs will be performed on in {len(chunks)} chunks of size {len(chunks[0])}'
    current_app.logger.info(message)

    # If desired, wait for the job to finish and return its result
    if (wait):
        current_app.logger.info('Waiting for job to finish...')
        result = job.get()
        return result

    return message
