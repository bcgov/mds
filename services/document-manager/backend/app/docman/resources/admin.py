import numpy
import uuid

from werkzeug.exceptions import Forbidden
from flask import current_app
from flask_restplus import Resource, reqparse
from celery import chord

from app.docman.models.document import Document
from app.utils.access_decorators import requires_any_of, MINE_ADMIN
from app.services.object_store_storage_service import ObjectStoreStorageService
from app.config import Config


class TransferDocsToObjectStore(Resource):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('secret', type=str, required=True)

    @requires_any_of([MINE_ADMIN])
    def post(self):
        # Ensure that the admin API secret required to initiate the transfer is correct
        data = self.parser.parse_args()
        secret = data.get('secret')
        if (Config.ADMIN_API_SECRET is None or secret != Config.ADMIN_API_SECRET):
            raise Forbidden()

        return self.transfer_task()

    def transfer_task(self):
        from app.utils.tasks import transfer_docs, transfer_docs_result

        # Get the documents that aren't stored on the object store (return if they all are)
        docs = Document.query.filter_by(object_store_path=None).all()
        if len(docs) == 0:
            return 'No documents need to be transferred', 200

        # Split the list of documents to transfer into N chunks to upload in parallel
        chunks = numpy.array_split(docs, 8)
        chunks = [x.tolist() for x in chunks if len(x) > 0]

        # Create the transfer tasks
        tasks = []
        transfer_id = str(uuid.uuid4())
        for i, chunk in enumerate(chunks):
            doc_ids = [doc.document_id for doc in chunk]
            tasks.append(transfer_docs.subtask((transfer_id, doc_ids, i)))

        # Start the transfer tasks
        callback = transfer_docs_result.subtask(kwargs={'transfer_id': transfer_id})
        chord(tasks)(callback)

        # Create the response message
        message = f'Added transfer job with ID {transfer_id} to the task queue: {len(docs)} docs will be transferred in {len(chunks)} chunks of size {len(chunks[0])}'
        current_app.logger.info(message)
        current_app.logger.debug(chunks)

        return message, 202


class CompareDocsOnObjectStore(Resource):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('secret', type=str, required=True)

    @requires_any_of([MINE_ADMIN])
    def post(self):
        # Ensure that the admin API secret required to initiate the verification is correct
        data = self.parser.parse_args()
        secret = data.get('secret')
        if (Config.ADMIN_API_SECRET is None or secret != Config.ADMIN_API_SECRET):
            raise Forbidden()

        return self.verify_task()

    def verify_task(self):
        from app.utils.tasks import verify_docs, verify_docs_result

        # Get the documents that are stored on the object store (return if there are none)
        docs = Document.query.filter(Document.object_store_path != None).all()
        if len(docs) == 0:
            return 'No documents are stored on the object store', 200

        # Split the list of documents to verify into N chunks to verify in parallel
        chunks = numpy.array_split(docs, 8)
        chunks = [x.tolist() for x in chunks if len(x) > 0]

        # Create the verification tasks
        tasks = []
        verify_id = str(uuid.uuid4())
        for i, chunk in enumerate(chunks):
            doc_ids = [doc.document_id for doc in chunk]
            tasks.append(verify_docs.subtask((verify_id, doc_ids, i)))

        # Start the verification tasks
        callback = verify_docs_result.subtask(kwargs={'verify_id': verify_id})
        chord(tasks)(callback)

        # Create the response message
        message = f'Added verification job with ID {verify_id} to the task queue: {len(docs)} docs will be verified in {len(chunks)} chunks of size {len(chunks[0])}'
        current_app.logger.info(message)
        current_app.logger.debug(chunks)

        return message, 202


class GetUntransferredFiles(Resource):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('secret', type=str, required=True)

    @requires_any_of([MINE_ADMIN])
    def post(self):

        # Ensure that the admin API secret is correct
        data = self.parser.parse_args()
        secret = data.get('secret')
        if (Config.ADMIN_API_SECRET is None or secret != Config.ADMIN_API_SECRET):
            raise Forbidden()

        return self.get_untransferred_files()

    def get_untransferred_files(self):
        # Get and return the documents that aren't stored on the object store
        docs = Document.query.filter_by(object_store_path=None).all()
        doc_jsons = [doc.json() for doc in docs]
        return doc_jsons, 200
