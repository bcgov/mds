import uuid
import requests
import json

from flask import request, current_app, url_for
from flask_restplus import Resource, reqparse
from app.extensions import api, db
from werkzeug.exceptions import BadRequest, InternalServerError, NotFound

from app.api.utils.access_decorators import requires_role_view_all, requires_role_mine_edit
from app.api.utils.resources_mixins import UserMixin

from ..models.tailings import MineTailingsStorageFacility
from app.api.required_documents.models.required_documents import RequiredDocument
from app.api.mines.documents.expected.models.mine_expected_document import MineExpectedDocument
from app.api.mines.mine.models.mine import Mine
from app.api.mines.mine_api_models import MINE_TSF_MODEL


class MineTailingsStorageFacilityListResource(Resource, UserMixin):
    parser = reqparse.RequestParser()
    parser.add_argument('mine_tailings_storage_facility_name',
                        type=str,
                        trim=True,
                        help='Name of the tailings storage facility.',
                        required=True)

    @api.doc(description='Gets the tailing storage facilites for the given mine')
    @api.marshal_with(MINE_TSF_MODEL,
                      envelope='mine_tailings_storage_facilities',
                      as_list=True,
                      code=200)
    @requires_role_view_all
    def get(self, mine_guid):
        mine = Mine.find_by_mine_guid(mine_guid)
        if not mine:
            raise NotFound('Mine not found.')
        return mine.mine_tailings_storage_facilities

    @api.doc(description='Creates a new tailing storage facility for the given mine')
    @api.marshal_with(MINE_TSF_MODEL, code=200)
    @requires_role_mine_edit
    def post(self, mine_guid):
        mine = Mine.find_by_mine_guid(mine_guid)
        if not mine:
            raise NotFound('Mine not found.')

        # see if this would be the first TSF
        mine_tsf_list = mine.mine_tailings_storage_facilities
        is_mine_first_tsf = len(mine_tsf_list) == 0

        data = self.parser.parse_args()
        mine_tsf = MineTailingsStorageFacility.create(
            mine, mine_tailings_storage_facility_name=data['mine_tailings_storage_facility_name'])
        mine.mine_tailings_storage_facilities.append(mine_tsf)

        if is_mine_first_tsf:
            try:
                tsf_required_documents = RequiredDocument.find_by_req_doc_category('TSF', 'INI')

                for tsf_req_doc in tsf_required_documents:
                    mine_exp_doc = MineExpectedDocument(
                        req_document_guid=tsf_req_doc.req_document_guid,
                        exp_document_name=tsf_req_doc.req_document_name,
                        exp_document_description=tsf_req_doc.description,
                        mine_guid=mine.mine_guid,
                        hsrc_code=tsf_req_doc.hsrc_code,
                        exp_document_status_code='MIA')

                    mine.mine_expected_documents.append(mine_exp_doc)
            except Exception as e:
                db.session.rollback()
                current_app.logger.error(str(e))
                raise InternalServerError(str(e) + ", tsf not created")
        mine.save()
        return mine_tsf
