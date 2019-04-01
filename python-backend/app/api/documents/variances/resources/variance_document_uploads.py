import base64
import logging
import requests
import json

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
            # TODO: Replace every create_error_payload?? I think we're moving away from these
            return self.create_error_payload(400, 'Missing mine_guid'), 400

        if not mine_no:
            # TODO: Replace every create_error_payload?? I think we're moving away from these
            return self.create_error_payload(400, 'Missing mine_no'), 400

        metadata = self._parse_request_metadata()
        if not metadata or not metadata.get('filename'):
            return self.create_error_payload(400,
                                             'Filename not found in request metadata header'), 400

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
            return self.create_error_payload(400, 'Missing variance_id'), 400

        data = self.parser.parse_args()
        document_manager_guid = data.get('document_manager_guid')
        filename = data.get('filename')
        mine_guid = data.get('mine_guid')

        if not document_manager_guid:
            return self.create_error_payload(422, 'Must provide document_manager_guid'), 422

        # Register new file upload
        mine_doc = MineDocument(
            mine_guid=mine_guid,
            document_manager_guid=document_manager_guid,
            document_name=filename)

        if not mine_doc:
            return self.create_error_payload(400, 'Unable to register uploaded file as document'), 400

        mine_doc.save()

        # Relate mine document to a variance
        document = VarianceDocument.create(mine_doc.mine_document_guid, variance_id)

        if not document:
            return self.create_error_payload(400, 'Unable to assign document to variance'), 400

        document.save()
        return document.json()


    @requires_any_of([MINE_CREATE, MINESPACE_PROPONENT])
    def delete(self, variance_id=None, mine_document_guid=None):
        if not variance_id or not mine_document_guid:
            return self.create_error_payload(
                400, 'Must provide a variance_id and mine_document_guid'), 400

        try:
            doc_xref_record = VarianceDocument.find_by_mine_document_guid_and_variance_id(
                mine_document_guid,
                variance_id)
        except DataError:
            return self.create_error_payload(
                422, 'One or more invalid parameters provided'), 422

        if not doc_xref_record:
            return self.create_error_payload(
                404, 'Document not found'), 404

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
