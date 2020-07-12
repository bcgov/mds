from app.services.object_store_storage_service import ObjectStoreStorageService
from app.docman.models.document import Document
from app import make_celery
from app.extensions import db
from celery.utils.log import get_task_logger

# logger = get_logger()

celery = make_celery()


class TaskFailure(Exception):
    pass


@celery.task()
def transfer_docs(transfer_id, document_ids, chunk):
    logger = get_task_logger(transfer_id)
    chunk_prefix = f'[Chunk {chunk}]:'

    # Get the documents to transfer
    docs = Document.query.filter(Document.document_id.in_(document_ids)).all()

    # Transfer the documents
    errors = []
    for i, doc in enumerate(docs):
        doc_prefix = f'[Chunk {chunk}, Doc {i + 1}/{len(docs)}, ID {doc.document_id}]:'
        logger.info(f'{doc_prefix} Transferring...')
        try:
            # Upload the file to the object store
            uploaded, key = ObjectStoreStorageService().upload_file(filename=doc.full_storage_path)

            # Update the object store path of the document
            db.session.rollback()
            db.session.add(doc)
            doc.object_store_path = key
            doc.update_user = 'mds'
            db.session.commit()
            logger.info(f'{doc_prefix} Transfer {"COMPLETE" if uploaded else "UNNECESSARY"}')
        except Exception as e:
            logger.error(f'{doc_prefix} Transfer ERROR\n{e}')
            errors.append({'exception': str(e), 'document': doc.json()})

    # If there are any errors, consider the task to have failed
    if (len(errors) > 0):
        raise TaskFailure(f'{chunk_prefix} Transfer finished with ERRORS:\n{errors}')

    # Determine and return the result of the transfer
    result = {'chunk': chunk, 'success': True, 'message': 'All required documents were transferred'}
    return result


@celery.task()
def transfer_docs_result(transfer_result, transfer_id=None):
    logger = get_task_logger(transfer_id)
    logger.info(f'All tasks in TRANSFER job with ID {transfer_id} have completed execution.')
    return {'transfer_id': transfer_id, 'transfer_result': transfer_result}


@celery.task()
def verify_docs(verify_id, document_ids, chunk):
    logger = get_task_logger(verify_id)
    chunk_prefix = f'[Chunk {chunk}]:'

    # Get the documents to verify
    docs = Document.query.filter(Document.document_id.in_(document_ids)).all()

    # Verify the documents
    errors = []
    unequal = []
    for i, doc in enumerate(docs):
        doc_prefix = f'[Chunk {chunk}, Doc {i + 1}/{len(docs)}, ID {doc.document_id}]:'
        logger.info(f'{doc_prefix} Verifying...')
        try:
            equal = ObjectStoreStorageService().compare_etag(filename=doc.full_storage_path)
            if (equal):
                logger.info(f'{doc_prefix} Verification PASSED')
            else:
                unequal.append(doc.document_id)
                logger.info(f'{doc_prefix} Verification FAILED')
        except Exception as e:
            logger.error(f'{doc_prefix} Verification ERROR\n{e}')
            errors.append({'exception': str(e), 'document': doc.json()})

    # If there are any errors, consider the task to have failed
    if (len(errors) > 0):
        raise TaskFailure(f'{chunk_prefix} Verification finished with ERRORS:\n{errors}')

    # Determine and return the result of the verification
    success = len(unequal) == 0
    result = {
        'chunk':
        chunk,
        'success':
        success,
        'message':
        'All tested documents passed verification'
        if success else f'{len(unequal)}/{len(docs)} document(s) failed verification: {unequal}'
    }
    return result


@celery.task()
def verify_docs_result(verify_result, verify_id=None):
    logger = get_task_logger(verify_id)
    logger.info(f'All tasks in VERIFICATION job with ID {verify_id} have completed execution.')
    return {'verify_id': verify_id, 'verify_result': verify_result}
