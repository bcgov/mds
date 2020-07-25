import json

from celery.utils.log import get_task_logger

from app.extensions import db
from app.services.object_store_storage_service import ObjectStoreStorageService
from app.docman.models.document import Document
from app.tasks.celery import celery, doc_task_result


@celery.task()
def transfer_docs(transfer_id, doc_ids, chunk_index):
    result = None
    try:
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
                uploaded, key = ObjectStoreStorageService().upload_file(
                    filename=doc.full_storage_path)

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
                errors.append({'exception': str(e), 'document': doc.task_json()})

        # Determine the result of the transfer
        success = len(errors) == 0
        message = 'All required documents were transferred' if success else 'Transfer finished with errors'
        result = doc_task_result(
            job_id=transfer_id,
            task_id=transfer_docs.request.id,
            chunk=chunk_index,
            success=success,
            message=message,
            success_docs=success_transfers,
            errors=errors,
            doc_ids=doc_ids)

    except Exception as e:
        message = f'An unexpected exception occurred: {e}'
        logger.error(message)
        result = doc_task_result(
            job_id=transfer_id,
            task_id=transfer_docs.request.id,
            chunk=chunk_index,
            success=False,
            message=message,
            success_docs=[],
            errors=[],
            doc_ids=doc_ids)

    # Return the result of the transfer
    return result
