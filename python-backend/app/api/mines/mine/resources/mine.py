import decimal
import uuid

from flask import request
from flask_restplus import Resource, reqparse, inputs
from sqlalchemy_filters import apply_sort, apply_pagination

from ...status.models.status import MineStatus, MineStatusXref
from ..models.mine import MineIdentity, MineDetail, MineralTenureXref
from ....permits.permit.models.permit import Permit
from ...location.models.location import MineLocation, MineMapViewLocation 

from ....utils.random import generate_mine_no
from app.extensions import jwt, api
from ....utils.resources_mixins import UserMixin, ErrorMixin

class MineResource(Resource, UserMixin, ErrorMixin):
    parser = reqparse.RequestParser()
    parser.add_argument('name', type=str, help='Name of the mine.')
    parser.add_argument('note', type=str, help='Any additional notes to be added to the mine.')
    parser.add_argument('tenure_number_id', type=int, help='Tenure number for the mine.')
    parser.add_argument('longitude', type=decimal.Decimal, help='Longitude point for the mine.')
    parser.add_argument('latitude', type=decimal.Decimal, help='Latitude point for the mine.')
    parser.add_argument('mine_status', action='split', help='Status of the mine, to be given as a comma separated string value. Ex: status_code, status_reason_code, status_sub_reason_code ')
    parser.add_argument('major_mine_ind', type=inputs.boolean, help='Indication if mine is major_mine_ind or regional. Accepts "true", "false", "1", "0".')
    parser.add_argument('mine_region', type=str, help='Region for the mine.')

    @api.doc(params={'mine_no_or_guid': 'Mine number or guid. If not provided a paginated list of mines will be returned.'})
    @jwt.requires_roles(["mds-mine-view"])
    def get(self, mine_no_or_guid=None):
        if mine_no_or_guid:
            mine = MineIdentity.find_by_mine_no_or_guid(mine_no_or_guid)
            if mine:
                return mine.json()
            return self.create_error_payload(404, 'Mine not found'), 404
        else:
            # Handle MapView request
            _map = request.args.get('map', None, type=str)
            if _map and _map.lower() == 'true':
                records = MineMapViewLocation.query.all()
                result = list((map(lambda x: x.json_for_map(), records)))
                return {'mines': result}

            # Handle ListView request
            items_per_page = request.args.get('per_page', 25, type=int)
            page = request.args.get('page', 1, type=int)
            search_term = request.args.get('search', None, type=str)
            if search_term:
                name_filter = MineDetail.mine_name.ilike('%{}%'.format(search_term))
                number_filter = MineDetail.mine_no.ilike('%{}%'.format(search_term))
                permit_filter = Permit.permit_no.ilike('%{}%'.format(search_term))
                mines_query = MineIdentity.query.join(MineDetail).filter(name_filter | number_filter)
                permit_query = MineIdentity.query.join(Permit).filter(permit_filter)
                mines_permit_join_query = mines_query.union(permit_query)
                paginated_mine_query, pagination_details = apply_pagination(mines_permit_join_query, page, items_per_page)
            else:
                sort_criteria = [{'model': 'MineDetail', 'field': 'mine_name', 'direction': 'asc'}]
                sorted_mine_query = apply_sort(MineIdentity.query.join(MineDetail), sort_criteria)
                paginated_mine_query, pagination_details = apply_pagination(sorted_mine_query ,page, items_per_page)
                
            
            mines = paginated_mine_query.all()
            return {
                'mines': list(map(lambda x: x.json(), mines)),
                'current_page': pagination_details.page_number,
                'total_pages': pagination_details.num_pages,
                'items_per_page': pagination_details.page_size,
                'total': pagination_details.total_results,
            }

    def mine_operation_code_processor(self, mine_status, index):
        try:
            return mine_status[index].strip()
        except IndexError:
            return None

    def mine_status_processor(self, mine_status, mine_guid):
        try:
            mine_status_xref = MineStatusXref(
                mine_status_xref_guid=uuid.uuid4(),
                mine_operation_status_code=self.mine_operation_code_processor(mine_status, 0),
                mine_operation_status_reason_code=self.mine_operation_code_processor(mine_status, 1),
                mine_operation_status_sub_reason_code=self.mine_operation_code_processor(mine_status, 2),
                **self.get_create_update_dict()
            )
        except AssertionError as e:
            self.raise_error(400, 'Error: {}'.format(e))
        mine_status_xref.save()
        try:
            _mine_status = MineStatus(
                mine_status_guid=uuid.uuid4(),
                mine_guid=mine_guid,
                mine_status_xref_guid=mine_status_xref.mine_status_xref_guid,
                **self.get_create_update_dict()
            )
        except AssertionError as e:
            self.raise_error(400, 'Error: {}'.format(e))
        _mine_status.save()
        return _mine_status

    @api.expect(parser)
    @jwt.requires_roles(["mds-mine-create"])
    def post(self, mine_no_or_guid=None):
        if mine_no_or_guid:
            self.raise_error(400, 'Error: Unexpected mine number in Url.'), 400

        data = self.parser.parse_args()
        lat = data['latitude']
        lon = data['longitude']
        note = data['note']
        location = None
        mine_region = None
        status = data['mine_status']
        major_mine_ind = data['major_mine_ind']
        mine_region = data['mine_region']
        mine_identity = MineIdentity(mine_guid=uuid.uuid4(), **self.get_create_update_dict())
        try:
            mine_detail = MineDetail(
                mine_detail_guid=uuid.uuid4(),
                mine_guid=mine_identity.mine_guid,
                mine_no=generate_mine_no(),
                mine_name=data['name'],
                mine_note=note if note else '',
                major_mine_ind=major_mine_ind,
                mine_region=mine_region,
                **self.get_create_update_dict()
            )
        except AssertionError as e:
            self.raise_error(400, 'Error: {}'.format(e))
        mine_identity.save()
        mine_detail.save()
        if lat and lon:
            location = MineLocation(
                mine_location_guid=uuid.uuid4(),
                mine_guid=mine_identity.mine_guid,
                latitude=lat,
                longitude=lon,
                **self.get_create_update_dict()
            )
            location.save()
        mine_status = self.mine_status_processor(status, mine_identity.mine_guid) if status else None
        return {
            'mine_guid': str(mine_detail.mine_guid),
            'mine_no': mine_detail.mine_no,
            'mine_name': mine_detail.mine_name,
            'mine_note': mine_detail.mine_note,
            'major_mine_ind': mine_detail.major_mine_ind,
            'latitude': str(location.latitude) if location else None,
            'longitude': str(location.longitude) if location else None,
            'mine_status': mine_status.json() if mine_status else None,
            'mine_region': mine_detail.mine_region if region else None
        }

    @api.expect(parser)
    @jwt.requires_roles(["mds-mine-create"])
    def put(self, mine_no_or_guid):
        data = self.parser.parse_args()
        tenure = data['tenure_number_id']
        lat = data['latitude']
        lon = data['longitude']
        mine_name = data['name']
        mine_note = data['note']
        status = data['mine_status']
        major_mine_ind = data['major_mine_ind']
        region = data['mine_region']
        if not tenure and not (lat and lon) and not mine_name and not mine_note and not status and major_mine_ind is None:
            self.raise_error(400, 'Error: No fields filled.')
        mine = MineIdentity.find_by_mine_no_or_guid(mine_no_or_guid)
        if not mine:
            return self.create_error_payload(404, 'Mine not found'), 404
        # Mine Detail
        if mine_name or mine_note or major_mine_ind is not None:
            mine_detail = mine.mine_detail[0]
            try:
                new_mine_detail = MineDetail(
                    mine_detail_guid=uuid.uuid4(),
                    mine_guid=mine.mine_guid,
                    mine_no=mine_detail.mine_no,
                    mine_name=mine_detail.mine_name,
                    mine_note=mine_detail.mine_note,
                    major_mine_ind=mine_detail.major_mine_ind,
                    mine_region=mine_detail.mine_region,
                    **self.get_create_update_dict()
                )
                if mine_name:
                    new_mine_detail.mine_name = mine_name
                if mine_note:
                    new_mine_detail.mine_note = mine_note
                if major_mine_ind is not None:
                    new_mine_detail.major_mine_ind = major_mine_ind
                if region:
                    new_mine_detail.mine_region = region
            except AssertionError as e:
                self.raise_error(400, 'Error: {}'.format(e))
            new_mine_detail.save()
        # Tenure validation
        if tenure:
            tenure_exists = MineralTenureXref.find_by_tenure(tenure)
            if tenure_exists:
                tenure_exists_mine_guid = tenure_exists.mine_guid
                if tenure_exists_mine_guid == mine.mine_guid:
                    self.raise_error(400, 'Error: Field tenure_id already exists for this mine.')
            try:
                tenure = MineralTenureXref(
                    mineral_tenure_xref_guid=uuid.uuid4(),
                    mine_guid=mine.mine_guid,
                    tenure_number_id=tenure,
                    **self.get_create_update_dict()
                )
            except AssertionError as e:
                self.raise_error(400, 'Error: {}'.format(e))
            tenure.save()
        # Location validation
        if lat and lon:
            location = MineLocation(
                mine_location_guid=uuid.uuid4(),
                mine_guid=mine.mine_guid,
                latitude=lat,
                longitude=lon,
                **self.get_create_update_dict()
            )
            location.save()

        # Status validation
        self.mine_status_processor(status, mine.mine_guid) if status else None

        return mine.json()


class MineListByName(Resource):
    MINE_LIST_RESULT_LIMIT = 500

    @api.doc(params={'?search': 'Search term in mine name, mine number, and permit.'})
    @jwt.requires_roles(["mds-mine-view"])
    def get(self):
        search_term = request.args.get('search')
        if search_term:
            name_filter = MineDetail.mine_name.ilike('%{}%'.format(search_term))
            number_filter = MineDetail.mine_no.ilike('%{}%'.format(search_term))
            permit_filter = Permit.permit_no.ilike('%{}%'.format(search_term))
            mines_q = MineIdentity.query.join(MineDetail).filter(name_filter | number_filter)
            permit_q = MineIdentity.query.join(Permit).filter(permit_filter)
            mines = mines_q.union(permit_q).limit(self.MINE_LIST_RESULT_LIMIT).all()
        else:
            mines = MineIdentity.query.limit(self.MINE_LIST_RESULT_LIMIT).all()

        result = list(map(lambda x: {**x.json_by_name(), **x.json_by_location()}, mines))
        return {'mines': result}
