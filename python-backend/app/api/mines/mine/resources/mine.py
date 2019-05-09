from decimal import Decimal
import uuid
from datetime import datetime

from flask import request, current_app
from flask_restplus import Resource, reqparse, inputs
from sqlalchemy_filters import apply_sort, apply_pagination, apply_filters
from sqlalchemy.orm import Session
from werkzeug.exceptions import BadRequest, NotFound

from ...status.models.mine_status import MineStatus
from ...status.models.mine_status_xref import MineStatusXref

from ..models.mine_type import MineType
from ..models.mine_type_detail import MineTypeDetail

from ..models.mine import Mine
from ..models.mineral_tenure_xref import MineralTenureXref
from ...location.models.mine_location import MineLocation
from ....utils.random import generate_mine_no
from app.extensions import api, cache, db
from ....utils.access_decorators import requires_role_mine_create, requires_any_of, MINE_VIEW, MINESPACE_PROPONENT
from ....utils.resources_mixins import UserMixin, ErrorMixin
from ....constants import MINE_MAP_CACHE
from app.api.mines.mine_api_models import MINE_LIST_MODEL, MINE_MODEL
# FIXME: Model import from outside of its namespace
# This breaks micro-service architecture and is done
# for search performance until search can be refactored
from ....permits.permit.models.permit import Permit


class MineListResource(Resource, UserMixin):
    parser = reqparse.RequestParser()
    parser.add_argument(
        'mine_name', type=str, help='Name of the mine.', trim=True, required=True, location='json')
    parser.add_argument(
        'mine_note',
        type=str,
        help='Any additional notes to be added to the mine.',
        trim=True,
        location='json')
    parser.add_argument(
        'longitude',
        type=lambda x: Decimal(x) if x else None,
        help='Longitude point for the mine.',
        location='json')
    parser.add_argument(
        'latitude',
        type=lambda x: Decimal(x) if x else None,
        help='Latitude point for the mine.',
        location='json')
    parser.add_argument(
        'mine_status',
        action='split',
        help=
        'Status of the mine, to be given as a comma separated string value. Ex: status_code, status_reason_code, status_sub_reason_code ',
        required=True,
        location='json')
    parser.add_argument(
        'major_mine_ind',
        type=inputs.boolean,
        help='Indication if mine is major_mine_ind or regional. Accepts "true", "false", "1", "0".',
        location='json')
    parser.add_argument(
        'mine_region',
        type=str,
        help='Region for the mine.',
        trim=True,
        required=True,
        location='json')

    @api.doc(
        params={
            'per_page':
            'The number of results to be returned per page.',
            'page':
            'The current page number to be displayed.',
            'search':
            'The search term.',
            'commodity':
            'A specific commodity to filter the mine list on.',
            'status':
            'A specific mine status to filter the mine list on.',
            'tenure':
            'A specific mine tenure type to filter the mine list on.',
            'region':
            'A specific mine region to filter the mine list on.',
            'major':
            'Filters the mine list by major mines or regional mines.',
            'tsf':
            'Filters the mine list by mines with or without a TSF.',
            'sort_field':
            'enum[mine_name, mine_no, mine_operation_status_code, mine_region] Default: mine_name',
            'sort_dir':
            'enum[asc, desc] Default: asc'
        },
        description='Returns a list of filtered mines.')
    @api.marshal_with(MINE_LIST_MODEL, code=200)
    @requires_any_of([MINE_VIEW, MINESPACE_PROPONENT])
    def get(self):

        paginated_mine_query, pagination_details = self.apply_filter_and_search(request.args)
        mines = paginated_mine_query.all()
        print(pagination_details)
        print(len(mines))
        return {
            'mines': mines,
            'current_page': pagination_details.page_number,
            'total_pages': pagination_details.num_pages,
            'items_per_page': pagination_details.page_size,
            'total': pagination_details.total_results,
        }

    @api.expect(parser)
    @api.doc(description='Creates a new mine.')
    @api.marshal_with(MINE_MODEL, code=201)
    @requires_role_mine_create
    def post(self):
        data = self.parser.parse_args()

        lat = data.get('latitude')
        lon = data.get('longitude')
        if (lat and not lon) or (not lat and lon):
            raise BadRequest('latitude and longitude must both be empty, or both provided')

        # query the mine tables and check if that mine name exists
        _throw_error_if_mine_exists(data.get('mine_name'))
        mine = Mine(
            mine_no=generate_mine_no(),
            mine_name=data.get('mine_name'),
            mine_note=data.get('mine_note'),
            major_mine_ind=data.get('major_mine_ind'),
            mine_region=data.get('mine_region'))

        db.session.add(mine)

        if lat and lon:
            mine.mine_location = MineLocation(latitude=lat, longitude=lon)
            cache.delete(MINE_MAP_CACHE)

        mine_status = _mine_status_processor(data.get('mine_status'), mine)
        db.session.commit()

        return mine

    def apply_filter_and_search(self, args):
        sort_models = {
            'mine_name': 'Mine',
            'mine_no': 'Mine',
            'mine_region': 'Mine'
        }
        # Handle ListView request
        items_per_page = args.get('per_page', 25, type=int)
        page = args.get('page', 1, type=int)
        sort_field = args.get('sort_field', 'mine_name', type=str)
        sort_dir = args.get('sort_dir', 'asc', type=str)
        sort_model = sort_models.get(sort_field)
        search_term = args.get('search', None, type=str)
        # Filters to be applied
        commodity_filter_terms = args.get('commodity', None, type=str)
        status_filter_term = args.get('status', None, type=str)
        tenure_filter_term = args.get('tenure', None, type=str)
        region_code_filter_term = args.get('region', None, type=str)
        major_mine_filter_term = args.get('major', None, type=str)
        tsf_filter_term = args.get('tsf', None, type=str)
        # Base query:
        session = Session()
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
        deleted_filter = [{'field': 'deleted_ind', 'op': '==', 'value': 'False'}]
        mines_query = apply_filters(mines_query, deleted_filter)

        # Apply sorting
        if sort_model and sort_field and sort_dir:
            sort_criteria = [{'model': sort_model, 'field': sort_field, 'direction': sort_dir}]
            mines_query = apply_sort(mines_query, sort_criteria)

        return apply_pagination(mines_query, page, items_per_page)


class MineResource(Resource, UserMixin, ErrorMixin):
    parser = reqparse.RequestParser()
    parser.add_argument(
        'mine_name',
        type=str,
        help='Name of the mine.',
        trim=True,
        store_missing=False,
        location='json')
    parser.add_argument(
        'mine_note',
        type=str,
        help='Any additional notes to be added to the mine.',
        trim=True,
        store_missing=False,
        location='json')
    parser.add_argument(
        'tenure_number_id',
        type=int,
        help='Tenure number for the mine.',
        trim=True,
        store_missing=False,
        location='json')
    parser.add_argument(
        'longitude',
        type=lambda x: Decimal(x) if x else None,
        help='Longitude point for the mine.',
        store_missing=False,
        location='json')
    parser.add_argument(
        'latitude',
        type=lambda x: Decimal(x) if x else None,
        help='Latitude point for the mine.',
        store_missing=False,
        location='json')
    parser.add_argument(
        'mine_status',
        action='split',
        help=
        'Status of the mine, to be given as a comma separated string value. Ex: status_code, status_reason_code, status_sub_reason_code ',
        store_missing=False,
        location='json')
    parser.add_argument(
        'major_mine_ind',
        type=inputs.boolean,
        help='Indication if mine is major_mine_ind or regional. Accepts "true", "false", "1", "0".',
        store_missing=False,
        location='json')
    parser.add_argument(
        'mine_region',
        type=str,
        help='Region for the mine.',
        trim=True,
        store_missing=False,
        location='json')

    @api.doc(description='Returns the specific mine from the mine_guid or mine_no provided.')
    @api.marshal_with(MINE_MODEL, code=200)
    @requires_any_of([MINE_VIEW, MINESPACE_PROPONENT])
    def get(self, mine_no_or_guid):

        mine = Mine.find_by_mine_no_or_guid(mine_no_or_guid)
        if not mine:
            raise NotFound('Mine not found.')

        return mine

    @api.expect(parser)
    @api.marshal_with(MINE_MODEL, code=200)
    @api.doc(description='Updates the specified mine.')
    @requires_role_mine_create
    def put(self, mine_no_or_guid):

        mine = Mine.find_by_mine_no_or_guid(mine_no_or_guid)
        if not mine:
            raise NotFound("Mine not found.")

        data = self.parser.parse_args()

        tenure = data.get('tenure_number_id')

        lat = data.get('latitude')
        lon = data.get('longitude')
        if (lat and not lon) or (not lat and lon):
            raise BadRequest('latitude and longitude must both be empty, or both provided')

        # Mine Detail
        if 'mine_name' in data and mine.mine_name != data['mine_name']:
            _throw_error_if_mine_exists(data['mine_name'])
            mine.mine_name = data['mine_name']
        if 'mine_note' in data:
            mine.mine_note = data['mine_note']
        if 'major_mine_ind' in data:
            mine.major_mine_ind = data['major_mine_ind']
        if 'mine_region' in data:
            mine.mine_region = data['mine_region']
        mine.save()

        # Tenure validation
        if tenure:
            tenure_exists = MineralTenureXref.find_by_tenure(tenure)
            if tenure_exists:
                if tenure_exists.mine_guid == mine.mine_guid:
                    raise BadRequest('Error: Field tenure_id already exists for this mine.')
            tenure = MineralTenureXref(
                mineral_tenure_xref_guid=uuid.uuid4(),
                mine_guid=mine.mine_guid,
                tenure_number_id=tenure)

            tenure.save()

        if mine.mine_location:
            #update existing record
            if "latitude" in data:
                mine.mine_location.latitude = data['latitude']
            if "longitude" in data:
                mine.mine_location.longitude = data['longitude']
            mine.mine_location.save()

        elif data.get('latitude') and data.get('longitude') and not mine.mine_location:
            mine.mine_location = MineLocation(
                latitude=data['latitude'], longitude=data['longitude'])
            mine.save()
            cache.delete(MINE_MAP_CACHE)

        # Status validation
        _mine_status_processor(data.get('mine_status'), mine)
        return mine


class MineListSearch(Resource):
    @api.doc(
        params={
            'name': 'Search term in mine name.',
            'term': 'Search term in mine name, mine number, and permit.'
        })
    @requires_any_of([MINE_VIEW, MINESPACE_PROPONENT])
    def get(self):
        name_search = request.args.get('name')
        search_term = request.args.get('term')
        if search_term:
            mines = Mine.find_by_name_no_permit(search_term)
        else:
            mines = Mine.find_by_mine_name(name_search)
        result = list(
            map(
                lambda x: {
                    'mine_guid': str(x.mine_guid),
                    'mine_name': x.mine_name,
                    'mine_no': x.mine_no,
                    'latitude': str(x.mine_location.latitude) if x.mine_location else '',
                    'longitude': str(x.mine_location.longitude) if x.mine_location else '', },
                mines))
        return {'mines': result}


# Functions shared by the MineListResource and the MineResource
def _mine_operation_code_processor(mine_status, index):
    try:
        return mine_status[index].strip()
    except IndexError:
        return None


def _mine_status_processor(mine_status, mine):
    if not mine_status:
        return mine.mine_status

    current_app.logger.info(f'updating mine no={mine.mine_no} to new_status={mine_status}')

    mine_status_xref = MineStatusXref.find_by_codes(
        _mine_operation_code_processor(mine_status, 0),
        _mine_operation_code_processor(mine_status, 1),
        _mine_operation_code_processor(mine_status, 2))
    if not mine_status_xref:
        raise BadRequest('Invalid status_code, reason_code, and sub_reason_code combination.')

    existing_status = mine.mine_status[0] if mine.mine_status else None
    if existing_status:
        if existing_status.mine_status_xref_guid == mine_status_xref.mine_status_xref_guid:
            return existing_status

        existing_status.expiry_date = datetime.today()
        existing_status.active_ind = False
        existing_status.save()

    new_status = MineStatus(mine_status_xref_guid=mine_status_xref.mine_status_xref_guid)
    mine.mine_status.append(new_status)
    new_status.save()

    mine.save(commit=False)
    return new_status


def _throw_error_if_mine_exists(mine_name):
    # query the mine tables and check if that mine name exists
    if mine_name:
        name_filter = Mine.mine_name.ilike(mine_name.strip())
        mines_name_query = Mine.query.filter(name_filter)
        mines_with_name = mines_name_query.all()
        if len(mines_with_name) > 0:
            raise BadRequest(f'Mine No: {mines_with_name[0].mine_no} already has that name.')