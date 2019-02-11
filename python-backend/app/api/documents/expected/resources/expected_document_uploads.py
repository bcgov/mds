import decimal
import uuid
import base64
import requests
import json

from datetime import datetime
from flask import request, current_app, Response
from flask_restplus import Resource, reqparse
from werkzeug.datastructures import FileStorage
from werkzeug import exceptions
from sqlalchemy.exc import DBAPIError

from ..models.mine_expected_document import MineExpectedDocument
from ....mines.mine.models.mine import Mine
from ...expected.models.mine_expected_document import MineExpectedDocument
from ...expected.models.mine_expected_document_xref import MineExpectedDocumentXref
from ...mines.models.mine_document import MineDocument

from app.extensions import api, db
from ....utils.access_decorators import requires_any_of, MINE_CREATE, MINESPACE_PROPONENT
from ....utils.resources_mixins import UserMixin, ErrorMixin


class ExpectedDocumentUploadResource(Resource, UserMixin, ErrorMixin):
    parser = reqparse.RequestParser()
    parser.add_argument('mine_document_guid', type=str)
    parser.add_argument('document_manager_guid', type=str)
    parser.add_argument('filename', type=str)

    @api.doc(
        params={
            'expected_document_guid':
            'Required: The guid of the expected document that this upload will be satisfying.'
        })
    @requires_any_of([MINE_CREATE, MINESPACE_PROPONENT])
    def post(self, expected_document_guid):
        if not expected_document_guid:
            return self.create_error_payload(400, 'Expected Document GUID is required'), 400
        expected_document = MineExpectedDocument.find_by_exp_document_guid(
            expected_document_guid)
        if not expected_document:
            return self.create_error_payload(404, 'Expected Document not found'), 404

        metadata = self._parse_request_metadata()
        if not metadata or not metadata.get('filename'):
            return self.create_error_payload(400, 'Filename not found in request metadata header'), 400

        folder, pretty_folder = self._parse_upload_folders(expected_document)
        data = {'folder': folder, 'pretty_folder': pretty_folder,
                'filename': metadata.get('filename')}
        document_manager_URL = f'{current_app.config["DOCUMENT_MANAGER_URL"]}/document-manager'

        resp = requests.post(
            url=document_manager_URL,
            headers={key: value for (key, value)
                     in request.headers if key != 'Host'},
            data=data,
            cookies=request.cookies,
        )

        response = Response(resp.content, resp.status_code,
                            resp.raw.headers.items())
        return response
     

    @requires_any_of([MINE_CREATE, MINESPACE_PROPONENT])
    def put(self, expected_document_guid):
        if not expected_document_guid:
            return self.create_error_payload(400, 'Expected Document GUID is required'), 400       
        expected_document = MineExpectedDocument.find_by_exp_document_guid(expected_document_guid)
        if not expected_document:
            return self.create_error_payload(404, 'Expected Document not found'), 404

        data = self.parser.parse_args()
        if data.get('mine_document_guid'):
            # Associating existing mine document
            mine_doc = MineDocument.find_by_mine_document_guid(
                data.get('mine_document_guid'))
            if not mine_doc:
                return self.create_error_payload(404, 'Mine Document not found'), 404

            expected_document.mine_documents.append(mine_doc)
            db.session.commit()
        elif data.get('document_manager_guid'):
            # Register and associate a new file upload
            filename = data.get('filename')
            if not filename:
                return self.create_error_payload(400, 'Must supply filename for new file upload'), 400
            
            mine_doc = MineDocument(
                    mine_guid=expected_document.mine_guid,
                    document_manager_guid=data.get('document_manager_guid'),
                    document_name=filename,
                    **self.get_create_update_dict())

            expected_document.mine_documents.append(mine_doc)
            db.session.commit()
        else:
            return self.create_error_payload(400, 'Must specify either Mine Document GIUD or Docuemnt Manager GUID'), 400
 
        return expected_document.json()           


    @requires_any_of([MINE_CREATE, MINESPACE_PROPONENT])
    def delete(self, expected_document_guid=None, mine_document_guid=None):
        if expected_document_guid is None or mine_document_guid is None:
            return self.create_error_payload(
                400, 'Must provide a expected document guid and a mine document guid'), 400

        expected_document = MineExpectedDocument.find_by_exp_document_guid(
            expected_document_guid)
        mine_document = MineDocument.find_by_mine_document_guid(
            mine_document_guid)

        if expected_document is None or mine_document is None:
            return self.create_error_payload(
                404,
                'Either the Expected Document or the Mine Document was not found'
            ), 404

        expected_document.mine_documents.remove(mine_document)
        expected_document.save()

        return {'status': 200, 'message': 'The document was removed succesfully'}

    def _parse_upload_folders(self, expected_document):
        mine = Mine.find_by_mine_guid(str(expected_document.mine_guid))
        document_category = expected_document.required_document.req_document_category.req_document_category

        if not document_category:
            document_category = 'documents'

        folder = f'mines/{str(mine.mine_guid)}/{document_category}'
        pretty_folder = f'mines/{mine.mine_no}/{document_category}'

        return folder, pretty_folder

    def _parse_request_metadata(self):
        request_metadata = request.headers.get("Upload-Metadata")
        metadata = {}
        if not request_metadata:
            return metadata

        for key_value in request_metadata.split(","):
            (key, value) = key_value.split(" ")
            metadata[key] = base64.b64decode(value).decode("utf-8")

        return metadata
