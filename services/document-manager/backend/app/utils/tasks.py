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
def transfer_docs(transfer_id, document_ids, chunk_index):
    logger = get_task_logger(transfer_id)

    # Get the documents to transfer
    docs = Document.query.filter(Document.document_id.in_(document_ids)).all()

    # Transfer the documents
    errors = []
    for i, doc in enumerate(docs):
        try:
            logger.info(
                f'{transfer_id}: Starting transfer of document #{i} with ID {doc.document_id} from chunk {chunk_index}'
            )
            object_store_key = ObjectStoreStorageService().upload_file(
                filename=doc.full_storage_path, progress=True)
            db.session.rollback()
            db.session.add(doc)
            doc.object_store_path = object_store_key
            doc.update_user = 'mds'
            db.session.commit()
            logger.info(
                f'{transfer_id}: Completed transfer of document #{i} with ID {doc.document_id} from chunk {chunk_index}'
            )

        except Exception as e:
            message = f'{transfer_id}: Failed to transfer document with ID {doc.document_id}: {e}'
            logger.info(message)
            errors.append([message, doc.json()])

    # Determine if the task failed
    logger.info(f'{transfer_id}: Chunk {chunk_index} completed with {len(errors)} errors')
    if (len(errors) > 0):
        raise TaskFailure(
            f'{transfer_id}: Failed to successfully complete the transfer with the following errors:\n{errors}'
        )

    return f'{transfer_id}: Successfully completed the transfer'


@celery.task()
def transfer_docs_result(transfer_result, transfer_id=None):
    logger = get_task_logger(transfer_id)
    logger.info(f'All tasks in TRANSFER job with ID {transfer_id} have completed execution.')
    logger.info(transfer_result)


@celery.task()
def verify_docs(verify_id, document_ids, chunk_index):
    logger = get_task_logger(verify_id)

    # Get the documents to verify
    docs = Document.query.filter(Document.document_id.in_(document_ids)).all()

    # Verify the documents
    errors = []
    unequal_etag_doc_ids = []
    for i, doc in enumerate(docs):
        doc_prefix = f'[Chunk {chunk_index}, Doc {i + 1}/{len(docs)}, ID {doc.document_id}]:'
        try:
            etags_equal = ObjectStoreStorageService().compare_etag(filename=doc.full_storage_path)
            if (etags_equal):
                logger.info(f'{doc_prefix} Verification PASSED')
            else:
                unequal_etag_doc_ids.append(doc.document_id)
                logger.info(f'{doc_prefix} Verification FAILED')
        except Exception as e:
            logger.info(f'{doc_prefix} Verification ERROR\n{e}')
            errors.append([e, doc.json()])

    # Determine if the task failed
    logger.info(f'Chunk {chunk_index} completed with {len(errors)} errors')
    if (len(errors) > 0):
        raise TaskFailure(
            f'Failed to successfully complete the verification with the following errors:\n{errors}'
        )

    result = 'All tested documents passed verification' if len(
        unequal_etag_doc_ids
    ) == 0 else f'Some documents failed verification: {unequal_etag_doc_ids}'
    return f'{result}'


@celery.task()
def verify_docs_result(verify_result, verify_id=None):
    logger = get_task_logger(verify_id)
    logger.info(f'All tasks in VERIFICATION job with ID {verify_id} have completed execution.')
    logger.info(verify_result)
