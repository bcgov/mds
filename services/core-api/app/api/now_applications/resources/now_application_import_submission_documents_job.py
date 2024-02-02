import requests

from flask import request
from flask_restx import Resource
from werkzeug.exceptions import NotFound

from app.api.utils.access_decorators import requires_role_mine_admin
from app.api.utils.resources_mixins import UserMixin
from app.api.now_applications.models.now_application_identity import NOWApplicationIdentity
from app.api.services.document_manager_service import DocumentManagerService


class NOWApplicationImportSubmissionDocumentsJobResource(Resource, UserMixin):
    @requires_role_mine_admin
    def post(self, application_guid):
        now_application_identity = NOWApplicationIdentity.find_by_guid(application_guid)
        if not now_application_identity:
            raise NotFound('No identity record for this application guid.')

        now_application = now_application_identity.now_application
        if now_application:
            resp = DocumentManagerService.importNoticeOfWorkSubmissionDocuments(
                request, now_application)
            now_application_identity.is_document_import_requested = resp.status_code == requests.codes.created
            now_application_identity.save()
            return resp
