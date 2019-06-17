import decimal
import uuid
import base64
import requests
import json

from datetime import datetime
from flask import request, current_app, Response
from flask_restplus import Resource, reqparse
from werkzeug.datastructures import FileStorage
from werkzeug.exceptions import BadRequest, NotFound
from sqlalchemy.exc import DBAPIError

from app.api.mines.incidents.models.mine_incident import MineIncident
from app.api.mines.mine.models.mine import Mine
from app.api.documents.mines.models.mine_document import MineDocument
from app.api.documents.incidents.models.mine_incident import MineIncidentDocumentXref

from app.extensions import api, db
from app.api.utils.custom_reqparser import CustomReqparser
from ....utils.access_decorators import requires_role_mine_create
from ....utils.resources_mixins import UserMixin, ErrorMixin
from ....utils.url import get_document_manager_svc_url


class MineIncidentDocumentListResource(Resource, UserMixin):
    @api.doc(params={})
    @requires_role_mine_create
    def post(self, mine_guid):
        metadata = self._parse_request_metadata()
        if not metadata or not metadata.get('filename'):
            raise BadRequest('Filename not found in request metadata header')

        mine = Mine.find_by_mine_guid(mine_guid)

        if not mine:
            raise NotFound('Mine not found.')

        folder, pretty_folder = self._parse_upload_folders(mine.mine_guid)
        data = {
            'folder': folder,
            'pretty_folder': pretty_folder,
            'filename': metadata.get('filename')
        }

        document_manager_URL = f'{current_app.config["DOCUMENT_MANAGER_URL"]}/document-manager'

        resp = requests.post(
            url=document_manager_URL,
            headers={key: value
                     for (key, value) in request.headers if key != 'Host'},
            data=data,
            cookies=request.cookies,
        )

        response = Response(resp.content, resp.status_code, resp.raw.headers.items())
        return response


class MineIncidentDocumentResource(Resource, UserMixin):
    @requires_role_mine_create
    def put(self, mine_guid, mine_incident_guid):
        parser = CustomReqparser()
        parser.add_argument('filename', type=str, required=True)
        parser.add_argument('document_manager_guid', type=str, required=True)

        mine_incident = MineIncident.find_by_mine_incident_guid(mine_incident_guid)
        mine = Mine.find_by_mine_guid(mine_guid)

        if not mine_incident:
            raise NotFound('Mine incident not found')
        if not mine:
            raise NotFound('Mine not found.')

        data = self.parser.parse_args()
        document_manager_guid = data.get('document_manager_guid')
        file_name = data.get('filename')

        mine_doc = MineDocument(
            mine_guid=mine.mine_guid,
            document_name=file_name,
            document_manager_guid=document_manager_guid)

        if not mine_doc:
            raise BadRequest('Unable to register uploaded file as document')

        mine_doc.save()
        mine_incident_doc = MineIncidentDocumentXref(
            mine_document_guid=mine_doc.mine_document_guid,
            mine_incident_id=mine_incident.mine_incident_id,
            variance_document_category_code='FIN')  # hardcoded for now

        mine_incident.documents.append(mine_incident_doc)
        mine_incident.save()

        return mine_incident

    @requires_role_mine_create
    def delete(self, mine_guid, mine_incident_guid, document_guid):
        if not document_guid:
            raise BadRequest('must provide document_guid to be unlinked')

        mine_incident = MineIncident.find_by_mine_incident_guid(mine_incident_guid)
        mine_document = MineDocument.find_by_mine_document_guid(document_guid)

        if mine_incident is None or mine_document is None:
            raise NotFound('Either the Expected Document or the Mine Document was not found')

        mine_incident.documents.remove(mine_document)
        mine_incident.save()

        return ('', 204)

    def _parse_upload_folders(self, mine_guid):
        folder = f'mines/{str(mine_guid)}/incidents'
        pretty_folder = f'mines/{mine_guid}/incidents'

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
