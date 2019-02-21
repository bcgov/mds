from flask_restplus import Resource, reqparse
from datetime import datetime

from ...required.models.required_documents import RequiredDocument
from ..models.mine_expected_document import MineExpectedDocument
from ..models.document_status import ExpectedDocumentStatus

from app.extensions import api, db
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
        doc_list = data['documents']
        mine_new_docs = []
        for new_doc in doc_list:
            if new_doc['req_document_guid'] is not None:
                req_doc = RequiredDocument.find_by_req_doc_guid(new_doc['req_document_guid'])

            mine_exp_doc = MineExpectedDocument(
                req_document_guid=new_doc['req_document_guid'],
                exp_document_name=new_doc['document_name'],
                exp_document_description=new_doc.get('document_description'),
                mine_guid=mine_guid,
                exp_document_status_code='MIA',
                **self.get_create_update_dict())

            db.session.add(mine_exp_doc)
            mine_new_docs.append(mine_exp_doc)
            mine_exp_doc.set_due_date()
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return self.create_error_payload(
                500, "Error creating expected document, none were created"), 500
        return {'expected_mine_documents': list(map(lambda x: x.json(), mine_new_docs))}
