import uuid
from flask import request
from flask_restplus import Resource, fields
from werkzeug.exceptions import NotFound, InternalServerError, BadRequest

from app.api.constants import TIMEOUT_5_MINUTES
from app.extensions import api, cache
from app.api.now_submissions.models.application import Application
from app.api.now_submissions.response_models import APPLICATION
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin 

from app.api.services.nros_download_service import NROSDownloadService
from app.api.services.vfcbc_download_service import VFCBCDownloadService

DOWNLOAD_TOKEN_MODEL = api.model('DownloadToken', {'token_guid': fields.String})


def DOWNLOAD_TOKEN(token_guid):
    return f'application-document:download-token:{token_guid}'


class ApplicationDocumentTokenResource(Resource, UserMixin ):
    @api.doc(description='Issues a one-time token for access to a document without auth headers.')
    @api.marshal_with(DOWNLOAD_TOKEN_MODEL, code=200)
    @requires_role_view_all
    def get(self, application_guid, id):

        application = Application.find_by_now_application_guid(application_guid)
        if not application:
            raise NotFound('Application not found')

        document = next((document for document in application.documents if document.id == id), None)
        if not document:
            raise NotFound('Document not found')

        #fallback if originating_system is not set in the database
        originating_system = application.originating_system
        if not originating_system:
            if "j200.gov.bc.ca" in document.documenturl:
                originating_system = "VFCBC"
            if "api.nrs.gov.bc.ca" in document.documenturl:
                originating_system = "NROS"

        token_guid = uuid.uuid4()
        cache.set(
            DOWNLOAD_TOKEN(token_guid), {
                'originating_system': originating_system,
                'documenturl': document.documenturl,
                'filename': document.filename
            }, TIMEOUT_5_MINUTES)

        return {'token_guid': token_guid}


class ApplicationDocumentResource(Resource, UserMixin ):
    @api.doc(
        description='Fetch an application document by id',
        params={'token': 'A one-time token issued for downloading the file.'})
    def get(self, application_guid, id):
        token_guid = request.args.get('token', '')
        document_info = cache.get(DOWNLOAD_TOKEN(token_guid))
        cache.delete(DOWNLOAD_TOKEN(token_guid))
        if not document_info:
            raise BadRequest('Valid token requred for download')

        if document_info["originating_system"] == "VFCBC":
            return VFCBCDownloadService.download(document_info["documenturl"],
                                                 document_info["filename"])
        if document_info["originating_system"] == "NROS":
            return NROSDownloadService.download(document_info["documenturl"])

        raise InternalServerError('Unknown application document server')