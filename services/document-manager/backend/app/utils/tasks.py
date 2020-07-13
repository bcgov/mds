import numpy

from celery.utils.log import get_task_logger

from app import make_celery
from app.extensions import db
from app.services.object_store_storage_service import ObjectStoreStorageService
from app.docman.models.document import Document

celery = make_celery()


class TaskFailure(Exception):
    pass


@celery.task()
def transfer_docs(transfer_id, doc_ids, chunk_index):
    logger = get_task_logger(transfer_id)

    # Get the documents to transfer
    docs = Document.query.filter(Document.document_id.in_(sorted(doc_ids))).all()

    # Transfer the documents
    errors = []
    success_transfers = []
    for i, doc in enumerate(docs):
        doc_prefix = f'[Chunk {chunk_index}, Doc {i + 1}/{len(docs)}, ID {doc.document_id}]:'
        logger.info(f'{doc_prefix} Transferring...')
        try:
            # Upload the file to the object store
            uploaded, key = ObjectStoreStorageService().upload_file(filename=doc.full_storage_path)

            # Update the document's object store path
            db.session.rollback()
            db.session.add(doc)
            doc.object_store_path = key
            doc.update_user = 'mds'
            db.session.commit()
            success_transfers.append(doc.document_id)
            logger.info(f'{doc_prefix} Transfer {"COMPLETE" if uploaded else "UNNECESSARY"}')
        except Exception as e:
            logger.error(f'{doc_prefix} Transfer ERROR\n{e}')
            errors.append({'exception': str(e), 'document': doc.json()})

    # Determine the result of the transfer
    success = len(errors) == 0
    message = 'All required documents were transferred' if success else 'Transfer finished with errors'
    result = {
        'transfer_id': transfer_id,
        'chunk': chunk_index,
        'success': success,
        'message': message,
        'success_transfers': sorted(success_transfers),
        'fail_transfers': sorted(list(numpy.setdiff1d(doc_ids, success_transfers))),
        'errors': errors
    }

    # Return the result of the transfer
    if (not success):
        raise TaskFailure(result)
    return result


@celery.task()
def transfer_docs_result(transfer_results, transfer_id=None):
    logger = get_task_logger(transfer_id)
    logger.info(f'All tasks in transfer job with ID {transfer_id} have completed')
    success_transfers = [
        doc_id for transfer_result in transfer_results
        for doc_id in transfer_result['success_transfers']
    ]
    fail_transfers = [
        doc_id for transfer_result in transfer_results
        for doc_id in transfer_result['fail_transfers']
    ]
    errors = [error for transfer_result in transfer_results for error in transfer_result['errors']]
    return {
        'transfer_id': transfer_id,
        'success_transfers': sorted(success_transfers),
        'fail_transfers': sorted(fail_transfers),
        'errors': errors
    }


@celery.task()
def verify_docs(verify_id, doc_ids, chunk_index):
    logger = get_task_logger(verify_id)

    # Get the documents to verify
    docs = Document.query.filter(Document.document_id.in_(doc_ids)).all()

    # Verify the documents
    errors = []
    unequal = []
    success_verifications = []
    for i, doc in enumerate(docs):
        doc_prefix = f'[Chunk {chunk_index}, Doc {i + 1}/{len(docs)}, ID {doc.document_id}]:'
        logger.info(f'{doc_prefix} Verifying...')
        try:
            equal = ObjectStoreStorageService().compare_etag(filename=doc.full_storage_path)
            if (equal):
                success_verifications.append(doc.document_id)
                logger.info(f'{doc_prefix} Verification PASSED')
            else:
                unequal.append(doc.document_id)
                logger.info(f'{doc_prefix} Verification FAILED')
        except Exception as e:
            logger.error(f'{doc_prefix} Verification ERROR\n{e}')
            errors.append({'exception': str(e), 'document': doc.json()})

    # Determine the result of the verification
    success = len(unequal) == 0 and len(errors) == 0
    message = 'All tested documents passed verification' if success else f'{len(unequal)}/{len(docs)} document(s) failed verification: {unequal}'
    result = {
        'verify_id': verify_id,
        'chunk': chunk_index,
        'success': success,
        'message': message,
        'success_verifications': sorted(success_verifications),
        'fail_verifications': sorted(list(numpy.setdiff1d(doc_ids, success_verifications))),
        'errors': errors
    }

    # Return the result of the verification
    if (not success):
        raise TaskFailure(result)
    return result


@celery.task()
def verify_docs_result(verify_results, verify_id=None):
    logger = get_task_logger(verify_id)
    logger.info(f'All tasks in verification job with ID {verify_id} have completed')
    success_verifications = [
        doc_id for verify_result in verify_results
        for doc_id in verify_result['success_verifications']
    ]
    fail_verifications = [
        doc_id for verify_result in verify_results for doc_id in verify_result['fail_verifications']
    ]
    errors = [error for verify_result in verify_results for error in verify_result['errors']]
    return {
        'verify_id': verify_id,
        'success_verifications': sorted(success_verifications),
        'fail_verifications': sorted(fail_verifications),
        'errors': errors
    }
