import decimal
import uuid

from flask import request
from flask_restplus import Resource, reqparse

from ..models.expected_documents import MineExpectedDocument

from app.extensions import jwt, api
from ....utils.resources_mixins import UserMixin, ErrorMixin


class MineExpectedDocumentResource(Resource, UserMixin, ErrorMixin):
    parser = reqparse.RequestParser()
    parser.add_argument('documents', type=list, required=True, help='list of documents to add to a mine', location="json")

    @api.doc(params={'mine_guid': 'Required: Mine number or guid. returns list of expected documents for the mine'})
    @jwt.requires_roles(["mds-mine-view"])
    def get(self, mine_guid=None):
        if mine_guid == None:
            return self.create_error_payload(401, 'Must provide a mine id.')
    
        mine_exp_docs = MineExpectedDocument.find_by_mine_guid(mine_guid)
        return {
            'mine_expected_documents' : list(map(lambda x: x.json(), mine_exp_docs) if mine_exp_docs else [])
        }

    @api.expect(parser)
    @api.doc(params={'mine_guid': 'Required: Mine number or guid. creates expected documents from payload for mine_guid'})
    @jwt.requires_roles(["mds-mine-create"])
    def post(self, mine_guid):
        data = self.parser.parse_args()
        doc_list =  data['documents']
        mine_new_docs = []
        for new_doc in doc_list:
            mine_exp_doc = MineExpectedDocument(
                req_document_guid=new_doc['req_document_guid'],
                exp_document_name=new_doc['document_name'],
                exp_document_description=new_doc.get('document_description'),
                mine_guid = mine_guid,
                **self.get_create_update_dict()
            )
            mine_exp_doc.save()
            mine_new_docs.append(mine_exp_doc)
        return {
            'mine_expected_documents' : list(map(lambda x: x.json(), mine_new_docs))
        }
       

