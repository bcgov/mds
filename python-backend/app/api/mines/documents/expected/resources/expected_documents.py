import decimal
import uuid
from datetime import datetime

from flask import request
from flask_restplus import Resource, reqparse, fields

from werkzeug.exceptions import BadRequest, InternalServerError, NotFound

from ..models.mine_expected_document import MineExpectedDocument
from .....mines.mine.models.mine import Mine
from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all, requires_role_mine_edit, requires_any_of, VIEW_ALL, MINE_EDIT, MINESPACE_PROPONENT
from app.api.utils.resources_mixins import UserMixin

from app.api.mines.mine_api_models import MINE_EXPECTED_DOCUMENT_MODEL


class ExpectedDocumentListResource(Resource, UserMixin):
    parser = reqparse.RequestParser(trim=True)

    parser.add_argument('exp_document_name', type=str)
    parser.add_argument('exp_document_description', type=str)
    parser.add_argument('due_date', type=str)
    parser.add_argument('received_date', type=str)
    parser.add_argument('exp_document_status_code', type=str)
    parser.add_argument('hsrc_code', type=str)

    @api.marshal_with(MINE_EXPECTED_DOCUMENT_MODEL, code=200, envelope='records')
    def get(self, mine_guid):
        mine = Mine.find_by_mine_guid(mine_guid)
        if not Mine:
            raise NotFound('Mine not found.')
        return mine.expected_documents


class ExpectedDocumentResource(Resource, UserMixin):
    parser = reqparse.RequestParser(trim=True)

    parser.add_argument('exp_document_name', type=str, store_missing=False)
    parser.add_argument('exp_document_description', type=str, store_missing=False)
    parser.add_argument('due_date', type=str, store_missing=False)
    parser.add_argument('received_date', type=str, store_missing=False)
    parser.add_argument('exp_document_status_code', type=str, store_missing=False)
    parser.add_argument('hsrc_code', type=str, store_missing=False)

    @api.doc(
        params={
            'exp_doc_guid':
            'Required: Mine number or guid. returns list of expected documents for the mine'
        })
    @requires_role_view_all
    @api.marshal_with(MINE_EXPECTED_DOCUMENT_MODEL, code=200)
    def get(self, exp_doc_guid):
        mine_exp_doc = MineExpectedDocument.find_by_exp_document_guid(exp_doc_guid)
        if mine_exp_doc is None:
            raise NotFound('Expected document not found')
        return mine_exp_doc

    @api.doc(params={'exp_doc_guid': 'Required: Mine number or guid. Updates expected document'})
    @requires_any_of([MINE_EDIT, MINESPACE_PROPONENT])
    @api.marshal_with(MINE_EXPECTED_DOCUMENT_MODEL, code=200)
    def put(self, exp_doc_guid):
        exp_doc = MineExpectedDocument.find_by_exp_document_guid(exp_doc_guid)
        if exp_doc is None:
            raise NotFound(f'expected_document with guid "{exp_doc_guid}" not found')

        data = self.parser.parse_args()

        for key, value in data.items():
            setattr(exp_doc, key, value)

        exp_doc.save()
        return exp_doc

    @api.doc(params={'exp_doc_guid': 'Required: Mine number or guid. Deletes expected document.'},
             code=204)
    @requires_role_mine_edit
    def delete(self, exp_doc_guid):
        exp_doc = MineExpectedDocument.find_by_exp_document_guid(exp_doc_guid)
        if not exp_doc:
            raise NotFound(f'expected_document with guid "{exp_doc_guid}" not found')
        exp_doc.active_ind = False
        exp_doc.save()
        return '', 204
