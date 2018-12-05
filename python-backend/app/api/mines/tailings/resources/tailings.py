import uuid, requests,json

from flask import request, current_app, url_for
from flask_restplus import Resource, reqparse
from ..models.tailings import MineTailingsStorageFacility

from app.extensions import jwt, api
from ....utils.resources_mixins import UserMixin, ErrorMixin


class MineTailingsStorageFacilityResource(Resource, UserMixin, ErrorMixin):
    parser = reqparse.RequestParser()
    parser.add_argument('mine_guid', type=str, help='mine to create a new tsf on')
    parser.add_argument('tsf_name', type=str, help='Name of the tailings storage facility.')


    @api.doc(params={'mine_tailings_storage_facility_guid': 'mine_tailings_storage_facility_guid to be retrieved, or return error if not provided'})
    @jwt.requires_roles(["mds-mine-view"])
    def get(self, mine_tailings_storage_facility_guid=None):
        if mine_tailings_storage_facility_guid:
            tsf = MineTailingsStorageFacility.find_by_tsf_guid(mine_tailings_storage_facility_guid)
            return tsf.json()
        else:
            mine_guid = request.args.get('mine_guid', type=str)
            mine_tsf_list = MineTailingsStorageFacility.find_by_mine_guid(mine_guid)
            if mine_tsf_list: 
                return { 'mine_storage_tailings_facilities' : list(map(lambda x: x.json(), mine_tsf_list))  }
            else: 
                return self.create_error_payload(404, 'Mine_guid or tsf_guid must be provided')


    @api.doc(params={'mine_guid': 'mine_guid that is to get a new TSF'})
    @jwt.requires_roles(["mds-mine-view"])
    def post(self, mine_tailings_storage_facility_guid=None):
        if not mine_tailings_storage_facility_guid:
            data = self.parser.parse_args()
            mine_guid = data['mine_guid']
            #see if this would be the first TSF 
            mine_tsf_list = MineTailingsStorageFacility.find_by_mine_guid(mine_guid)
            is_mine_first_tsf = len(mine_tsf_list) == 0
            mine_tsf = MineTailingsStorageFacility(
               mine_guid=mine_guid,
                mine_tailings_storage_facility_name=data['tsf_name'],
                **self.get_create_update_dict()
            )
            mine_tsf.save()

            if is_mine_first_tsf:  
                try:
                    documents_url = current_app.config['DOCUMENT_MS_URL'] + current_app.config['BASE_PATH'] + '/documents'

                    get_tsf_docs_resp = requests.get(documents_url + '/required?category=MINE_TAILINGS', 
                        headers=request.headers
                    )
                    if get_tsf_docs_resp.status_code != 200:
                        return self.create_error_payload(500, 'get_tsf_req_docs returned error' + str(get_tsf_docs_resp.status_code)), 500

                    tsf_required_documents = get_tsf_docs_resp.json()['required_documents']
                    new_expected_documents = []
                    for tsf_req_doc in tsf_required_documents:
                        new_expected_documents.append({
                            'req_document_guid':tsf_req_doc['req_document_guid'],
                            'document_name':tsf_req_doc['req_document_name'],
                            'document_description':tsf_req_doc['req_document_description'],
                            'document_category':tsf_req_doc['req_document_category'],
                            'document_due_date_type':tsf_req_doc['req_document_due_date_type'],
                            'document_due_date_period_months':tsf_req_doc['req_document_due_date_period_months']
                        })

                    doc_assignment_response = requests.post(documents_url + '/expected/mines/' + str(mine_guid), 
                            headers=request.headers, 
                            json={'documents': new_expected_documents}
                    )
                    if doc_assignment_response.status_code != 200:
                        return self.create_error_payload(500, 'exp_doc_assignment_post returned error' + str(doc_assignment_response.status_code)), 500

                except Exception as e:
                    return self.create_error_payload(500, 'Error: {}'.format(e)), 500
            return {'mine_tailings_storage_facilities': list(map(lambda x: x.json(), MineTailingsStorageFacility.find_by_mine_guid(mine_guid)))}
        else:
            return self.create_error_payload(404, 'unexpected tsf_guid')
