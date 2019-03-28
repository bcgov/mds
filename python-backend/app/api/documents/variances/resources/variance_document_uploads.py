# import decimal
# import uuid
import base64
import logging
import requests
import json

# from datetime import datetime
from flask import request, current_app, Response
from flask_restplus import Resource, reqparse
# from werkzeug.datastructures import FileStorage
# from werkzeug import exceptions
# from sqlalchemy.exc import DBAPIError

from ..models.variance import VarianceDocument
# from ...expected.models.mine_expected_document_xref import VarianceDocumentXref
from ...mines.models.mine_document import MineDocument

from app.extensions import api, db
from ....utils.access_decorators import requires_any_of, MINE_CREATE, MINESPACE_PROPONENT
from ....utils.resources_mixins import UserMixin, ErrorMixin


class VarianceDocumentUploadResource(Resource, UserMixin, ErrorMixin):
    parser = reqparse.RequestParser()
    # TODO: I don't think I want these
    parser.add_argument('mine_document_guid', type=str)
    parser.add_argument('document_manager_guid', type=str)
    parser.add_argument('filename', type=str)

    @api.doc(
        params={
            'variance_id':
            'Required: The id of the variance to which this document will be associated.'
        })
    @requires_any_of([MINE_CREATE, MINESPACE_PROPONENT])
    def post(self, variance_id=None):
        if not variance_id:
            return self.create_error_payload(400, 'Missing variance_id'), 400

        metadata = self._parse_request_metadata()
        if not metadata or not metadata.get('filename'):
            return self.create_error_payload(400,
                                             'Filename not found in request metadata header'), 400

        # Save file
        filename = metadata.get('filename')
        folder = f'variances/{variance_id}'

        data = {
            'folder': folder,
            'pretty_folder': folder,
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

        # Add file to mine_document table
        document_manager_record = json.loads(resp.content)
        if not document_manager_record:
            return self.create_error_payload(400, 'Unable to complete upload'), 400

        document_manager_guid = document_manager_record['document_manager_guid']
        doc = MineDocument.find_by_document_manager_guid(document_manager_guid)
        if not doc:
            return self.create_error_payload(400, 'Unable to complete upload'), 400

        doc_json = doc.json()

        # TODO: Add try/except
        mine_doc = MineDocument(
            mine_guid=doc_json.get('mine_guid'),
            document_manager_guid=doc_json.get('document_manager_guid'),
            document_name=filename)

        mine_doc.save()

        response = Response(str(mine_doc.json()), resp.status_code, resp.raw.headers.items())
        return response


    @requires_any_of([MINE_CREATE, MINESPACE_PROPONENT])
    def put(self, variance_id=None):
        if not variance_id:
            return self.create_error_payload(400, 'Missing variance_id'), 400

        data = self.parser.parse_args()
        mine_document_guid = data.get('mine_document_guid')

        if not mine_document_guid:
            return self.create_error_payload(422, 'Must specify Mine Document'), 422

        document = VarianceDocument.create(mine_document_guid, variance_id)

        if not document:
            return self.create_error_payload(400, 'Unable to assign document to variance'), 400

        document.save()
        return document.json()


    def _parse_request_metadata(self):
        request_metadata = request.headers.get("Upload-Metadata")
        metadata = {}
        if not request_metadata:
            return metadata

        for key_value in request_metadata.split(","):
            (key, value) = key_value.split(" ")
            metadata[key] = base64.b64decode(value).decode("utf-8")

        return metadata
