import decimal
import uuid
from datetime import datetime

from flask import request
from flask_restplus import Resource, reqparse

from ..models.document import ExpectedDocument

from app.extensions import api
from ....utils.access_decorators import requires_role_mine_view, requires_role_mine_create, requires_any_of, MINE_VIEW, MINE_CREATE, MINESPACE_PROPONENT
from ....utils.resources_mixins import UserMixin, ErrorMixin


class ExpectedDocumentResource(Resource, UserMixin, ErrorMixin):
    parser = reqparse.RequestParser()
    parser.add_argument(
        'document', type=dict, required=True, help='document to change', location="json")

    @api.doc(
        params={
            'exp_doc_guid':
            'Required: Mine number or guid. returns list of expected documents for the mine'
        })
    @requires_role_mine_view
    def get(self, exp_doc_guid=None):
        if exp_doc_guid is None:
            return self.create_error_payload(404, 'Must provide a expected document guid.'), 404
        mine_exp_doc = ExpectedDocument.find_by_exp_document_guid(exp_doc_guid)
        if mine_exp_doc is None:
            return self.create_error_payload(404, 'Expected document not found'), 404
        return {'expected_document': mine_exp_doc.json()}

    @api.doc(params={'exp_doc_guid': 'Required: Mine number or guid. Updates expected document'})
    @requires_any_of([MINE_CREATE, MINESPACE_PROPONENT])
    def put(self, exp_doc_guid=None):
        if exp_doc_guid is None:
            return self.create_error_payload(404, 'Must provide a expected document guid.'), 404

        exp_doc = ExpectedDocument.find_by_exp_document_guid(exp_doc_guid)
        if exp_doc is not None:
            data = self.parser.parse_args()
            updated_doc = data['document']
            if str(exp_doc.exp_document_guid) != updated_doc['exp_document_guid']:
                return self.create_error_payload(500,
                                                 'exp_document does not match guid provided'), 500

            exp_doc.exp_document_name = updated_doc.get('exp_document_name')
            exp_doc.exp_document_description = updated_doc.get('exp_document_description')
            if updated_doc.get('due_date') is not None:
                exp_doc.due_date = updated_doc.get('due_date')

            exp_doc.received_date = updated_doc.get('received_date')
            exp_doc.exp_document_description = updated_doc.get('exp_document_description')

            if updated_doc.get('exp_document_status_guid') is not None:
                if updated_doc.get('exp_document_status_guid') != 'None':
                    exp_doc.exp_document_status_guid = updated_doc.get('exp_document_status_guid')

            exp_doc.save()
            return {'expected_document': exp_doc.json()}

        return self.create_error_payload(
            404, f'expected_document with guid "{exp_doc_guid}" not found'), 404

    @api.doc(params={'exp_doc_guid': 'Required: Mine number or guid. Deletes expected document.'})
    @requires_role_mine_create
    def delete(self, exp_doc_guid=None):
        if exp_doc_guid is None:
            return self.create_error_payload(404, 'Must provide a expected document guid.'), 404
        exp_doc = ExpectedDocument.find_by_exp_document_guid(exp_doc_guid)
        if exp_doc is not None:
            exp_doc.active_ind = False
            exp_doc.save()
            return {'status': 200, 'message': 'expected_document deleted successfully.'}
        return self.create_error_payload(
            404, f'expected_document with guid "{exp_doc_guid}" not found'), 404
