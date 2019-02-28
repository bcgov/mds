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

from ..models.permit_amendment import PermitAmendment
from ..models.permit_amendment_document import PermitAmendmentDocument

from app.extensions import api, db
from ....utils.access_decorators import requires_role_mine_create
from ....utils.resources_mixins import UserMixin, ErrorMixin
from ....utils.url import get_document_manager_svc_url


class PermitAmendmentDocumentResource(Resource, UserMixin, ErrorMixin):
    parser = reqparse.RequestParser()
    parser.add_argument('document_manager_guid', type=str)
    parser.add_argument('filename', type=str)
    #permit_guid, it could be in the request and we don't want to disallow it, but it is not used.

    @api.doc(
        params={
            'permit_amendment_guid':
            'Required: The guid of the permit amendment that this upload will be attached to.'
        })
    @requires_role_mine_create
    def post(self, permit_amendment_guid, permit_guid=None):
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
        return ('', 204)  #response

    @requires_role_mine_create
    def put(self, permit_amendment_guid, document_guid=None, permit_guid=None):
        permit_amendment = PermitAmendment.find_by_permit_amendment_guid(permit_amendment_guid)
        if not permit_amendment:
            return self.create_error_payload(404, 'Permit amendment not found'), 404

        data = self.parser.parse_args()
        if data.get('document_manager_guid'):
            # Register and associate a new file upload
            filename = data.get('filename')
            if not filename:
                return self.create_error_payload(400,
                                                 'Must supply filename for new file upload'), 400

            new_pa_doc = PermitAmendmentDocument(
                mine_guid=permit_amendment.permit.mine_guid,
                document_manager_guid=data.get('document_manager_guid'),
                document_name=filename,
                **self.get_create_update_dict())

            permit_amendment.documents.append(new_pa_doc)
            permit_amendment.save()
        else:
            return self.create_error_payload(
                400, 'Must provide the doc manager guid for the newly uploaded file'), 400

        return permit_amendment.json()

    @requires_role_mine_create
    def delete(self, permit_amendment_guid, document_guid=None, permit_guid=None):
        if not document_guid:
            return self.create_error_payload(400, 'must provide document_guid to be unlinked'), 400

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
