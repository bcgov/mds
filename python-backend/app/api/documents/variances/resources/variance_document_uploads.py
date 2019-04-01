import base64
import logging
import requests
import json
from werkzeug.exceptions import BadRequest, NotFound

from flask import request, current_app, Response
from flask_restplus import Resource, reqparse
from sqlalchemy.exc import DataError

from ..models.variance import VarianceDocument
from ...mines.models.mine_document import MineDocument

from app.extensions import api, db
from ....utils.access_decorators import requires_any_of, MINE_CREATE, MINESPACE_PROPONENT
from ....utils.resources_mixins import UserMixin, ErrorMixin


class VarianceDocumentUploadResource(Resource, UserMixin, ErrorMixin):
    parser = reqparse.RequestParser()
    parser.add_argument('mine_document_guid', type=str)
    parser.add_argument('document_manager_guid', type=str)
    parser.add_argument('filename', type=str)
    parser.add_argument('mine_guid', type=str)
    parser.add_argument('mine_no', type=str)

    @api.doc(
        params={
            'mine_guid':
            'Required: The guid of the mine to which the variance will be associated.'
        })
    @requires_any_of([MINE_CREATE, MINESPACE_PROPONENT])
    def post(self):
        data = self.parser.parse_args()
        mine_guid = data.get('mine_guid')
        mine_no = data.get('mine_no')

        if not mine_guid:
            raise BadRequest('Missing mine_guid')

        if not mine_no:
            raise BadRequest('Missing mine_no')

        metadata = self._parse_request_metadata()
        if not metadata or not metadata.get('filename'):
            raise BadRequest('Filename not found in request metadata header')

        # Save file
        filename = metadata.get('filename')
        folder = f'variances/{mine_guid}'
        pretty_folder = f'variances/{mine_no}'

        data = {
            'folder': folder,
            'pretty_folder': pretty_folder,
            'filename': filename
        }
        document_manager_URL = f'{current_app.config["DOCUMENT_MANAGER_URL"]}/document-manager'

        resp = requests.post(
            url=document_manager_URL,
            headers={key: value
                     for (key, value) in request.headers if key != 'Host'},
            data=data,
            cookies=request.cookies,
        )

        response = Response(str(resp.content), resp.status_code, resp.raw.headers.items())
        return response


    @requires_any_of([MINE_CREATE, MINESPACE_PROPONENT])
    def put(self, variance_id=None):
        if not variance_id:
            raise BadRequest('Missing variance_id')

        data = self.parser.parse_args()
        document_manager_guid = data.get('document_manager_guid')
        filename = data.get('filename')
        mine_guid = data.get('mine_guid')

        if not document_manager_guid:
            raise BadRequest('Must provide document_manager_guid')

        # Register new file upload
        mine_doc = MineDocument(
            mine_guid=mine_guid,
            document_manager_guid=document_manager_guid,
            document_name=filename)

        if not mine_doc:
            raise BadRequest('Unable to register uploaded file as document')

        mine_doc.save()

        # Relate mine document to a variance
        document = VarianceDocument.create(mine_doc.mine_document_guid, variance_id)

        if not document:
            BadRequest('Unable to assign document to variance')

        document.save()
        return document.json()


    @requires_any_of([MINE_CREATE, MINESPACE_PROPONENT])
    def delete(self, variance_id=None, mine_document_guid=None):
        if not variance_id or not mine_document_guid:
            raise BadRequest('Must provide a variance_id and mine_document_guid')

        try:
            doc_xref_record = VarianceDocument.find_by_mine_document_guid_and_variance_id(
                mine_document_guid,
                variance_id)
        except DataError:
            raise BadRequest('One or more invalid parameters provided')

        if not doc_xref_record:
            raise NotFound('Document not found')

        db.session.delete(doc_xref_record)
        db.session.commit()

        return {'status': 200, 'message': 'The document was removed succesfully'}


    def _parse_request_metadata(self):
        request_metadata = request.headers.get("Upload-Metadata")
        metadata = {}
        if not request_metadata:
            return metadata

        for key_value in request_metadata.split(","):
            (key, value) = key_value.split(" ")
            metadata[key] = base64.b64decode(value).decode("utf-8")

        return metadata
