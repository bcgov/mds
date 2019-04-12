import uuid
import requests
import json

from flask import request, current_app, url_for
from flask_restplus import Resource, reqparse
from app.extensions import api, db
from werkzeug.exceptions import BadRequest, InternalServerError, NotFound

from app.api.utils.access_decorators import requires_role_mine_view, requires_role_mine_create
from app.api.utils.resources_mixins import UserMixin, ErrorMixin
from app.api.utils.url import get_documents_svc_url

from ..models.tailings import MineTailingsStorageFacility
from ....documents.namespace.documents import api as doc_api


class MineTailingsStorageFacilityResource(Resource, UserMixin, ErrorMixin):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('mine_guid', type=str, help='mine to create a new tsf on')
    parser.add_argument(
        'tsf_name', type=str, help='Name of the tailings storage facility.', store_missing=False)

    @api.doc(
        params={
            'mine_tailings_storage_facility_guid':
            'mine_tailings_storage_facility_guid to be retrieved, or return error if not provided'
        })
    @requires_role_mine_view
    def get(self, mine_tailings_storage_facility_guid=None):
        if mine_tailings_storage_facility_guid:
            tsf = MineTailingsStorageFacility.find_by_tsf_guid(mine_tailings_storage_facility_guid)
            if not tsf:
                return self.create_error_payload(404, 'mine_tailings_storage_facility not found')
            return tsf.json()
        else:
            mine_guid = request.args.get('mine_guid', type=str)
            mine_tsf_list = MineTailingsStorageFacility.find_by_mine_guid(mine_guid)
            if mine_tsf_list is None:
                return self.raise_error(404, 'Mine_guid or tsf_guid must be provided')
            return {
                'mine_storage_tailings_facilities': list(map(lambda x: x.json(), mine_tsf_list))
            }

    @api.doc(params={'mine_guid': 'mine_guid that is to get a new TSF'})
    @requires_role_mine_create
    def post(self, mine_tailings_storage_facility_guid=None):
        if mine_tailings_storage_facility_guid:
            raise BadRequest('unexpected tsf_guid')

        data = self.parser.parse_args()
        mine_guid = data.get('mine_guid')

        # see if this would be the first TSF
        mine_tsf_list = MineTailingsStorageFacility.find_by_mine_guid(mine_guid)
        is_mine_first_tsf = len(mine_tsf_list) == 0

        mine_tsf = MineTailingsStorageFacility.create(
            mine_guid=mine_guid, tailings_facility_name=data.get('tsf_name'))
        db.session.add(mine_tsf)

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
        db.session.commit()
        return {
            'mine_tailings_storage_facilities':
            [x.json() for x in MineTailingsStorageFacility.find_by_mine_guid(mine_guid)]
        }
