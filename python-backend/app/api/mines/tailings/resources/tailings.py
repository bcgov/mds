import uuid
 
from flask import request
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
            mine_tsf = MineTailingsStorageFacility(
                mine_guid=data['mine_guid'],
                mine_tailings_storage_facility_name=data['tsf_name'],
                **self.get_create_update_dict()
            )
            mine_tsf.save()
            return mine_tsf.json()
        else:
            return self.create_error_payload(404, 'unexpected tsf_guid')
