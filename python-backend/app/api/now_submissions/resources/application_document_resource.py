from flask_restplus import Resource
from werkzeug.exceptions import NotFound, InternalServerError

from app.extensions import api
from app.api.now_submissions.models.application import Application
from app.api.now_submissions.response_models import APPLICATION
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin, ErrorMixin

from app.api.services.nros_download_service import NROSDownloadService
from app.api.services.vfcbc_download_service import VFCBCDownloadService


class ApplicationDocumentResource(Resource, UserMixin, ErrorMixin):
    @api.doc(description='Fetch an application document by id', params={})
    @requires_role_view_all
    def get(self, application_guid, id):
        application = Application.find_by_application_guid(application_guid)

        if not application:
            raise NotFound('Application not found')

        document = next((document for document in application.documents if document.id == id), None)

        if not document:
            raise NotFound('Document not found')

        originating_system = application.originating_system
        if not originating_system:
            if "j200.gov.bc.ca" in document.documenturl:
                originating_system = "VFCBC"
            if "t1api.nrs.gov.bc.ca" in document.documenturl:
                originating_system = "NROS"

        return originating_system

        if originating_system == "VFCBC":
            return VFCBCDownloadService.download(document.documenturl)
        if originating_system == "NROS":
            return NROSDownloadService.download(document.documenturl)

        raise InternalServerError('Unknown application document server')