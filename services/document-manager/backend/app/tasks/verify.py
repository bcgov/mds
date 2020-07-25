import json

from celery.utils.log import get_task_logger

from app.extensions import db
from app.services.object_store_storage_service import ObjectStoreStorageService
from app.docman.models.document import Document
from app.tasks.celery import celery, ChordFailure


@celery.task()
def verify_docs(verify_id, doc_ids, chunk_index):
    result = None
    try:
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
                errors.append({'exception': str(e), 'document': doc.task_json()})

        # Determine the result of the verification
        success = len(unequal) == 0 and len(errors) == 0
        message = 'All tested documents passed verification' if success else f'{len(unequal)}/{len(docs)} document(s) failed verification: {unequal}'
        result = {
            'verify_id': verify_id,
            'chunk': chunk_index,
            'success': success,
            'message': message,
            'success_verifications': list(sorted(success_verifications)),
            'fail_verifications':
            list(sorted([i for i in doc_ids if i not in success_verifications])),
            'errors': errors,
            'task_id': verify_docs.request.id
        }

    except Exception as e:
        logger.error(f'An unexpected exception occurred: {e}')
        result = {
            'verify_id': verify_id,
            'chunk': chunk_index,
            'success': False,
            'message': f'An unexpected exception occurred: {e}',
            'success_verifications': [],
            'fail_verifications': [],
            'errors': [],
            'task_id': verify_docs.request.id
        }

    # Return the result of the verification
    result = json.dumps(result)
    return result


@celery.task()
def verify_docs_result(verify_results, verify_id=None):
    logger = get_task_logger(verify_id)
    logger.info(f'All tasks in verification job with ID {verify_id} have completed')

    verify_results = [json.loads(verify_result) for verify_result in verify_results]
    success_verifications = [
        doc_id for verify_result in verify_results
        for doc_id in verify_result['success_verifications']
    ]
    fail_verifications = [
        doc_id for verify_result in verify_results for doc_id in verify_result['fail_verifications']
    ]
    errors = [error for verify_result in verify_results for error in verify_result['errors']]
    success_results = []
    for verify_result in verify_results:
        success_result = verify_result['success']
        if (not success_result):
            verify_docs_result.update_state(
                task_id=verify_result['task_id'], state='FAILURE', meta=json.dumps(verify_result))
        success_results.append(success_result)

    success = all(success_results)
    result = {
        'verify_id': verify_id,
        'success': all(success_results),
        'success_verifications': list(sorted(success_verifications)),
        'fail_verifications': list(sorted(fail_verifications)),
        'errors': errors
    }
    result = json.dumps(result)
    logger.info(result)
    if (not success):
        raise ChordFailure(result)
    return result
