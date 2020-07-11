import numpy
import uuid

from werkzeug.exceptions import BadRequest
from flask import current_app
from flask_restplus import Resource, reqparse

from app.extensions import api
from app.docman.models.document import Document
from app.utils.access_decorators import requires_any_of, MINE_ADMIN
from app.services.object_store_storage_service import ObjectStoreStorageService


@api.route('/admin/transfer-file-system-to-object-store')
class TransferFileSystemToObjectStore(Resource):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('secret', type=str, required=True, help='Secret')

    @requires_any_of([MINE_ADMIN])
    def post(self):
        from app.utils.tasks import transfer_docs

        # Ensure that the secret to initiate the transfer is correct
        data = self.parser.parse_args()
        secret = data.get('secret')
        if (secret != 'd053c125-eb4b-44ba-8560-e83d716dfb0c'):
            raise BadRequest()

        # Get the documents that aren't stored on the object store
        docs = Document.query.filter_by(object_store_path=None).order_by(Document.document_id).all()

        if len(docs) == 0:
            return 'No documents need to be transferred', 201

        transfer_id = str(uuid.uuid4())

        # Split the list of documents to transfer into N chunks to upload in parallel
        UPLOAD_CHUNKS = 8
        docs_chunks = numpy.array_split(docs, UPLOAD_CHUNKS)
        docs_chunks = [x.tolist() for x in docs_chunks if len(x) > 0]
        message = f'{transfer_id}: {len(docs)} files will be transferred in {len(docs_chunks)} chunks of size {len(docs_chunks[0])}'
        current_app.logger.info(message)
        current_app.logger.info(docs_chunks)

        # Start the transfer tasks
        for i, chunk in enumerate(docs_chunks):
            chunk_doc_data = [doc.document_id for doc in chunk]
            current_app.logger.info(
                f'{transfer_id}: Beginning transfer for chunk #{i}: {chunk_doc_data}')
            transfer_docs.delay(transfer_id, chunk_doc_data, i)

        return message, 201
