from app.services.object_store_storage_service import ObjectStoreStorageService

from app.docman.models.document import Document

from app import make_celery

celery = make_celery()


@celery.task
def transfer_docs():
    docs = Document.query.filter_by(object_store_path=None).all()
    # print(f'Chunk {chunk_index} transferring {len(docs)} docs')
    failures = []
    for i, doc in enumerate(docs):
        try:
            # print(f'Transferring doc #{i} from chunk {chunk_index}')
            key = ObjectStoreStorageService().upload_file(file_name=doc.full_storage_path)
            doc.object_store_path = key
            doc.save()
        except Exception as e:
            print(f'Failed to transfer document: {e}')
            failures.append(doc)
    # print(f'Chunk {chunk_index} failures: {failures}')