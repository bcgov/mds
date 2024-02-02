import uuid
from flask import request
from flask_restx import Resource, fields
from werkzeug.exceptions import NotFound, InternalServerError, BadRequest

from app.api.constants import TIMEOUT_5_MINUTES
from app.extensions import api, cache
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin

from app.api.services.nris_download_service import NRISDownloadService

DOWNLOAD_TOKEN_MODEL = api.model('DownloadToken', {'token_guid': fields.String})


def DOWNLOAD_TOKEN(token_guid):
    return f'compliance-document:download-token:{token_guid}'


class ComplianceDocumentTokenResource(Resource, UserMixin):
    @api.doc(
        description='Issues a one-time token for access to a document without auth headers.',
        params={'file_name': 'The file name for the download being requested.'})
    @api.marshal_with(DOWNLOAD_TOKEN_MODEL, code=200)
    @requires_role_view_all
    def get(self, inspection_id, attachment_id):
        documenturl = f'https://api.nrs.gov.bc.ca/nrisws-api/v1/attachments/{inspection_id}/attachment/{attachment_id}'
        filename = request.args['file_name']
        token_guid = uuid.uuid4()
        cache.set(
            DOWNLOAD_TOKEN(token_guid), {
                'documenturl': documenturl,
                'filename': filename
            }, TIMEOUT_5_MINUTES)

        return {'token_guid': token_guid}


class ComplianceDocumentResource(Resource, UserMixin):
    @api.doc(
        description='Fetch an compliance document by id',
        params={'token': 'A one-time token issued for downloading the file.'})
    def get(self, inspection_id, attachment_id):
        token_guid = request.args.get('token', '')
        document_info = cache.get(DOWNLOAD_TOKEN(token_guid))
        cache.delete(DOWNLOAD_TOKEN(token_guid))
        if not document_info:
            raise BadRequest('Valid token required for download')

        return NRISDownloadService.download(document_info["documenturl"], document_info["filename"])
