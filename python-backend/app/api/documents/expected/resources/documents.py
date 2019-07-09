import decimal
import uuid
from datetime import datetime

from flask import request
from flask_restplus import Resource, reqparse

from werkzeug.exceptions import BadRequest, InternalServerError, NotFound

from ..models.mine_expected_document import MineExpectedDocument
from app.extensions import api
from ....utils.access_decorators import requires_role_view_all, requires_role_mine_edit, requires_any_of, VIEW_ALL, MINE_EDIT, MINESPACE_PROPONENT
from ....utils.resources_mixins import UserMixin, ErrorMixin


class ExpectedDocumentResource(Resource, UserMixin, ErrorMixin):
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
    def get(self, exp_doc_guid=None):
        if exp_doc_guid is None:
            return self.create_error_payload(404, 'Must provide a expected document guid.'), 404
        mine_exp_doc = MineExpectedDocument.find_by_exp_document_guid(exp_doc_guid)
        if mine_exp_doc is None:
            return self.create_error_payload(404, 'Expected document not found'), 404
        return {'expected_document': mine_exp_doc.json()}

    @api.doc(params={'exp_doc_guid': 'Required: Mine number or guid. Updates expected document'})
    @requires_any_of([MINE_EDIT, MINESPACE_PROPONENT])
    def put(self, exp_doc_guid=None):
        if exp_doc_guid is None:
            raise BadRequest('Must provide a expected document guid.')

        exp_doc = MineExpectedDocument.find_by_exp_document_guid(exp_doc_guid)
        if exp_doc is None:
            raise NotFound(f'expected_document with guid "{exp_doc_guid}" not found')

        data = self.parser.parse_args()

        for key, value in data.items():
            setattr(exp_doc, key, value)

        exp_doc.save()
        return {'expected_document': exp_doc.json()}

    @api.doc(params={'exp_doc_guid': 'Required: Mine number or guid. Deletes expected document.'})
    @requires_role_mine_edit
    def delete(self, exp_doc_guid=None):
        if exp_doc_guid is None:
            return self.create_error_payload(404, 'Must provide a expected document guid.'), 404
        exp_doc = MineExpectedDocument.find_by_exp_document_guid(exp_doc_guid)
        if exp_doc is not None:
            exp_doc.active_ind = False
            exp_doc.save()
            return {'status': 200, 'message': 'expected_document deleted successfully.'}
        return self.create_error_payload(
            404, f'expected_document with guid "{exp_doc_guid}" not found'), 404
