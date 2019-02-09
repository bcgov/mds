import decimal
import uuid

from flask import request
from flask_restplus import Resource, reqparse
from datetime import datetime

from ...required.models.required_documents import RequiredDocument
from ..models.mine_expected_document import MineExpectedDocument
from ..models.document_status import ExpectedDocumentStatus

from app.extensions import api
from ....utils.access_decorators import requires_role_mine_view, requires_role_mine_create
from ....utils.resources_mixins import UserMixin, ErrorMixin


class ExpectedMineDocumentResource(Resource, UserMixin, ErrorMixin):
    parser = reqparse.RequestParser()
    parser.add_argument(
        'documents',
        type=list,
        required=True,
        help='list of documents to add to a mine',
        location="json")

    @api.doc(params={
        'mine_guid':
        'Optional: Mine number or guid. returns list of expected documents for the mine'
    })
    @requires_role_mine_view
    def get(self, mine_guid=None):
        if mine_guid == None:
            return self.create_error_payload(401, 'Must provide a mine id.')
        mine_exp_docs = MineExpectedDocument.find_by_mine_guid(mine_guid)
        return {
            'expected_mine_documents':
            list(map(lambda x: x.json(), mine_exp_docs) if mine_exp_docs else [])
        }

    @api.expect(parser)
    @api.doc(
        params={
            'mine_guid':
            'Required: Mine number or guid. creates expected documents from payload for mine_guid'
        })
    @requires_role_mine_create
    def post(self, mine_guid):
        data = self.parser.parse_args()
        doc_list = data.get('documents')
        mine_new_docs = []
        not_received = ExpectedDocumentStatus.find_by_expected_document_description('Not Received')
        for new_doc in doc_list:
            if new_doc['req_document_guid'] != None:
                req_doc = RequiredDocument.find_by_req_doc_guid(new_doc.get('req_document_guid')

            mine_exp_doc = MineExpectedDocument(
                req_document_guid=new_doc.get('req_document_guid'),
                exp_document_name=new_doc.get('document_name'),
                exp_document_description=new_doc.get('document_description'),
                mine_guid=mine_guid,
                exp_document_status_guid=not_received.exp_document_status_guid,
                due_date=MineExpectedDocument.add_due_date_to_expected_document(
                    self, datetime.now(), req_doc.req_document_due_date_type,
                    req_doc.req_document_due_date_period_months),
                **self.get_create_update_dict())
            mine_exp_doc.save()
            mine_new_docs.append(mine_exp_doc)
        return {'expected_mine_documents': list(map(lambda x: x.json(), mine_new_docs))}
