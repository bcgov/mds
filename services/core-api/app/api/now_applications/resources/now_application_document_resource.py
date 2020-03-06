import requests
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError

from flask import request, current_app
from flask_restplus import Resource

from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all, requires_role_edit_permit, requires_any_of, VIEW_ALL
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser

from app.api.services.document_manager_service import DocumentManagerService
from app.api.mines.documents.models.mine_document import MineDocument

from app.api.now_applications.models.now_application_identity import NOWApplicationIdentity
from app.api.mines.documents.models.mine_document import MineDocument


class NOWApplicationDocumentUploadResource(Resource, UserMixin):
    @api.doc(description='Request a document_manager_guid for uploading a document')
    @requires_role_edit_permit
    def post(self, application_guid):
        now_application_identity = NOWApplicationIdentity.find_by_guid(application_guid)
        if not now_application_identity:
            raise NotFound('No identity record for this application guid.')

        return DocumentManagerService.initializeFileUploadWithDocumentManager(
            request, now_application_identity.mine, 'noticeofwork')


class NOWApplicationDocumentResource(Resource, UserMixin):
    @api.response(204, 'Successfully deleted.')
    @requires_role_edit_permit
    def delete(self, application_guid, mine_document_guid):
        mine_document = MineDocument.find_by_mine_document_guid(mine_document_guid)
        if not mine_document or application_guid != str(
                mine_document.now_application_document_xref.now_application.now_application_guid):
            raise NotFound('No mine_document found for this application guid.')

        mine_document.now_application_document_xref.delete()
        return None, 204


"""
    @api.doc(description='Associate an uploaded file with a variance.',
             params={
                 'application_guid': 'GUID for the notice of work to which the document should be associated'
             })
    @api.marshal_with(VARIANCE_MODEL, code=200)
    @requires_any_of([EDIT_VARIANCE, MINESPACE_PROPONENT])
    def put(self, mine_guid, variance_guid):
        parser = CustomReqparser()
        # Arguments required by MineDocument
        parser.add_argument('document_name', type=str, required=True)
        parser.add_argument('document_manager_guid', type=str, required=True)
        parser.add_argument('variance_document_category_code', type=str, required=True)

        variance = Variance.find_by_variance_guid(variance_guid)

        if not variance:
            raise NotFound('Unable to fetch variance.')

        data = parser.parse_args()
        document_name = data.get('document_name')
        document_manager_guid = data.get('document_manager_guid')

        # Register new file upload
        mine_doc = MineDocument(mine_guid=mine_guid,
                                document_manager_guid=document_manager_guid,
                                document_name=document_name)

        if not mine_doc:
            raise BadRequest('Unable to register uploaded file as document')

        # Associate Variance & MineDocument to create Variance Document
        # Add fields specific to Variance Documents
        mine_doc.save()
        variance_doc = VarianceDocumentXref(
            mine_document_guid=mine_doc.mine_document_guid,
            variance_id=variance.variance_id,
            variance_document_category_code=data.get('variance_document_category_code'))

        variance.documents.append(variance_doc)
        variance.save()
        return variance
"""