import json

from celery.utils.log import get_task_logger

from app.extensions import db
from app.services.object_store_storage_service import ObjectStoreStorageService
from app.docman.models.document import Document
from app.tasks.celery import celery, doc_task_result


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
        result = doc_task_result(
            job_id=verify_id,
            task_id=verify_docs.request.id,
            chunk=chunk_index,
            success=success,
            message=message,
            success_docs=success_verifications,
            errors=errors,
            doc_ids=doc_ids)

    except Exception as e:
        logger.error(f'An unexpected exception occurred: {e}')
        result = doc_task_result(
            job_id=verify_id,
            task_id=verify_docs.request.id,
            chunk=chunk_index,
            success=False,
            message=f'An unexpected exception occurred: {e}',
            success_docs=[],
            errors=[],
            doc_ids=doc_ids)

    # Return the result of the verification
    return result
