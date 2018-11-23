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
            if mine_guid: 
                mine_tsf_list = MineTailingsStorageFacility.find_by_mine_guid(mine_guid)
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

                    get_resp = requests.get(documents_url + '/required?category=MINE_TAILINGS', 
                        headers=request.headers
                    )
                    
                    tsf_required_documents = get_resp.json()['required_documents']
                    new_expected_documents = []
                    for tsf_req_doc in tsf_required_documents:
                        new_expected_documents.append({
                            'req_document_guid':tsf_req_doc['req_document_guid'],
                            'document_name':tsf_req_doc['req_document_name'],
                            'document_description':tsf_req_doc['req_document_description'],
                            'document_category':tsf_req_doc['req_document_category']
                        })

                    doc_assignment_response = requests.post(documents_url + '/mines/expected/' + str(mine_guid), 
                            headers=request.headers, 
                            json={'documents': new_expected_documents}
                    )
                except Exception as e:
                    return self.create_error_payload(500, 'Error: {}'.format(e))
            return {'mine_tailings_storage_facilities': list(map(lambda x: x.json(), MineTailingsStorageFacility.find_by_mine_guid(mine_guid)))}
        else:
            return self.create_error_payload(404, 'unexpected tsf_guid')

