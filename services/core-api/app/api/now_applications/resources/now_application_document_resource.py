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
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.mines.response_models import MINE_DOCUMENT_MODEL


class NOWApplicationDocumentUploadResource(Resource, UserMixin):
    @api.doc(description='Request a document_manager_guid for uploading a document')
    @requires_role_edit_permit
    def post(self, application_guid):
        now_application_identity = NOWApplicationIdentity.find_by_guid(application_guid)
        if not now_application_identity:
            raise NotFound('No identity record for this application guid.')

        return DocumentManagerService.initializeFileUploadWithDocumentManager(
            request, now_application_identity.mine, 'noticeofwork')


class NOWApplicationDocumentSortResource(Resource, UserMixin):

    parser = CustomReqparser()
    parser.add_argument(
        'sorted_documents',
        type=list,
        location='json',
        store_missing=False,
        required=False,
    )

    @api.doc(description='Modify the order of documents in the permit package.')
    @api.response(200, 'Successfully modified permit package order.')
    @requires_role_edit_permit
    def put(self, application_guid):
        now_application_identity = NOWApplicationIdentity.find_by_guid(application_guid)
        if not now_application_identity:
            raise NotFound('No identity record for this application guid.')

        data = self.parser.parse_args()

        sorted_documents = data.get('sorted_documents', [])
        for doc in sorted_documents:
            mine_document_guid = doc.get('mine_document_guid')
            mine_document = MineDocument.find_by_mine_document_guid(mine_document_guid)
            if not mine_document:
                raise NotFound('Mine Document not found.')

            if mine_document.now_application_document_xref:
                xref = mine_document.now_application_document_xref
            if mine_document.now_application_document_identity_xref:
                xref = mine_document.now_application_document_identity_xref

            final_package_order = doc.get('final_package_order')
            xref.final_package_order = final_package_order
            xref.save()

        return None, 200


class NOWApplicationDocumentResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument('preamble_title', type=str, required=False)
    parser.add_argument('preamble_author', type=str, required=False)
    parser.add_argument('preamble_date', type=str, required=False)
    parser.add_argument('is_final_package', type=bool, required=False)
    parser.add_argument('final_package_order', type=int, required=False)
    parser.add_argument('description', type=str, required=False)

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

        mine_document.deleted_ind = True
        mine_document.save()
        return None, 204

    @api.response(requests.codes.ok, 'Successfully updated document details.')
    @requires_role_edit_permit
    @api.marshal_with(MINE_DOCUMENT_MODEL, code=requests.codes.ok)
    def put(self, application_guid, mine_document_guid):
        data = self.parser.parse_args()

        mine_document = MineDocument.find_by_mine_document_guid(mine_document_guid)
        if not mine_document:
            raise NotFound('No mine_document found for this application guid.')

        new_description = data.get('description', None)
        is_final_package = data.get('is_final_package', None)

        if mine_document.now_application_document_xref:
            xref = mine_document.now_application_document_xref

        if mine_document.now_application_document_identity_xref:
            xref = mine_document.now_application_document_identity_xref

        if new_description:
            xref.description = new_description

        if is_final_package is not None:
            xref.is_final_package = is_final_package

        if xref.is_final_package:
            xref.preamble_title = data.get('preamble_title')
            xref.preamble_author = data.get('preamble_author')
            xref.preamble_date = data.get('preamble_date')

            now_application = NOWApplication.find_by_application_guid(application_guid)
            if not now_application:
                raise NotFound('Notice of Work not found.')

            final_package_order = data.get('final_package_order')
            if final_package_order is None:
                final_package_order = now_application.next_document_final_package_order
            xref.final_package_order = final_package_order
        else:
            xref.final_package_order = None

        xref.save()
        mine_document.save()

        return mine_document, requests.codes.ok


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
