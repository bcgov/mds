import os
import sys
from app.services.object_store_storage_service import ObjectStoreStorageService

from werkzeug.exceptions import BadRequest
from flask import current_app
from flask_restplus import Resource, reqparse

from app.docman.models.document import Document
from app.extensions import api
from app.utils.access_decorators import requires_any_of, MINE_ADMIN


@api.route('/admin/transfer-file-system-to-object-store')
class TransferFileSystemToObjectStore(Resource):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('secret', type=str, required=True, help='Secret')

    # @requires_any_of([MINE_ADMIN])
    def post(self):
        from app.utils.tasks import transfer_docs

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

        result = transfer_docs.delay()
        result.wait()

        return 'Initiated transfer', 201
