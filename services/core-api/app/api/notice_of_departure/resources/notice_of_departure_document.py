import requests
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError

from flask import request, current_app
from flask_restx import Resource

from app.extensions import api
from app.api.utils.access_decorators import (requires_any_of, MINESPACE_PROPONENT, EDIT_PERMIT)
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser

from app.api.mines.mine.models.mine import Mine
from app.api.mines.documents.models.mine_document import MineDocument
from app.api.notice_of_departure.dto import NOD_MODEL
from app.api.notice_of_departure.models.notice_of_departure import NoticeOfDeparture
from app.api.notice_of_departure.models.notice_of_departure_document_xref import NoticeOfDepartureDocumentXref, DocumentType
from app.api.services.document_manager_service import DocumentManagerService


class MineNoticeOfDepartureNewDocumentUploadResource(Resource, UserMixin):

    @api.doc(description='Request a document_manager_guid for uploading a document')
    @requires_any_of([EDIT_PERMIT, MINESPACE_PROPONENT])
    def post(self, mine_guid):
        mine = Mine.find_by_mine_guid(mine_guid)
        if not mine:
            raise NotFound('Mine not found.')

        return DocumentManagerService.initializeFileUploadWithDocumentManager(
            request, mine, 'notices_of_depature')


class MineNoticeOfDepartureDocumentUploadResource(Resource, UserMixin):

    @api.doc(
        description='Associate an uploaded file with a notice of depature.',
        params={
            'nod_guid':
            'GUID for the notice of departure to which the document should be associated'
        })
    @api.marshal_with(NOD_MODEL, code=200)
    @requires_any_of([EDIT_PERMIT, MINESPACE_PROPONENT])
    def put(self, nod_guid):
        parser = CustomReqparser()
        # Arguments required by MineDocument
        parser.add_argument('document_name', type=str, required=True)
        parser.add_argument('document_manager_guid', type=str, required=True)
        parser.add_argument('document_type', type=str, required=True)

        nod = NoticeOfDeparture.find_one(nod_guid)

        if not nod:
            raise NotFound('Unable to fetch Notice of departure.')

        data = parser.parse_args()
        document_name = data.get('document_name')
        document_type = data.get('document_type')
        document_manager_guid = data.get('document_manager_guid')

        # if checklist, then soft delete previous checklist
        if (document_type == 'checklist'):
            NoticeOfDepartureDocumentXref.delete_current_checklist(nod_guid)

        # Register new file upload
        mine_doc = MineDocument(
            mine_guid=nod.mine_guid,
            document_manager_guid=document_manager_guid,
            document_name=document_name)

        if not mine_doc:
            raise BadRequest('Unable to register uploaded file as document')

        # Associate NOD & MineDocument to create NOD Document
        # Add fields specific to NOD Documents
        nod_doc = NoticeOfDepartureDocumentXref(
            mine_document=mine_doc, nod_guid=nod_guid, document_type=document_type)

        nod.documents.append(nod_doc)
        nod.save()
        return nod


class MineNoticeOfDepartureDocumentResource(Resource, UserMixin):

    @requires_any_of([EDIT_PERMIT])
    def delete(self, nod_guid, docman_guid):
        doc = NoticeOfDepartureDocumentXref.find_by_docman_guid(docman_guid)

        if doc == None:
            raise NotFound('Document not found')

        doc.delete()

        nod = NoticeOfDeparture.find_one(nod_guid)

        if not nod:
            raise NotFound('Unable to fetch Notice of departure.')

        nod.save()
