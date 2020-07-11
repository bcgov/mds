from app.services.object_store_storage_service import ObjectStoreStorageService
from app.docman.models.document import Document
from app import make_celery
from flask import current_app
from app.extensions import db

celery = make_celery()


class TaskFailure(Exception):
    pass


@celery.task
def transfer_docs(transfer_id, document_ids, chunk_index):
    print(f'{transfer_id}: Chunk {chunk_index} transferring {len(document_ids)} docs')

    # Get the documents to transfer
    # TODO: If this task was resumed, could also filter the list by documents that don't have object_store_path set, and/or, verify checksums.
    docs = Document.query.filter(Document.document_id.in_(document_ids)).all()
    print(docs)

    # Transfer the documents
    errors = []
    for i, doc in enumerate(docs):
        try:
            print(
                f'{transfer_id}: Starting transfer of document #{i} with ID {doc.document_id} from chunk {chunk_index}'
            )
            object_store_key = ObjectStoreStorageService().upload_file(
                file_name=doc.full_storage_path)
            db.session.rollback()
            db.session.add(doc)
            doc.object_store_path = object_store_key
            doc.update_user = 'mds'
            db.session.commit()
            print(
                f'{transfer_id}: Completed transfer of document #{i} with ID {doc.document_id} from chunk {chunk_index}'
            )

        except Exception as e:
            message = f'{transfer_id}: Failed to transfer document with ID {doc.document_id}: {e}'
            print(message)
            errors.append([message, doc.json()])

    # Determine if the task failed
    print(f'{transfer_id}: Chunk {chunk_index} completed with {len(errors)} errors')
    if (len(errors) > 0):
        raise TaskFailure(
            f'{transfer_id}: Failed to successfully complete the transfer with the following errors:\n{errors}'
        )

    return f'{transfer_id}: Successfully completed the transfer'
