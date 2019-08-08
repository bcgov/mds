import decimal
import uuid
import requests
import json

from datetime import datetime
from flask import request, current_app
from flask_restplus import Resource, reqparse
from werkzeug.datastructures import FileStorage
from werkzeug.exceptions import BadRequest, NotFound
from werkzeug import exceptions
from sqlalchemy.exc import DBAPIError

from ..models.mine_expected_document import MineExpectedDocument
from ...expected.models.mine_expected_document import MineExpectedDocument
from ...expected.models.mine_expected_document_xref import MineExpectedDocumentXref
from app.api.mines.mine.models.mine import Mine
from app.api.mines.documents.mines.models.mine_document import MineDocument

from app.api.services.document_manager_service import DocumentManagerService

from app.extensions import api, db
from app.api.utils.access_decorators import requires_any_of, MINE_EDIT, MINESPACE_PROPONENT
from app.api.utils.resources_mixins import UserMixin

from app.api.mines.mine_api_models import MINE_EXPECTED_DOCUMENT_MODEL


class ExpectedDocumentUploadResource(Resource, UserMixin):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('mine_document_guid', type=str, store_missing=False)
    parser.add_argument('document_manager_guid', type=str, store_missing=False)
    parser.add_argument('filename', type=str, store_missing=False)

    @api.doc(
        params={
            'expected_document_guid':
            'Required: The guid of the expected document that this upload will be satisfying.'
        })
    @requires_any_of([MINE_EDIT, MINESPACE_PROPONENT])
    def post(self, expected_document_guid):
        expected_document = MineExpectedDocument.find_by_exp_document_guid(expected_document_guid)
        if not expected_document:
            raise NotFound('Expected Document not found')

        return DocumentManagerService.initializeFileUploadWithDocumentManager(
            request, expected_document.mine, 'tailings')

    @requires_any_of([MINE_EDIT, MINESPACE_PROPONENT])
    @api.marshal_with(MINE_EXPECTED_DOCUMENT_MODEL, code=200)
    def put(self, expected_document_guid):
        expected_document = MineExpectedDocument.find_by_exp_document_guid(expected_document_guid)
        if not expected_document:
            return NotFound('Expected Document not found')

        data = self.parser.parse_args()
        if data.get('mine_document_guid'):
            # Associating existing mine document
            mine_doc = MineDocument.find_by_mine_document_guid(data.get('mine_document_guid'))
            if not mine_doc:
                raise BadRequest('Mine Document not found')

            expected_document.related_documents.append(mine_doc)
            db.session.commit()
        elif data.get('document_manager_guid'):
            # Register and associate a new file upload
            filename = data.get('filename')
            if not filename:
                raise BadRequest('Must supply filename for new file upload')

            mine_doc = MineDocument(mine_guid=expected_document.mine_guid,
                                    document_manager_guid=data.get('document_manager_guid'),
                                    document_name=filename)

            expected_document.related_documents.append(mine_doc)
            db.session.commit()
        else:
            raise BadRequest('Must specify either Mine Document GIUD or Docuemnt Manager GUID')

        return expected_document

    @requires_any_of([MINE_EDIT, MINESPACE_PROPONENT])
    def delete(self, expected_document_guid=None, mine_document_guid=None):
        if expected_document_guid is None or mine_document_guid is None:
            raise BadRequest('Must provide a expected document guid and a mine document guid')

        expected_document = MineExpectedDocument.find_by_exp_document_guid(expected_document_guid)
        mine_document = MineDocument.find_by_mine_document_guid(mine_document_guid)

        if expected_document is None or mine_document is None:
            raise NotFound('Either the Expected Document or the Mine Document was not found')

        expected_document.related_documents.remove(mine_document)
        expected_document.save()

        return '', 204
