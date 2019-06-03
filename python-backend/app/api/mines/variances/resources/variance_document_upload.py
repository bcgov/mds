import base64
import requests
from werkzeug.exceptions import BadRequest, NotFound

from flask import request, current_app, Response
from flask_restplus import Resource
from app.extensions import api

from ...mine.models.mine import Mine
from ....documents.mines.models.mine_document import MineDocument
from ....utils.access_decorators import (requires_any_of, MINE_CREATE,
                                         MINESPACE_PROPONENT)
from ....utils.resources_mixins import UserMixin, ErrorMixin
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.mines.mine_api_models import VARIANCE_MODEL
# TODO: Refactor to use API call
from app.api.variances.models.variance import Variance


class MineVarianceDocumentUploadResource(Resource, UserMixin, ErrorMixin):
    @api.doc(description='Request a document_manager_guid for uploading a document')
    @requires_any_of([MINE_CREATE, MINESPACE_PROPONENT])
    def post(self, mine_guid, variance_guid):
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


    @api.doc(
        description='Associate an uploaded file with a variance.',
        params={
            'mine_guid': 'guid for the mine with which the variance is associated',
            'variance_guid': 'GUID for the variance to which the document should be associated'
        })
    @api.marshal_with(VARIANCE_MODEL, code=200)
    @requires_any_of([MINE_CREATE, MINESPACE_PROPONENT])
    def put(self, mine_guid, variance_guid):
        parser = CustomReqparser()
        # Arguments required by MineDocument
        parser.add_argument('document_name', type=str, required=True)
        parser.add_argument('document_manager_guid', type=str, required=True)

        variance = Variance.find_by_variance_guid(variance_guid)

        if not variance:
            raise NotFound('Unable to fetch variance.')

        data = parser.parse_args()
        document_name = data.get('document_name')
        document_manager_guid = data.get('document_manager_guid')

        # Register new file upload
        mine_doc = MineDocument(
            mine_guid=mine_guid,
            document_manager_guid=document_manager_guid,
            document_name=document_name)

        if not mine_doc:
            raise BadRequest('Unable to register uploaded file as document')

        variance.mine_documents.append(mine_doc)
        variance.save()
        return variance

    def _parse_request_metadata(self):
        request_metadata = request.headers.get("Upload-Metadata")
        metadata = {}
        if not request_metadata:
            return metadata

        for key_value in request_metadata.split(","):
            (key, value) = key_value.split(" ")
            metadata[key] = base64.b64decode(value).decode("utf-8")

        return metadata
