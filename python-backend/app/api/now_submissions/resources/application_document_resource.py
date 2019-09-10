from flask_restplus import Resource
from werkzeug.exceptions import NotFound

from app.extensions import api
from app.api.now_submissions.models.application import Application
from app.api.now_submissions.response_models import APPLICATION
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin, ErrorMixin

from app.api.services.nros_download_service import NROSDownloadService
from app.api.services.vfcbc_download_service import VFCBCDownloadService


class ApplicationDocumentResource(Resource, UserMixin, ErrorMixin):
    @api.doc(description='Fetch an application document by id', params={})
    #@requires_role_view_all
    #@api.marshal_with(APPLICATION, code=200)
    def get(self, application_guid, id):
        #application = Application.find_by_application_guid(application_guid)
        #if not application:
        #    raise NotFound('Application not found')

        vfcbc_file_url = "https://j200.gov.bc.ca/int/vfcbc/Download.aspx?PosseObjectId=68025730"
        nros_file_url = "https://t1api.nrs.gov.bc.ca/dms-api/v1/files/OM8CRJNFQFSNKBW1XCKZ5G72"

        return VFCBCDownloadService.download(vfcbc_file_url)
        #return NROSDownloadService.download(nros_file_url)
