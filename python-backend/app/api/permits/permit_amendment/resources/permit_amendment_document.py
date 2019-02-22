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
from ..models.permit_amendment import PermitAmendment
from ..models.permit_amendment_document import PermitAmendmentDocument
from ...expected.models.mine_expected_document_xref import MineExpectedDocumentXref
from ...mines.models.mine_document import MineDocument

from app.extensions import api, db
from ....utils.access_decorators import requires_any_of, MINE_CREATE, MINESPACE_PROPONENT
from ....utils.resources_mixins import UserMixin, ErrorMixin
from ....utils.url import get_document_manager_svc_url


class PermidAmendmentDocumentsResource(Resource, UserMixin, ErrorMixin):
    parser = reqparse.RequestParser()
    parser.add_argument('document_guid', type=str)
    parser.add_argument('document_manager_guid', type=str)
    parser.add_argument('filename', type=str)

    @api.doc(
        params={
            'permit_amendment_guid':
            'Required: The guid of the permit amendment that this upload will be attached to.'
        })
    @requires_any_of([MINE_CREATE, MINESPACE_PROPONENT])
    def post(self, permit_amendment_guid):
        permit_amendment = PermitAmendment.find_by_permit_amendment_guid(permit_amendment_guid)
        if not permit_amendment:
            return self.create_error_payload(404, 'Permit amendment not found'), 404

        metadata = self._parse_request_metadata()
        if not metadata or not metadata.get('filename'):
            return self.create_error_payload(400,
                                             'Filename not found in request metadata header'), 400

        folder, pretty_folder = self._parse_upload_folders(permit_amendment)
        data = {
            'folder': folder,
            'pretty_folder': pretty_folder,
            'filename': metadata.get('filename')
        }
        document_manager_URL = get_document_manager_svc_url()

        resp = requests.post(
            url=document_manager_URL,
            headers={key: value
                     for (key, value) in request.headers if key != 'Host'},
            data=data,
            cookies=request.cookies,
        )

        response = Response(resp.content, resp.status_code, resp.raw.headers.items())
        return response

    @requires_any_of([MINE_CREATE, MINESPACE_PROPONENT])
    def put(self, permit_amendment_guid):
        permit_amendment = PermitAmendment.find_by_permit_amendment_guid(permit_amendment_guid)
        if not permit_amendment:
            return self.create_error_payload(404, 'Permit amendment not found'), 404

        data = self.parser.parse_args()
        if data.get('document_guid'):
            # Associating existing mine document
            permit_amendment_doc = PermitAmendmentDocument.find_by_permit_amendment_guid(
                data.get('document_guid'))
            if not permit_amendment_doc:
                return self.create_error_payload(404, 'Permit Amendment Document not found'), 404

            permit_amendment.documents.append(permit_amendment_doc)
            db.session.commit()
        elif data.get('document_manager_guid'):
            # Register and associate a new file upload
            filename = data.get('filename')
            if not filename:
                return self.create_error_payload(400,
                                                 'Must supply filename for new file upload'), 400

            new_pa_doc = PermitAmendmentDocument(
                document_manager_guid=data.get('document_manager_guid'),
                document_name=filename,
                **self.get_create_update_dict())

            permit_amendment.documents.append(new_pa_doc)
            permit_amendment.save()
        else:
            return self.create_error_payload(
                400, 'Must specify either Document GIUD or Document Manager GUID'), 400

        return expected_document.json()

    @requires_any_of([MINE_CREATE, MINESPACE_PROPONENT])
    def delete(self, permit_amendment_guid=None, document_guid=None):
        if permit_amendment_guid is None or document_guid is None:
            return self.create_error_payload(
                400, 'Must provide a permit amendment guid and a mine document guid'), 400

        permit_amendment = PermitAmendment.find_by_permit_amendment_guid(permit_amendment_guid)
        permit_amendment_doc = PermitAmendmentDocument.find_by_permit_amendment_guid(document_guid)

        if permit_amendment is None or permit_amendment_doc is None:
            return self.create_error_payload(
                404, 'Either the Expected Document or the Mine Document was not found'), 404

        permit_amendment.documents.remove(permit_amendment_doc)
        permit_amendment.save()

        return ('', 204)

    def _parse_upload_folders(self, permit_amendment):
        folder = f'mines/{str(permit_amendment.mine_guid)}/permits'
        pretty_folder = f'mines/{permit_amendment.mine_guid}/permits'

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
