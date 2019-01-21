import decimal
import uuid
from datetime import datetime

from flask import request
from flask_restplus import Resource, reqparse, inputs
from sqlalchemy_filters import apply_sort, apply_pagination

from ..... import auth

from ...status.models.mine_status import MineStatus
from ...status.models.mine_status_xref import MineStatusXref
from ..models.mine import Mine
from ..models.mineral_tenure_xref import MineralTenureXref
from ....permits.permit.models.permit import Permit
from ...location.models.mine_location import MineLocation
from ...location.models.mine_map_view_location import MineMapViewLocation
from ....utils.random import generate_mine_no
from app.extensions import api
from ....utils.access_decorators import requires_role_mine_view, requires_role_mine_create
from ....utils.resources_mixins import UserMixin, ErrorMixin


class MineResource(Resource, UserMixin, ErrorMixin):
    parser = reqparse.RequestParser()
    parser.add_argument('name', type=str, help='Name of the mine.')
    parser.add_argument('note', type=str, help='Any additional notes to be added to the mine.')
    parser.add_argument('tenure_number_id', type=int, help='Tenure number for the mine.')
    parser.add_argument('longitude', type=decimal.Decimal, help='Longitude point for the mine.')
    parser.add_argument('latitude', type=decimal.Decimal, help='Latitude point for the mine.')
    parser.add_argument(
        'mine_status',
        action='split',
        help=
        'Status of the mine, to be given as a comma separated string value. Ex: status_code, status_reason_code, status_sub_reason_code '
    )
    parser.add_argument(
        'major_mine_ind',
        type=inputs.boolean,
        help='Indication if mine is major_mine_ind or regional. Accepts "true", "false", "1", "0".')
    parser.add_argument('mine_region', type=str, help='Region for the mine.')

    @api.doc(
        params={
            'mine_no_or_guid':
            'Mine number or guid. If not provided a paginated list of mines will be returned.'
        })
    @requires_role_mine_view
    def get(self, mine_no_or_guid=None):
        if mine_no_or_guid:
            mine = Mine.find_by_mine_no_or_guid(mine_no_or_guid)
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
            status_search_term = request.args.get('status', None, type=str)

            # Create a filter on mine status if one is provided
            if status_search_term:
                status_search_term_array = status_search_term.split(',')
                status_filter = MineStatusXref.mine_operation_status_code.in_(
                    status_search_term_array)
                status_reason_filter = MineStatusXref.mine_operation_status_reason_code.in_(
                    status_search_term_array)
                status_subreason_filter = MineStatusXref.mine_operation_status_sub_reason_code.in_(
                    status_search_term_array)
                all_status_filter = status_filter | status_reason_filter | status_subreason_filter

            if search_term:
                name_filter = Mine.mine_name.ilike('%{}%'.format(search_term))
                number_filter = Mine.mine_no.ilike('%{}%'.format(search_term))
                permit_filter = Permit.permit_no.ilike('%{}%'.format(search_term))
                mines_query = Mine.query.filter(name_filter | number_filter)
                permit_query = Mine.query.join(Permit).filter(permit_filter)
                mines_permit_join_query = mines_query.union(permit_query)
                if status_search_term:
                    status_query = Mine.query\
                        .join(MineStatus)\
                        .join(MineStatusXref)\
                        .filter(all_status_filter)
                    mines_permit_join_query = mines_permit_join_query.intersect(status_query)
                result_query, pagination_details = apply_pagination(mines_permit_join_query, page,
                                                                    items_per_page)

            else:
                sort_criteria = [{'model': 'Mine', 'field': 'mine_name', 'direction': 'asc'}]
                if status_search_term:
                    mine_query_with_status = Mine.query\
                        .join(MineStatus)\
                        .join(MineStatusXref)\
                        .filter(all_status_filter)
                    result_query = apply_sort(mine_query_with_status, sort_criteria)
                else:
                    result_query = apply_sort(Mine.query, sort_criteria)

            paginated_mine_query, pagination_details = apply_pagination(
                result_query, page, items_per_page)

            mines = paginated_mine_query.all()
            return {
                'mines': list(map(lambda x: x.json_for_list(), mines)),
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
            mine_status_xref = MineStatusXref.find_by_codes(
                self.mine_operation_code_processor(mine_status, 0),
                self.mine_operation_code_processor(mine_status, 1),
                self.mine_operation_code_processor(mine_status, 2))
            if not mine_status_xref:
                self.raise_error(
                    400,
                    'Error: Invalid status_code, reason_code, and sub_reason_code combination., '
                ), 400

            existing_status = MineStatus.find_by_mine_guid(mine_guid)
            if existing_status:
                if existing_status.mine_status_xref_guid == mine_status_xref.mine_status_xref_guid:
                    return existing_status

                existing_status.expiry_date = datetime.today()
                existing_status.active_ind = False
                existing_status.save()

            _mine_status = MineStatus(
                mine_status_guid=uuid.uuid4(),
                mine_guid=mine_guid,
                mine_status_xref_guid=mine_status_xref.mine_status_xref_guid,
                **self.get_create_update_dict())
        except AssertionError as e:
            self.raise_error(400, 'Error: {}'.format(e))
        _mine_status.save()
        return _mine_status

    @api.expect(parser)
    @requires_role_mine_create
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
        mine = Mine(mine_guid=uuid.uuid4(), **self.get_create_update_dict())
        try:
            mine = Mine(
                mine_guid=uuid.uuid4(),
                mine_no=generate_mine_no(),
                mine_name=data['name'],
                mine_note=note if note else '',
                major_mine_ind=major_mine_ind,
                mine_region=mine_region,
                **self.get_create_update_dict())
        except AssertionError as e:
            self.raise_error(400, 'Error: {}'.format(e))
        mine.save()

        if lat and lon:
            location = MineLocation(
                mine_location_guid=uuid.uuid4(),
                mine_guid=mine.mine_guid,
                latitude=lat,
                longitude=lon,
                **self.get_create_update_dict())
            location.save()
        mine_status = self.mine_status_processor(status, mine.mine_guid) if status else None
        return {
            'mine_guid': str(mine.mine_guid),
            'mine_no': mine.mine_no,
            'mine_name': mine.mine_name,
            'mine_note': mine.mine_note,
            'major_mine_ind': mine.major_mine_ind,
            'latitude': str(location.latitude) if location else None,
            'longitude': str(location.longitude) if location else None,
            'mine_status': mine_status.json() if mine_status else None,
            'mine_region': mine.mine_region if mine_region else None,
        }

    @api.expect(parser)
    @requires_role_mine_create
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

        if (not tenure and not (lat and lon) and not mine_name and not mine_note and not status
                and not region and major_mine_ind is None):
            self.raise_error(400, 'Error: No fields filled.')
        mine = Mine.find_by_mine_no_or_guid(mine_no_or_guid)
        if not mine:
            return self.create_error_payload(404, 'Mine not found'), 404

        # Mine Detail
        if mine_name or mine_note or major_mine_ind is not None:
            try:
                mine.update_user = self.get_update_user()
                if mine_name:
                    mine.mine_name = mine_name
                if mine_note:
                    mine.mine_note = mine_note
                if major_mine_ind is not None:
                    mine.major_mine_ind = major_mine_ind
                if region:
                    mine.mine_region = region
            except AssertionError as e:
                self.raise_error(400, 'Error: {}'.format(e))
            mine.save()

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
                    **self.get_create_update_dict())
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
                **self.get_create_update_dict())
            location.save()

        # Status validation
        self.mine_status_processor(status, mine.mine_guid) if status else None

        return mine.json()


class MineListByName(Resource):
    MINE_LIST_RESULT_LIMIT = 500

    @api.doc(params={'?search': 'Search term in mine name, mine number, and permit.'})
    #@requires_role_mine_view
    def get(self):
        #return str(auth.get_access())

        tenant = auth.get_current_tenant()
        return tenant.mine_ids

        search_term = request.args.get('search')
        if search_term:
            name_filter = Mine.mine_name.ilike('%{}%'.format(search_term))
            number_filter = Mine.mine_no.ilike('%{}%'.format(search_term))
            permit_filter = Permit.permit_no.ilike('%{}%'.format(search_term))
            mines_q = Mine.query.filter(name_filter | number_filter)
            permit_q = Mine.query.join(Permit).filter(permit_filter)
            mines = mines_q.union(permit_q).limit(self.MINE_LIST_RESULT_LIMIT).all()
        else:
            mines = Mine.query.limit(self.MINE_LIST_RESULT_LIMIT).all()

        result = list(map(lambda x: {**x.json_by_name(), **x.json_by_location()}, mines))
        return {'mines': result}
