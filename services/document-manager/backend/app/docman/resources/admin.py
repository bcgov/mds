import os
import sys
from app.services.object_store_storage_service import ObjectStoreStorageService

from werkzeug.exceptions import BadRequest
from flask import current_app
from flask_restplus import Resource, reqparse

from app.docman.models.document import Document
from app.extensions import api
# from app.utils.flask_celery import celery
from app.utils.access_decorators import requires_any_of, MINE_ADMIN
from celery import Celery


def make_celery(app):
    celery = Celery(
        app.import_name,
        backend=app.config['CELERY_RESULT_BACKEND'],
        broker=app.config['CELERY_BROKER_URL'])
    celery.conf.update(app.config)
    app.logger.info('***************************')
    app.logger.info(app.import_name)

    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

    celery.Task = ContextTask
    return celery


@api.route('/admin/transfer-file-system-to-object-store')
class TransferFileSystemToObjectStore(Resource):
    CELERY = make_celery(None)

    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('secret', type=str, required=True, help='Secret')

    # @requires_any_of([MINE_ADMIN])
    def post(self):

        # Ensure that the secret to initiate the transfer is correct
        data = self.parser.parse_args()
        secret = data.get('secret')
        if (secret != 'd053c125-eb4b-44ba-8560-e83d716dfb0c'):
            raise BadRequest()

        # Initiate the transfer process
        # docs = Document.query.filter_by(object_store_path=None).all()

        # def chunks(lst, n):
        #     for i in range(0, len(lst), n):
        #         yield lst[i:i + n]

        # docs_chunks = chunks(docs, 4)
        # # current_app.logger.info(f'docs_chunks len: {len(docs_chunks)}')

        # for i, chunk in enumerate(docs_chunks):
        #     # current_app.logger.info(f'chunk_index: {i}')
        #     transfer_docs.delay(chunk, i)

        CELERY = make_celery(current_app)
        # celery.start()

        result = self.transfer_docs.delay()
        result.wait()

        return 'Initiated transfer', 201

    @CELERY.task()
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