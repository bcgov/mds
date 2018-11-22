import decimal
import uuid

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
    
    def delete(self, exp_doc_guid=None):
        if exp_doc_guid is None:
            return self.create_error_payload(404, 'Must provide a expected document guid.'), 404
        exp_doc = ExpectedDocument.find_by_exp_document_guid(exp_doc_guid)
        if exp_doc is not None:
            exp_doc.active_ind = False
            exp_doc.save()
            return {'status':200, 'message':'expected_document deleted successfully.'}
        return self.create_error_payload(404, f'expected_document with guid "{exp_doc_guid}" not found' ), 404