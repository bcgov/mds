import requests

from werkzeug.exceptions import BadRequest, NotFound, Conflict
from flask import request, current_app
from flask_restplus import Resource, reqparse

from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all, requires_role_edit_permit, requires_any_of, VIEW_ALL
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.services.document_manager_service import DocumentManagerService
from app.api.mines.documents.models.mine_document import MineDocument
from app.api.now_applications.models.now_application_identity import NOWApplicationIdentity
from app.api.now_applications.models.now_application import NOWApplication
from app.api.mines.documents.models.mine_document import MineDocument
from app.api.now_applications.models.now_application_document_identity_xref import NOWApplicationDocumentIdentityXref


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

        if mine_document.now_application_document_xref.is_final_package:
            raise BadRequest(
                'You cannot remove a document that is a part of the Final Application Package.')
        elif mine_document.now_application_document_xref.is_referral_package:
            raise BadRequest('You cannot remove a document that is a part of the Referral Package.')
        elif mine_document.now_application_document_xref.is_consultation_package:
            raise BadRequest(
                'You cannot remove a document that is a part of the Consultation Package.')

        mine_document.now_application_document_xref.delete()
        return None, 204


class NOWApplicationDocumentIdentityResource(Resource, UserMixin):
    parser = reqparse.RequestParser(trim=True)

    parser.add_argument('document_manager_document_guid', type=str, location='json')
    parser.add_argument('messageid', type=int, location='json')
    parser.add_argument('documenturl', type=str, location='json')
    parser.add_argument('filename', type=str, location='json')
    parser.add_argument('documenttype', type=str, location='json')
    parser.add_argument('description', type=str, location='json')

    @api.response(201, 'Successfully linked document.')
    def post(self, application_guid):
        data = self.parser.parse_args()
        document_manager_document_guid = data.get('document_manager_document_guid')
        message_id = data.get('messageid')
        document_url = data.get('documenturl')
        file_name = data.get('filename')
        document_type = data.get('documenttype')
        description = data.get('description')

        document = NOWApplicationDocumentIdentityXref.query.filter_by(
            messageid=message_id,
            documenturl=document_url,
            documenttype=document_type,
            filename=file_name).one_or_none()
        if document:
            raise Conflict('Document already exists')

        now_application_identity = NOWApplicationIdentity.query.filter_by(
            messageid=message_id).one_or_none()
        if not now_application_identity:
            current_app.logger.error('Notice of Work identity not found')
            raise NotFound('Notice of Work identity not found')

        new_mine_doc = MineDocument(
            mine_guid=now_application_identity.mine_guid,
            document_manager_guid=document_manager_document_guid,
            document_name=file_name)

        new_document_identity_xref = NOWApplicationDocumentIdentityXref(
            messageid=message_id,
            documenturl=document_url,
            documenttype=document_type,
            description=description,
            filename=file_name,
            now_application_id=now_application_identity.now_application_id,
            mine_document=new_mine_doc)

        new_document_identity_xref.save()

        return requests.codes.created