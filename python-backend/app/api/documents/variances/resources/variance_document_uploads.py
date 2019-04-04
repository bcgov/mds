import base64
import logging
import requests
import json
from werkzeug.exceptions import BadRequest, NotFound

from flask import request, current_app, Response
from flask_restplus import Resource, reqparse, fields
from sqlalchemy.exc import DataError

from ..models.variance import VarianceDocument
from ....mines.mine.models.mine import Mine
from ....mines.variances.models.variance import Variance
from ...mines.models.mine_document import MineDocument

from app.extensions import api, db
from ....utils.access_decorators import requires_any_of, MINE_CREATE, MINESPACE_PROPONENT
from ....utils.resources_mixins import UserMixin, ErrorMixin

mine_document_model = api.model('MineDocument', {
    'mine_document_guid': fields.String,
    'mine_guid': fields.String,
    'document_manager_guid': fields.String,
    'document_name': fields.String,
    'active_ind': fields.Boolean
})

variance_document_model = api.model('VarianceDocument', {
    'variance_document_xref_guid': fields.String,
    'variance_id': fields.Integer,
    'mine_document_guid': fields.String,
    'details': fields.Nested(mine_document_model)
})

class VarianceDocumentUploadResource(Resource, UserMixin, ErrorMixin):
    parser = reqparse.RequestParser()
    parser.add_argument('mine_document_guid', type=str)
    parser.add_argument('document_manager_guid', type=str)
    parser.add_argument('document_name', type=str)


    @api.doc(
        description=
        'Request a document_manager_guid for uploading a document'
    )
    @requires_any_of([MINE_CREATE, MINESPACE_PROPONENT])
    def post(self, mine_guid=None, variance_id=None):
        if not mine_guid or not variance_id:
            raise BadRequest('Must provide mine_guid and variance_id')

        data = self.parser.parse_args()
        metadata = self._parse_request_metadata()
        if not metadata or not metadata.get('filename'):
            raise BadRequest('Filename not found in request metadata header')

        # Save file
        mine = Mine.find_by_mine_guid(mine_guid)
        document_name = metadata.get('filename')
        data = {
            'folder': f'mines/{mine.mine_guid}/variances',
            'pretty_folder': f'mines/{mine.mine_no}/variances',
            'filename': document_name
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


    def _parse_request_metadata(self):
        request_metadata = request.headers.get("Upload-Metadata")
        metadata = {}
        if not request_metadata:
            return metadata

        for key_value in request_metadata.split(","):
            (key, value) = key_value.split(" ")
            metadata[key] = base64.b64decode(value).decode("utf-8")

        return metadata


class VarianceUploadedDocumentsResource(Resource, UserMixin, ErrorMixin):
    @api.doc(
        description=
        'Update an uploaded variance document.',
        params={
            'document_name': 'The new name for the file'
        }
    )
    @api.marshal_with(variance_document_model, code=200)
    @requires_any_of([MINE_CREATE, MINESPACE_PROPONENT])
    def put(self, mine_guid=None, variance_id=None, document_manager_guid=None):
        if not mine_guid or not variance_id or not mine_document_guid:
            raise BadRequest('Must provide mine_guid, variance_id, and mine_document_guid')

        data = self.parser.parse_args()
        document_name = data.get('document_name')

        if not document_manager_guid:
            raise BadRequest('Must provide document_manager_guid')

        # Register new file upload
        mine_doc = MineDocument(
            mine_guid=mine_guid,
            document_manager_guid=document_manager_guid,
            document_name=document_name)

        if not mine_doc:
            raise BadRequest('Unable to register uploaded file as document')

        mine_doc.save()

        # Relate mine document to a variance
        document = VarianceDocument.create(mine_doc.mine_document_guid, variance_id)

        if not document:
            raise BadRequest('Unable to assign document to variance')

        document.save()
        return document


    @api.doc(
        description=
        'Delete a document from a variance.'
    )
    @requires_any_of([MINE_CREATE, MINESPACE_PROPONENT])
    def delete(self, mine_guid=None, variance_id=None, mine_document_guid=None):
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

        # FIXME: This response is inconsistent with the others
        return {'status': 204, 'message': 'The document was removed succesfully'}
