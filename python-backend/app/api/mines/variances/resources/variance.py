import uuid
import base64
import requests
from werkzeug.exceptions import BadRequest, NotFound

from flask import request, current_app, Response
from flask_restplus import Resource, fields
from app.extensions import api, db

from ..models.variance import Variance
from ...mine.models.mine import Mine
from ....documents.mines.models.mine_document import MineDocument
from ....utils.access_decorators import (requires_any_of, MINE_VIEW, MINE_CREATE,
                                         MINESPACE_PROPONENT)
from ....utils.resources_mixins import UserMixin, ErrorMixin
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.mines.mine_api_models import VARIANCE_MODEL


class VarianceListResource(Resource, UserMixin, ErrorMixin):
    parser = CustomReqparser()
    parser.add_argument(
        'compliance_article_id',
        type=int,
        store_missing=False,
        help='ID representing the MA or HSRCM code to which this variance relates.',
        required=True)
    parser.add_argument(
        'received_date',
        store_missing=False,
        help='The date on which the variance was received.',
        required=True)
    parser.add_argument(
        'variance_application_status_code',
        type=str,
        store_missing=False,
        help='A 3-character code indicating the status type of the variance. Default: REV')
    parser.add_argument(
        'ohsc_ind',
        type=bool,
        store_missing=False,
        help='Indicates if variance application has been reviewed by the OHSC.')
    parser.add_argument(
        'union_ind',
        type=bool,
        store_missing=False,
        help='Indicates if variance application has been reviewed by the union.')
    parser.add_argument(
        'inspector_id',
        type=int,
        store_missing=False,
        help='ID of the person who inspected the mine during the variance application process.')
    parser.add_argument(
        'note',
        type=str,
        store_missing=False,
        help='A note to include on the variance. Limited to 300 characters.')
    parser.add_argument(
        'issue_date', store_missing=False, help='The date on which the variance was issued.')
    parser.add_argument(
        'expiry_date', store_missing=False, help='The date on which the variance expires.')

    @api.doc(
        description='Get a list of all variances for a given mine.',
        params={'mine_guid': 'guid of the mine for which to fetch variances'})
    @requires_any_of([MINE_VIEW])
    @api.marshal_with(VARIANCE_MODEL, code=200, envelope='records')
    def get(self, mine_guid):
        variances = Variance.find_by_mine_guid(mine_guid)

        if variances is None:
            raise BadRequest(
                'Unable to fetch variances. Confirm you\'ve provided a valid mine_guid')

        return variances


    @api.doc(
        description='Create a new variance for a given mine.',
        params={'mine_guid': 'guid of the mine with which to associate the variances'})
    @api.expect(parser)
    @requires_any_of([MINE_CREATE])
    @api.marshal_with(VARIANCE_MODEL, code=200)
    def post(self, mine_guid):
        data = VarianceListResource.parser.parse_args()
        compliance_article_id = data['compliance_article_id']
        received_date = data['received_date']

        variance = Variance.create(
            compliance_article_id=compliance_article_id,
            mine_guid=mine_guid,
            received_date=received_date,
            # Optional fields
            variance_application_status_code=data.get('variance_application_status_code'),
            ohsc_ind=data.get('ohsc_ind'),
            union_ind=data.get('union_ind'),
            inspector_id=data.get('inspector_id'),
            note=data.get('note'),
            issue_date=data.get('issue_date'),
            expiry_date=data.get('expiry_date'))

        if not variance:
            raise BadRequest('Error: Failed to create variance')

        variance.save()
        return variance


class VarianceResource(Resource, UserMixin, ErrorMixin):
    @api.doc(
        description='Get a single variance.',
        params={
            'mine_guid': 'guid of the mine to which the variance is associated',
            'variance_id': 'ID of the variance to fetch'
        })
    @requires_any_of([MINE_VIEW])
    @api.marshal_with(VARIANCE_MODEL, code=200)
    def get(self, mine_guid, variance_id):
        variance = Variance.find_by_variance_id(variance_id)

        if variance is None:
            raise NotFound('Unable to fetch variance')

        return variance


class VarianceDocumentUploadResource(Resource, UserMixin, ErrorMixin):
    # Methods don't share any common parser args, so none are defined here
    parser = CustomReqparser()

    @api.doc(description='Request a document_manager_guid for uploading a document')
    @requires_any_of([MINE_CREATE, MINESPACE_PROPONENT])
    def post(self, mine_guid, variance_id):
        # DocumentManager requires parser data, but no arguments are required
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


    @api.doc(
        description='Associate an uploaded file with a variance.',
        params={
            'mine_guid': 'guid for the mine with which the variance is associated',
            'variance_id': 'ID for the variance to which the document should be associated'
        })
    @api.marshal_with(VARIANCE_MODEL, code=200)
    @requires_any_of([MINE_CREATE, MINESPACE_PROPONENT])
    def put(self, mine_guid, variance_id):
        # Arguments required by MineDocument
        self.parser.add_argument('document_name', type=str, required=True)
        self.parser.add_argument('document_manager_guid', type=str, required=True)

        variance = Variance.find_by_variance_id(variance_id)

        data = self.parser.parse_args()
        document_name = data.get('document_name')
        document_manager_guid = data.get('document_manager_guid')

        # Register new file upload
        mine_doc = MineDocument(
            mine_guid=mine_guid,
            document_manager_guid=document_manager_guid,
            document_name=document_name)

        if not mine_doc:
            raise BadRequest('Unable to register uploaded file as document')

        variance.documents.append(mine_doc)
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


class VarianceUploadedDocumentsResource(Resource, UserMixin, ErrorMixin):
    parser = CustomReqparser()
    parser.add_argument('mine_document_guid', type=str, required=True)

    @api.doc(description='Delete a document from a variance.')
    @requires_any_of([MINE_CREATE, MINESPACE_PROPONENT])
    def delete(self, mine_guid, variance_id, mine_document_guid):
        variance = Variance.find_by_variance_id(variance_id)
        mine_document = MineDocument.find_by_mine_document_guid(mine_document_guid)

        if variance is None:
            raise NotFound('Variance not found.')
        if mine_document is None:
            raise NotFound('Mine document not found.')

        variance.documents.remove(mine_document)
        variance.save()

        return ('', 204)
