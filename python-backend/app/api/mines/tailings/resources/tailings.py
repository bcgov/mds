import uuid
import requests
import json

from flask import request, current_app, url_for
from flask_restplus import Resource, reqparse
from app.extensions import api, db
from werkzeug.exceptions import BadRequest, InternalServerError, NotFound

from app.api.utils.access_decorators import requires_role_view_all, requires_role_mine_edit
from app.api.utils.resources_mixins import UserMixin, ErrorMixin
from app.api.utils.url import get_documents_svc_url

from ..models.tailings import MineTailingsStorageFacility
from app.api.mines.mine.models.mine import Mine

from app.api.mines.mine_api_models import MINE_TSF_MODEL


class MineTailingsStorageFacilityListResource(Resource, UserMixin):
    parser = reqparse.RequestParser()
    parser.add_argument(
        'mine_tailings_storage_facility_name',
        type=str,
        trim=True,
        help='Name of the tailings storage facility.',
        required=True)

    @api.doc(description='Gets the tailing storage facilites for the given mine')
    @api.marshal_with(
        MINE_TSF_MODEL, envelope='mine_tailings_storage_facilities', as_list=True, code=200)
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
                req_documents_url = get_documents_svc_url('/required?category=TSF&sub_category=INI')
                get_tsf_docs_resp = requests.get(
                    req_documents_url,
                    headers={'Authorization': request.headers.get('Authorization')})

                if get_tsf_docs_resp.status_code != 200:
                    raise Exception(f'get_tsf_req_docs returned >> {get_tsf_docs_resp.status_code}')

                tsf_required_documents = get_tsf_docs_resp.json()['required_documents']
                new_expected_documents = []

                for tsf_req_doc in tsf_required_documents:
                    new_expected_documents.append({
                        'req_document_guid':
                        tsf_req_doc['req_document_guid'],
                        'document_name':
                        tsf_req_doc['req_document_name'],
                        'document_description':
                        tsf_req_doc['description'],
                        'document_due_date_type':
                        tsf_req_doc['req_document_due_date_type'],
                        'document_due_date_period_months':
                        tsf_req_doc['req_document_due_date_period_months'],
                        'hsrc_code':
                        tsf_req_doc['hsrc_code']
                    })

                doc_assignment_response = requests.post(
                    get_documents_svc_url('/expected/mines/' + str(mine_guid)),
                    headers={'Authorization': request.headers.get('Authorization')},
                    json={'documents': new_expected_documents})
                if doc_assignment_response.status_code != 200:
                    raise Exception(
                        f"Error creating tsf expected documents >> {doc_assignment_response}")
            except Exception as e:
                db.session.rollback()
                current_app.logger.error(str(e))
                raise InternalServerError(str(e) + ", tsf not created")
        mine.save()
        return mine_tsf
