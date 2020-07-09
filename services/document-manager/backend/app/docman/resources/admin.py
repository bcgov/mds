import os
from app.services.object_store_storage_service import ObjectStoreStorageService

from werkzeug.exceptions import BadRequest
from flask import current_app
from flask_restplus import Resource, reqparse

from app.docman.models.document import Document
from app.extensions import api
from app.utils.access_decorators import requires_any_of, MINE_ADMIN
from app.config import Config


@api.route('/admin/transfer-file-system-to-object-store')
class TransferFileSystemToObjectStore(Resource):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('secret', type=str, required=True, help='Secret')

    @requires_any_of([MINE_ADMIN])
    def post(self):

        # Ensure that the secret to initiate the transfer is correct
        data = self.parser.parse_args()
        secret = data.get('secret')
        if (secret != 'd053c125-eb4b-44ba-8560-e83d716dfb0c'):
            raise BadRequest()

        # Initiate the transfer process
        docs = Document.query.filter_by(object_store_path=None).all()
        failures = []
        for doc in docs:

            # if str(doc.document_guid) != 'd1fa0342-69c6-485e-932f-406163e71163':
            #     continue

            try:
                key = ObjectStoreStorageService().upload_file(file_name=doc.full_storage_path)
                doc.object_store_path = key
                doc.save()
            except Exception as e:
                current_app.logger.error(f'Failed to transfer document: {e}')
                failures.append(doc)

        return 'Initiated transfer', 201