import decimal
import uuid
from datetime import datetime
import json

from flask import request, make_response
from flask_restplus import Resource, reqparse, inputs
from sqlalchemy_filters import apply_sort, apply_pagination

from ...status.models.mine_status import MineStatus
from ...status.models.mine_status_xref import MineStatusXref

from ..models.mine_type import MineType
from ..models.mine_type_detail import MineTypeDetail

from ..models.mine import Mine
from ..models.mineral_tenure_xref import MineralTenureXref
from ....permits.permit.models.permit import Permit
from ...location.models.mine_location import MineLocation
from ...location.models.mine_map_view_location import MineMapViewLocation
from ....utils.random import generate_mine_no
from app.extensions import api, cache
from ....utils.access_decorators import requires_role_mine_view, requires_role_mine_create, requires_any_of, MINE_VIEW, MINESPACE_PROPONENT
from ....utils.resources_mixins import UserMixin, ErrorMixin
from ....constants import MINE_MAP_CACHE


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
    @requires_any_of([MINE_VIEW, MINESPACE_PROPONENT])
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

                # Below caches the mine map response object in redis with a timeout.
                # Generating and jsonifying the map data takes 4-7 seconds with 50,000 points,
                # so caching seems justified.
                #
                # TODO: Use some custom representation of this data vs JSON. The
                # json string is massive (with 50,000 points: 16mb uncompressed, 2.5mb compressed).
                # A quick test using delimented data brings this down to ~1mb compressed.
                map_result = cache.get(MINE_MAP_CACHE)
                last_modified = cache.get(MINE_MAP_CACHE + '_LAST_MODIFIED')
                if not map_result:
                    records = MineMapViewLocation.query.all()
                    last_modified = datetime.now()

                    # jsonify then store in cache
                    map_result = json.dumps(
                        {
                            'mines': list((map(lambda x: x.json_for_map(), records)))
                        },
                        separators=(',', ':'))
                    cache.set(MINE_MAP_CACHE, map_result, timeout=43140)
                    cache.set(MINE_MAP_CACHE + '_LAST_MODIFIED', last_modified, timeout=43140)

                # It's more efficient to store the json to avoid re-initializing all of the objects
                # and jsonifying on every request, so a flask response is returned to prevent
                # flask_restplus from jsonifying the data again, which would mangle the json.
                response = make_response(map_result)
                response.headers['content-type'] = 'application/json'

                # While we're at it, let's set a last modified date and have flask return not modified
                # if it hasn't so the client doesn't download it again unless needed.
                response.last_modified = last_modified
                response.make_conditional(request)

                return response

            paginated_mine_query, pagination_details = self.apply_filter_and_search(request.args)
            mines = paginated_mine_query.all()
            return {
                'mines': list(map(lambda x: x.json_for_list(), mines)),
                'current_page': pagination_details.page_number,
                'total_pages': pagination_details.num_pages,
                'items_per_page': pagination_details.page_size,
                'total': pagination_details.total_results,
            }

    def apply_filter_and_search(self, args):
        # Handle ListView request
        items_per_page = args.get('per_page', 25, type=int)
        page = args.get('page', 1, type=int)
        search_term = args.get('search', None, type=str)
        # Filters to be applied
        commodity_filter_terms = args.get('commodity', None, type=str)
        status_filter_term = args.get('status', None, type=str)
        tenure_filter_term = args.get('tenure', None, type=str)
        region_code_filter_term = args.get('region', None, type=str)
        major_mine_filter_term = args.get('major', None, type=str)
        tsf_filter_term = args.get('tsf', None, type=str)
        # Base query:
        mines_query = Mine.query
        # Filter by search_term if provided
        if search_term:
            search_term = search_term.strip()
            name_filter = Mine.mine_name.ilike('%{}%'.format(search_term))
            number_filter = Mine.mine_no.ilike('%{}%'.format(search_term))
            permit_filter = Permit.permit_no.ilike('%{}%'.format(search_term))
            mines_name_query = Mine.query.filter(name_filter | number_filter)
            permit_query = Mine.query.join(Permit).filter(permit_filter)
            mines_query = mines_name_query.union(permit_query)
        # Filter by Major Mine, if provided
        if major_mine_filter_term == "true" or major_mine_filter_term == "false":
            major_mine_filter = Mine.major_mine_ind.is_(major_mine_filter_term == "true")
            major_mine_query = Mine.query.filter(major_mine_filter)
            mines_query = mines_query.intersect(major_mine_query)
        # Filter by TSF, if provided
        if tsf_filter_term == "true" or tsf_filter_term == "false":
            tsf_filter = Mine.mine_tailings_storage_facilities != None if tsf_filter_term == "true" else \
                Mine.mine_tailings_storage_facilities == None
            tsf_query = Mine.query.filter(tsf_filter)
            mines_query = mines_query.intersect(tsf_query)
        # Filter by region, if provided
        if region_code_filter_term:
            region_filter_term_array = region_code_filter_term.split(',')
            region_filter = Mine.mine_region.in_(region_filter_term_array)
            region_query = Mine.query.filter(region_filter)
            mines_query = mines_query.intersect(region_query)
        # Filter by commodity if provided
        if commodity_filter_terms:
            commodity_filter_term_array = commodity_filter_terms.split(',')
            commodity_filter = MineTypeDetail.mine_commodity_code.in_(commodity_filter_term_array)
            mine_type_active_filter = MineType.active_ind.is_(True)
            commodity_query = Mine.query \
                .join(MineType) \
                .join(MineTypeDetail) \
                .filter(commodity_filter, mine_type_active_filter)
            mines_query = mines_query.intersect(commodity_query)
        # Create a filter on tenure if one is provided
        if tenure_filter_term:
            tenure_filter_term_array = tenure_filter_term.split(',')
            tenure_filter = MineType.mine_tenure_type_code.in_(tenure_filter_term_array)
            mine_type_active_filter = MineType.active_ind.is_(True)
            tenure_query = Mine.query \
                .join(MineType) \
                .filter(tenure_filter, mine_type_active_filter)
            mines_query = mines_query.intersect(tenure_query)
        # Create a filter on mine status if one is provided
        if status_filter_term:
            status_filter_term_array = status_filter_term.split(',')
            status_filter = MineStatusXref.mine_operation_status_code.in_(status_filter_term_array)
            status_reason_filter = MineStatusXref.mine_operation_status_reason_code.in_(
                status_filter_term_array)
            status_subreason_filter = MineStatusXref.mine_operation_status_sub_reason_code.in_(
                status_filter_term_array)
            all_status_filter = status_filter | status_reason_filter | status_subreason_filter
            status_query = Mine.query \
                .join(MineStatus) \
                .join(MineStatusXref) \
                .filter(all_status_filter)
            mines_query = mines_query.intersect(status_query)

        sort_criteria = [{'model': 'Mine', 'field': 'mine_name', 'direction': 'asc'}]
        mines_query = apply_sort(mines_query, sort_criteria)
        return apply_pagination(mines_query, page, items_per_page)

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
            cache.delete(MINE_MAP_CACHE)
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
            cache.delete(MINE_MAP_CACHE)

        # Status validation
        self.mine_status_processor(status, mine.mine_guid) if status else None

        return mine.json()


class MineListByName(Resource):
    MINE_LIST_RESULT_LIMIT = 500

    @api.doc(params={'?search': 'Search term in mine name, mine number, and permit.'})
    @requires_any_of([MINE_VIEW, MINESPACE_PROPONENT])
    def get(self):
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
