import numpy

from celery.utils.log import get_task_logger

from app import make_celery
from app.extensions import db
from app.services.object_store_storage_service import ObjectStoreStorageService
from app.docman.models.document import Document
from app.config import Config

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
            equal = ObjectStoreStorageService().compare_etag(
                filename=doc.full_storage_path, key=doc.object_store_path)
            if (equal):
                success_verifications.append(doc.document_id)
                logger.info(f'{doc_prefix} Verification PASSED')
            else:
                unequal.append(doc.document_id)
                logger.info(f'{doc_prefix} Verification FAILED')
        except Exception as e:
            unequal.append(doc.document_id)
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


@celery.task()
def reorganize_docs(reorganize_id, doc_ids, chunk_index):
    logger = get_task_logger(reorganize_id)

    # Get the documents to reorganize
    docs = Document.query.filter(Document.document_id.in_(doc_ids)).all()

    # Reorganize the documents
    errors = []
    success_reorganized = []
    for i, doc in enumerate(docs):
        doc_prefix = f'[Chunk {chunk_index}, Doc {i + 1}/{len(docs)}, ID {doc.document_id}]:'
        logger.info(f'{doc_prefix} Reorganizing...')
        try:
            # If the object store path already contains the full storage path, it is already organized
            if doc.full_storage_path in doc.object_store_path:
                success_reorganized.append(doc.document_id)
                logger.info(f'{doc_prefix} Reorganize UNNECESSARY')

            # Copy the file to its proper more organized location
            old_key = doc.object_store_path
            new_key = f'{Config.S3_PREFIX}{doc.full_storage_path[1:]}'
            ObjectStoreStorageService().copy_file(copy_source=old_key, key=new_key)

            # Ensure that the ETag of the copied file and the old file are equal
            if (ObjectStoreStorageService().s3_etag(old_key) !=
                    ObjectStoreStorageService().s3_etag(new_key)):
                raise Exception('ETag of the moved file and old file do not match!')

            # Update the document's object store path
            db.session.rollback()
            db.session.add(doc)
            doc.object_store_path = new_key
            doc.update_user = 'mds'
            db.session.commit()

            # Delete the old file and its .info file (if it had one)
            ObjectStoreStorageService().delete_file(key=old_key)
            ObjectStoreStorageService().delete_file(key=f'{old_key}.info')

            # Reorganization was achieved
            success_reorganized.append(doc.document_id)
            logger.info(f'{doc_prefix} Reorganize COMPLETE')

        except Exception as e:
            logger.error(f'{doc_prefix} Reorganize ERROR\n{e}')
            errors.append({'exception': str(e), 'document': doc.json()})

    # Determine the result of the reorganization
    success = len(errors) == 0
    message = 'All tested documents passed reorganization' if success else f'{len(errors)}/{len(docs)} document(s) failed reorganization'
    result = {
        'reorganize_id': reorganize_id,
        'chunk': chunk_index,
        'success': success,
        'message': message,
        'success_reorganized': sorted(success_reorganized),
        'fail_reorganized': sorted(list(numpy.setdiff1d(doc_ids, success_reorganized))),
        'errors': errors
    }

    # Return the result of the reorganization
    if (not success):
        raise TaskFailure(result)
    return result


@celery.task()
def reorganize_docs_result(reorganize_results, reorganize_id=None):
    logger = get_task_logger(reorganize_id)
    logger.info(f'All tasks in reorganization job with ID {reorganize_id} have completed')
    success_reorganized = [
        doc_id for reorganize_result in reorganize_results
        for doc_id in reorganize_result['success_reorganized']
    ]
    fail_reorganized = [
        doc_id for reorganize_result in reorganize_results
        for doc_id in reorganize_result['fail_reorganized']
    ]
    errors = [
        error for reorganize_result in reorganize_results for error in reorganize_result['errors']
    ]
    return {
        'reorganize_id': reorganize_id,
        'success_reorganized': sorted(success_reorganized),
        'fail_reorganized': sorted(fail_reorganized),
        'errors': errors
    }
