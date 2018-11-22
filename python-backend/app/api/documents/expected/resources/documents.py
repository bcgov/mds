import decimal
import uuid
from datetime import datetime

from flask import request
from flask_restplus import Resource, reqparse

from ..models.document import ExpectedDocument

from app.extensions import jwt, api
from ....utils.resources_mixins import UserMixin, ErrorMixin


class ExpectedDocumentResource(Resource, UserMixin, ErrorMixin):
    parser = reqparse.RequestParser()
    parser.add_argument('documents', type=list, required=True, help='list of documents add', location="json")

    @api.doc(params={'exp_doc_guid': 'Required: Mine number or guid. returns list of expected documents for the mine'})
    @jwt.requires_roles(["mds-mine-view"])
    def get(self, exp_doc_guid=None):
        if exp_doc_guid is None:
            return self.create_error_payload(404, 'Must provide a expected document guid.'), 404
        mine_exp_doc = ExpectedDocument.find_by_exp_document_guid(exp_doc_guid)
        return { 'expected_mine_documents' : mine_exp_doc.json() }

    @api.doc(params={'exp_doc_guid': 'Required: Mine number or guid. returns list of expected documents for the mine'})
    @jwt.requires_roles(["mds-mine-create"])
    def put(self, exp_doc_guid=None):
        if exp_doc_guid is None:
            return self.create_error_payload(404, 'Must provide a expected document guid.'), 404

        exp_doc = ExpectedDocument.find_by_exp_document_guid(exp_doc_guid)
        if exp_doc is not None:
            data = self.parser.parse_args()
            updated_doc =  data['documents'][0]
            if str(exp_doc.exp_document_guid) != updated_doc['exp_document_guid']:
                return self.create_error_payload(500, 'exp_document does not match guid provided'), 500

            exp_doc.exp_document_name = updated_doc.get('exp_document_name')
            exp_doc.exp_document_description = updated_doc.get('exp_document_description')
            #exp_doc.due_date = datetime.strptime(updated_doc.get('due_date'), '%b %d %Y %I:%M%p') haven't defined datetime format yet
            exp_doc.save()
            return {'expected_document': exp_doc.json() }

        return self.create_error_payload(404, f'expected_document with guid "{exp_doc_guid}" not found' ), 404
    
    @api.doc(params={'exp_doc_guid': 'Required: Mine number or guid. returns list of expected documents for the mine'})
    @jwt.requires_roles(["mds-mine-create"])
    def delete(self, exp_doc_guid=None):
        if exp_doc_guid is None:
            return self.create_error_payload(404, 'Must provide a expected document guid.'), 404
        exp_doc = ExpectedDocument.find_by_exp_document_guid(exp_doc_guid)
        if exp_doc is not None:
            exp_doc.active_ind = False
            exp_doc.save()
            return {'status':200, 'message':'expected_document deleted successfully.'}
        return self.create_error_payload(404, f'expected_document with guid "{exp_doc_guid}" not found' ), 404