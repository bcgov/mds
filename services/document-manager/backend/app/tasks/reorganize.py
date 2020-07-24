import json

from celery.utils.log import get_task_logger

from app.extensions import db
from app.services.object_store_storage_service import ObjectStoreStorageService
from app.docman.models.document import Document
from app.config import Config
from app.tasks.celery import celery, ChordFailure


@celery.task()
def reorganize_docs(reorganize_id, doc_ids, chunk_index):
    result = None
    try:
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
                # if (chunk_index % 2 == 0):
                #     raise Exception('Fake exception!')

                # If the object store path already contains the full storage path, it is already organized
                if doc.full_storage_path in doc.object_store_path:
                    success_reorganized.append(doc.document_id)
                    logger.info(f'{doc_prefix} Reorganize UNNECESSARY')
                    continue

                # Ensure the file to copy exists
                old_key = doc.object_store_path
                if (not ObjectStoreStorageService().file_exists(old_key)):
                    raise Exception(f'File to copy does not exist: {old_key}')

                # Copy the file to its proper more organized location
                new_key = f'{Config.S3_PREFIX}{doc.full_storage_path[1:]}'
                ObjectStoreStorageService().copy_file(source_key=old_key, key=new_key)

                # Ensure that the file was copied to its new location
                if (not ObjectStoreStorageService().file_exists(new_key)):
                    raise Exception('Copied file does not exist at its new location!')

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
                errors.append({'exception': str(e), 'document': doc.task_json()})

        # Determine the result of the reorganization
        success = len(errors) == 0
        message = 'All tested documents passed reorganization' if success else f'{len(errors)}/{len(docs)} document(s) failed reorganization'
        result = {
            'reorganize_id': reorganize_id,
            'chunk': chunk_index,
            'success': success,
            'message': message,
            'success_reorganized': list(sorted(success_reorganized)),
            'fail_reorganized': list(sorted([i for i in doc_ids if i not in success_reorganized])),
            'errors': errors,
            'task_id': reorganize_docs.request.id
        }
        # Return the result of the reorganization
        # if (not success):
        #     raise TaskFailure(result)

    except Exception as e:
        result = {
            'reorganize_id': reorganize_id,
            'chunk': chunk_index,
            'success': False,
            'message': f'An unexpected exception occurred: {e}',
            'success_reorganized': [],
            'fail_reorganized': [],
            'errors': [],
            'task_id': reorganize_docs.request.id
        }

    result = json.dumps(result)
    return result


@celery.task()
def reorganize_docs_result(reorganize_results, reorganize_id=None):
    logger = get_task_logger(reorganize_id)
    logger.info(f'All tasks in reorganization job with ID {reorganize_id} have completed')

    reorganize_results = [json.loads(reorganize_result) for reorganize_result in reorganize_results]
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
    success_results = []
    for reorganize_result in reorganize_results:
        success_result = reorganize_result['success']
        if (not success_result):
            reorganize_docs_result.update_state(
                task_id=reorganize_result['task_id'],
                state='FAILURE',
                meta=json.dumps(reorganize_result))
        success_results.append(success_result)

    success = all(success_results)
    result = {
        'reorganize_id': reorganize_id,
        'success': success,
        'success_reorganized': list(sorted(success_reorganized)),
        'fail_reorganized': list(sorted(fail_reorganized)),
        'errors': errors
    }
    result = json.dumps(result)
    logger.info(result)
    if (not success):
        raise ChordFailure(result)
    return result
