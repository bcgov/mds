import json

from celery.utils.log import get_task_logger

from app.extensions import db
from app.services.object_store_storage_service import ObjectStoreStorageService
from app.docman.models.document import Document
from app.tasks.celery import celery


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
        result = {
            'transfer_id': transfer_id,
            'chunk': chunk_index,
            'success': success,
            'message': message,
            'success_transfers': list(sorted(success_transfers)),
            'fail_transfers': list(sorted([i for i in doc_ids if i not in success_transfers])),
            'errors': errors
        }
        # Return the result of the transfer
        # if (not success):
        #     raise TaskFailure(result)

    except Exception as e:
        result = {
            'transfer_id': transfer_id,
            'chunk': chunk_index,
            'success': False,
            'message': f'An unexpected exception occurred: {e}',
            'success_transfers': [],
            'fail_transfers': [],
            'errors': []
        }

    result = json.dumps(result)
    return result


@celery.task()
def transfer_docs_result(transfer_results, transfer_id=None):
    logger = get_task_logger(transfer_id)
    logger.info(f'All tasks in transfer job with ID {transfer_id} have completed')

    transfer_results = [json.loads(transfer_result) for transfer_result in transfer_results]
    success_transfers = [
        doc_id for transfer_result in transfer_results
        for doc_id in transfer_result['success_transfers']
    ]
    fail_transfers = [
        doc_id for transfer_result in transfer_results
        for doc_id in transfer_result['fail_transfers']
    ]
    errors = [error for transfer_result in transfer_results for error in transfer_result['errors']]
    success_results = []
    for transfer_result in transfer_results:
        success_results.append(transfer_result['success'])

    result = {
        'transfer_id': transfer_id,
        'success': all(success_results),
        'success_transfers': list(sorted(success_transfers)),
        'fail_transfers': list(sorted(fail_transfers)),
        'errors': errors
    }
    result = json.dumps(result)
    logger.info(result)
    # if (all(success_results)):
    #     raise ChordFailure(result)
    return result
