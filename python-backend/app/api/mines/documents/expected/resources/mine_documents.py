from flask_restplus import Resource, reqparse
from datetime import datetime

from app.api.required_documents.models.required_documents import RequiredDocument
from ..models.mine_expected_document import MineExpectedDocument
from ..models.document_status import ExpectedDocumentStatus

from werkzeug.exceptions import BadRequest, InternalServerError, NotFound

from app.extensions import api, db
from app.api.utils.access_decorators import requires_role_view_all, requires_role_mine_edit
from app.api.utils.resources_mixins import UserMixin

from app.api.mines.mine_api_models import MINE_EXPECTED_DOCUMENT_MODEL


class ExpectedMineDocumentResource(Resource, UserMixin):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('documents',
                        type=list,
                        required=True,
                        help='list of documents to add to a mine',
                        location="json")

    @api.doc(params={
        'mine_guid':
        'Optional: Mine number or guid. returns list of expected documents for the mine'
    })
    @requires_role_view_all
    @api.marshal_with(MINE_EXPECTED_DOCUMENT_MODEL, code=200, envelope='expected_mine_documents')
    def get(self, mine_guid=None):
        mine_exp_docs = MineExpectedDocument.find_by_mine_guid(mine_guid)
        return mine_exp_docs

    @api.expect(parser)
    @api.doc(
        params={
            'mine_guid':
            'Required: Mine number or guid. creates expected documents from payload for mine_guid'
        })
    @requires_role_mine_edit
    @api.marshal_with(MINE_EXPECTED_DOCUMENT_MODEL, code=200, envelope='expected_mine_documents')
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
                hsrc_code=req_doc.hsrc_code,
                exp_document_status_code='MIA')

            db.session.add(mine_exp_doc)
            mine_new_docs.append(mine_exp_doc)
            mine_exp_doc.set_due_date()
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise InternalServerError("Error creating expected document, none were created")
        return mine_new_docs