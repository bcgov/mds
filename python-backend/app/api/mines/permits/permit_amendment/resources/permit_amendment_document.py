import decimal
import uuid
import base64
import requests
import json

from datetime import datetime
from flask import request, current_app, Response
from flask_restplus import Resource, reqparse
from werkzeug.datastructures import FileStorage
from werkzeug.exceptions import BadRequest, InternalServerError, NotFound
from sqlalchemy.exc import DBAPIError

from app.api.mines.permits.permit_amendment.models.permit_amendment import PermitAmendment
from app.api.mines.permits.permit_amendment.models.permit_amendment_document import PermitAmendmentDocument

from app.extensions import api, db
from app.api.utils.access_decorators import requires_role_mine_create
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.url import get_document_manager_svc_url

from app.api.mines.permits.response_models import PERMIT_AMENDMENT_DOCUMENT_MODEL


class PermitAmendmentDocumentListResource(Resource, UserMixin):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('mine_guid', type=str, store_missing=False)
    parser.add_argument('document_manager_guid', type=str, store_missing=False)
    parser.add_argument('filename', type=str, store_missing=False)

    @requires_role_mine_create
    def post(self, mine_guid):
        metadata = self._parse_request_metadata()
        if not metadata or not metadata.get('filename'):
            raise BadRequest('Filename not found in request metadata header.')

        try:
            #check formatting
            uuid.UUID(mine_guid)
            valid_guid = True
        except:
            valid_guid = False

        if not mine_guid or not valid_guid:
            raise BadRequest('Valid mine_guid is required.')

        folder, pretty_folder = self._parse_upload_folders(mine_guid)
        response_data = {
            'folder': folder,
            'pretty_folder': pretty_folder,
            'filename': metadata.get('filename')
        }

        document_manager_URL = f'{current_app.config["DOCUMENT_MANAGER_URL"]}/document-manager'

        resp = requests.post(
            url=document_manager_URL,
            headers={key: value
                     for (key, value) in request.headers if key != 'Host'},
            data=response_data,
            cookies=request.cookies,
        )

        response = Response(resp.content, resp.status_code, resp.raw.headers.items())
        return response

    def _parse_upload_folders(self, mine_guid):
        folder = f'mines/{str(mine_guid)}/permits'
        pretty_folder = f'mines/{mine_guid}/permits'

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

    @api.marshal_with(PERMIT_AMENDMENT_DOCUMENT_MODEL, code=201)
    @requires_role_mine_create
    def put(self, mine_guid, permit_amendment_guid, permit_guid, permit_amendment_document_guid=None):
        permit_amendment = PermitAmendment.find_by_permit_amendment_guid(permit_amendment_guid)
        if not permit_amendment:
            raise NotFound('Permit amendment not found.')
        if not str(permit_amendment.permit_guid) == permit_guid:
            raise BadRequest('Amendment and permit permit_guid mismatch.')
        if not str(permit_amendment.mine_guid) == mine_guid:
            raise BadRequest('Permits mine_guid and supplied mine_guid mismatch.')

        data = self.parser.parse_args()
        if data.get('document_manager_guid'):
            # Register and associate a new file upload
            filename = data.get('filename')
            if not filename:
                raise BadRequest('Must supply filename for new file upload.')

            new_pa_doc = PermitAmendmentDocument(
                mine_guid=permit_amendment.permit.mine_guid,
                document_manager_guid=data.get('document_manager_guid'),
                document_name=filename)

            permit_amendment.related_documents.append(new_pa_doc)
            permit_amendment.save()
        else:
            raise BadRequest('Must provide the doc manager guid for the newly uploaded file.')

        return new_pa_doc


class PermitAmendmentDocumentResource(Resource, UserMixin):
    @requires_role_mine_create
    @api.response(204, 'Successfully deleted.')
    def delete(self, mine_guid, permit_guid, permit_amendment_guid, permit_amendment_document_guid):
        permit_amendment = PermitAmendment.find_by_permit_amendment_guid(permit_amendment_guid)
        permit_amendment_doc = PermitAmendmentDocument.find_by_permit_amendment_document_guid(
            permit_amendment_document_guid)

        if permit_amendment is None:
            raise NotFound('The permit amendment was not found.')

        if permit_amendment_doc is None:
            raise NotFound('The amendments attached document was not found.')

        if not str(permit_amendment.permit_guid) == permit_guid:
            raise BadRequest('Amendment and permit permit_guid mismatch.')

        if not str(permit_amendment.mine_guid) == mine_guid:
            raise BadRequest('Permits mine_guid and supplied mine_guid mismatch.')

        permit_amendment.related_documents.remove(permit_amendment_doc)
        permit_amendment.save()

        return
