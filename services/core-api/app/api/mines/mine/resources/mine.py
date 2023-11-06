#library imports
import uuid
from decimal import Decimal
from datetime import datetime
from flask import request
from sqlalchemy.sql.sqltypes import Integer
from sqlalchemy import select, func, and_
from sqlalchemy.orm import aliased
from app.extensions import db, api
from flask_restplus import Resource, reqparse, inputs
from sqlalchemy_filters import apply_sort, apply_pagination, apply_filters
from werkzeug.exceptions import BadRequest, NotFound

#app imports
from app.extensions import api, cache
from app.api.utils.access_decorators import requires_role_mine_edit, requires_any_of, VIEW_ALL, MINESPACE_PROPONENT, is_minespace_user, MINE_EDIT
from app.api.utils.resources_mixins import UserMixin
from app.api.constants import MINE_MAP_CACHE

#namespace imports
from app.api.mines.response_models import MINE_LIST_MODEL, MINE_MODEL, MINE_SEARCH_MODEL
from app.api.mines.permits.permit.models.permit import Permit
from app.api.mines.permits.permit.models.mine_permit_xref import MinePermitXref

from app.api.mines.mine.models.mine import Mine
from app.api.mines.mine.models.mine_type import MineType
from app.api.mines.mine.models.mine_type_detail import MineTypeDetail
from app.api.mines.mine.models.mine_verified_status import MineVerifiedStatus

from app.api.mines.status.models.mine_status import MineStatus
from app.api.mines.status.models.mine_status_xref import MineStatusXref

from .mine_map import MineMapResource


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
        'status_date', help='The date when the current status took effect', location='json')
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
    parser.add_argument(
        'ohsc_ind', type=bool, store_missing=False, help='Indicates if the mine has an OHSC.')
    parser.add_argument(
        'union_ind', type=bool, store_missing=False, help='Indicates if the mine has a union.')
    parser.add_argument(
        'government_agency_type_code',
        type=str,
        help='Government agency the mine belongs to.',
        trim=True,
        store_missing=True,
        location='json')
    parser.add_argument(
        'exemption_fee_status_code',
        type=str,
        help='Exemption fee status code.',
        trim=True,
        store_missing=True,
        location='json')
    parser.add_argument(
        'exemption_fee_status_note',
        type=str,
        help='Exemption fee status note.',
        trim=True,
        store_missing=True,
        location='json')
    parser.add_argument(
        'work_status',
        action='split',
        help='Work status for the mine.',
        store_missing=False,
        location='json')

    @api.doc(
        params={
            'per_page': 'The number of results to be returned per page.',
            'page': 'The current page number to be displayed.',
            'search': 'The search term.',
            'commodity': 'A specific commodity to filter the mine list on.',
            'status': 'A specific mine status to filter the mine list on.',
            'work_status': 'A specific mine work status to filter the mine list on.',
            'tenure': 'A specific mine tenure type to filter the mine list on.',
            'region': 'A specific mine region to filter the mine list on.',
            'major': 'Filters the mine list by major mines or regional mines.',
            'tsf': 'Filters the mine list by mines with or without a TSF.',
            'verified': 'Filters the mine list by verified mines.',
            'sort_field':
            'enum[mine_name, mine_no, mine_operation_status_code, mine_region] Default: mine_name',
            'sort_dir': 'enum[asc, desc] Default: asc'
        },
        description='Returns a list of filtered mines.')
    @api.marshal_with(MINE_LIST_MODEL, code=200)
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    def get(self):

        paginated_mine_query, pagination_details = self.apply_filter_and_search(request.args)
        mines = paginated_mine_query.all()
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
    @requires_role_mine_edit
    def post(self):
        data = self.parser.parse_args()
        lat = data.get('latitude')
        lon = data.get('longitude')
        if (lat and not lon) or (not lat and lon):
            raise BadRequest('latitude and longitude must both be empty, or both provided')

        # query the mine tables and check if that mine name exists
        _throw_error_if_mine_exists(data.get('mine_name'))
        mine = Mine(
            mine_name=data.get('mine_name'),
            mine_note=data.get('mine_note'),
            major_mine_ind=data.get('major_mine_ind'),
            mine_region=data.get('mine_region'),
            ohsc_ind=data.get('ohsc_ind'),
            union_ind=data.get('union_ind'),
            latitude=lat,
            longitude=lon,
            government_agency_type_code=data.get('government_agency_type_code'),
            exemption_fee_status_code=data.get('exemption_fee_status_code'),
            exemption_fee_status_note=data.get('exemption_fee_status_note'))

        mine_status = _mine_status_processor(data.get('mine_status'), data.get('status_date'), mine)
        mine.save()

        # Clear and rebuild the cache after committing changes to db
        if lat and lon:
            cache.delete(MINE_MAP_CACHE)
            MineMapResource.rebuild_map_cache_async()

        # generate & set hybrid_properties to include in response payload
        mine.init_on_load()
        return mine

    def apply_filter_and_search(self, args):
        sort_models = {'mine_name': 'Mine', 'mine_no': 'Mine', 'mine_region': 'Mine'}

        # Handle ListView request
        items_per_page = args.get('per_page', 25, type=int)
        page = args.get('page', 1, type=int)
        sort_field = args.get('sort_field', 'mine_name', type=str)
        sort_dir = args.get('sort_dir', 'asc', type=str)
        sort_model = sort_models.get(sort_field)
        search_term = args.get('search', None, type=str)

        # Filters to be applied
        commodity_filter_terms = args.getlist('commodity', type=str)
        status_filter_term = args.getlist('status', type=str)
        work_status_filter_term = args.getlist('work_status', type=str)
        tenure_filter_term = args.getlist('tenure', type=str)
        region_code_filter_term = args.getlist('region', type=str)
        major_mine_filter_term = args.get('major', None, type=str)
        tsf_filter_term = args.get('tsf', None, type=str)
        verified_only_term = args.get('verified', None, type=str)

        # Base query:
        mines_query = Mine.query

        # Filter by search_term if provided
        if search_term:
            search_term = search_term.strip()
            name_filter = Mine.mine_name.ilike('%{}%'.format(search_term))
            number_filter = Mine.mine_no.ilike('%{}%'.format(search_term))
            permit_filter = Permit.permit_no.ilike('%{}%'.format(search_term))
            mines_name_query = Mine.query.filter(name_filter | number_filter)

            permit_query = Mine.query.join(MinePermitXref).join(Permit).filter(
                permit_filter, Permit.deleted_ind == False, MinePermitXref.deleted_ind == False)
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
            region_filter = Mine.mine_region.in_(region_code_filter_term)
            region_query = Mine.query.filter(region_filter)
            mines_query = mines_query.intersect(region_query)

        # Filter by commodity if provided
        if commodity_filter_terms:
            commodity_filter = MineTypeDetail.mine_commodity_code.in_(commodity_filter_terms)
            mine_type_active_filter = MineType.active_ind.is_(True)
            commodity_query = Mine.query \
                .join(MineType) \
                .join(MineTypeDetail) \
                .filter(commodity_filter, mine_type_active_filter)
            mines_query = mines_query.intersect(commodity_query)

        # Create a filter on tenure if one is provided
        if tenure_filter_term:
            tenure_filter = MineType.mine_tenure_type_code.in_(tenure_filter_term)
            mine_type_active_filter = MineType.active_ind.is_(True)
            tenure_query = Mine.query \
                .join(MineType) \
                .filter(tenure_filter, mine_type_active_filter)
            mines_query = mines_query.intersect(tenure_query)

        # Create a filter on verified mine status
        if verified_only_term == "true" or verified_only_term == "false":
            verified_only_filter = MineVerifiedStatus.healthy_ind.is_(verified_only_term == "true")
            verified_only_query = Mine.query.join(MineVerifiedStatus).filter(verified_only_filter)
            mines_query = mines_query.intersect(verified_only_query)

        # Create a filter on mine status if one is provided
        if status_filter_term:
            status_filter = MineStatusXref.mine_operation_status_code.in_(status_filter_term)
            status_reason_filter = MineStatusXref.mine_operation_status_reason_code.in_(
                status_filter_term)
            status_subreason_filter = MineStatusXref.mine_operation_status_sub_reason_code.in_(
                status_filter_term)
            all_status_filter = status_filter | status_reason_filter | status_subreason_filter

            mine_status_alias = aliased(MineStatus)
            sub_query_latest_ts = select([mine_status_alias.mine_guid,
                                          func.max(mine_status_alias.update_timestamp).label('latest_timestamp')])\
                .group_by(mine_status_alias.mine_guid)\
                .alias()

            # Join the subquery with the main query
            status_query = db.session.query(Mine)\
                .join(sub_query_latest_ts, Mine.mine_guid == sub_query_latest_ts.c.mine_guid)\
                .join(MineStatus,
                        and_(
                            Mine.mine_guid == MineStatus.mine_guid,
                            MineStatus.update_timestamp == sub_query_latest_ts.c.latest_timestamp))\
                .join(MineStatusXref)\
                .filter(all_status_filter, MineStatus.active_ind == True)
            mines_query = mines_query.intersect(status_query)

        if work_status_filter_term:
            work_status_query = Mine.query \
                .filter(Mine.work_status.in_(work_status_filter_term))
            mines_query = mines_query.intersect(work_status_query)

        deleted_filter = [{'field': 'deleted_ind', 'op': '==', 'value': 'False'}]
        mines_query = apply_filters(mines_query, deleted_filter)

        # Apply sorting
        if sort_model and sort_field and sort_dir:
            sort_criteria = [{'model': sort_model, 'field': sort_field, 'direction': sort_dir}]
            mines_query = apply_sort(mines_query, sort_criteria)

        return apply_pagination(mines_query, page, items_per_page)


class MineResource(Resource, UserMixin):
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
        'status_date', help='The date when the current status took effect', location='json')
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
    parser.add_argument(
        'ohsc_ind', type=bool, store_missing=False, help='Indicates if the mine has an OHSC.')
    parser.add_argument(
        'union_ind', type=bool, store_missing=False, help='Indicates if the mine has a union.')
    parser.add_argument(
        'exemption_fee_status_code',
        type=str,
        help='Fee exemption status for the mine.',
        store_missing=False,
        trim=True,
        location='json')
    parser.add_argument(
        'exemption_fee_status_note',
        type=str,
        help='Fee exemption status note for the mine.',
        store_missing=False,
        trim=True,
        location='json')
    parser.add_argument(
        'government_agency_type_code',
        type=str,
        help='Government agency the mine belongs to.',
        store_missing=False,
        trim=True,
        location='json')
    parser.add_argument(
        'number_of_contractors',
        type=int,
        help='Number of contractors.',
        location='json')
    parser.add_argument(
        'number_of_mine_employees',
        type=int,
        help='Number of mine employees.',
        location='json')

    @api.doc(description='Returns the specific mine from the mine_guid or mine_no provided.')
    @api.marshal_with(MINE_MODEL, code=200)
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    def get(self, mine_no_or_guid):

        mine = Mine.find_by_mine_no_or_guid(mine_no_or_guid)
        if not mine:
            raise NotFound('Mine not found.')

        return mine

    @api.expect(parser)
    @api.marshal_with(MINE_MODEL, code=200)
    @api.doc(description='Updates the specified mine.')
    @requires_any_of([MINE_EDIT, MINESPACE_PROPONENT])
    def put(self, mine_no_or_guid):
        mine = Mine.find_by_mine_no_or_guid(mine_no_or_guid)
        refresh_cache = False
        if not mine:
            raise NotFound("Mine not found.")

        data = self.parser.parse_args()

        if is_minespace_user() is not True: 
            lat = data.get('latitude')
            lon = data.get('longitude')
            if (lat and not lon) or (not lat and lon):
                raise BadRequest('latitude and longitude must both be empty, or both provided')

            # Mine Detail
            if 'mine_name' in data and mine.mine_name != data['mine_name']:
                _throw_error_if_mine_exists(data['mine_name'])
                mine.mine_name = data['mine_name']
                refresh_cache = True
            if 'mine_note' in data:
                mine.mine_note = data['mine_note']
            if 'major_mine_ind' in data:
                mine.major_mine_ind = data['major_mine_ind']
            if 'mine_region' in data:
                mine.mine_region = data['mine_region']
            if 'ohsc_ind' in data:
                mine.ohsc_ind = data['ohsc_ind']
            if 'union_ind' in data:
                mine.union_ind = data['union_ind']
            if 'latitude' in data and 'longitude' in data:
                mine.latitude = data['latitude']
                mine.longitude = data['longitude']
                refresh_cache = True
            if 'government_agency_type_code' in data:
                mine.government_agency_type_code = data.get('government_agency_type_code')
            if 'exemption_fee_status_code' in data:
                mine.exemption_fee_status_code = data.get('exemption_fee_status_code')
            if 'exemption_fee_status_note' in data:
                mine.exemption_fee_status_note = data.get('exemption_fee_status_note')
        if 'number_of_contractors' in data:
            mine.number_of_contractors = data.get('number_of_contractors')
        if 'number_of_mine_employees' in data:
            mine.number_of_mine_employees = data.get('number_of_mine_employees')

        mine.save()

        if 'mine_status' in data:
            _mine_status_processor(data.get('mine_status'), data.get('status_date'), mine)

        # refresh cache will need to be called for all supported fields, should more be added in the future
        if refresh_cache:
            cache.delete(MINE_MAP_CACHE)
            MineMapResource.rebuild_map_cache_async()

        return mine


class MineListSearch(Resource):
    @api.doc(
        params={
            'name': 'Search term in mine name.',
            'term': 'Search term in mine name, mine number, and permit.'
        })
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(MINE_SEARCH_MODEL, code=200, envelope='mines')
    def get(self):
        name_search = request.args.get('name')
        search_term = request.args.get('term')
        major = None
        if 'major' in request.args:
            major = request.args.get('major')

        if search_term:
            result = Mine.find_by_name_no_permit(search_term, major=major)
        else:
            result = Mine.find_by_mine_name(name_search, major=major)

        return result


# Functions shared by the MineListResource and the MineResource
def _mine_operation_code_processor(mine_status, index):
    try:
        return mine_status[index].strip()
    except IndexError:
        return None


def _mine_status_processor(mine_status, status_date, mine):
    if not mine_status:
        existing_status_date = mine.mine_status[0].status_date if mine.mine_status else None
        if status_date == existing_status_date:
            return mine.mine_status

        new_status = MineStatus(status_date=status_date)
        mine.mine_status.append(new_status)
        new_status.save()
        mine.save(commit=False)
        return new_status
    mine_status_xref = MineStatusXref.find_by_codes(
        _mine_operation_code_processor(mine_status, 0),
        _mine_operation_code_processor(mine_status, 1),
        _mine_operation_code_processor(mine_status, 2))
    if not mine_status_xref:
        raise BadRequest('Invalid status_code, reason_code, and sub_reason_code combination.')
    existing_status = mine.mine_status[0] if mine.mine_status else None
    if existing_status:
        if existing_status.mine_status_xref_guid == mine_status_xref.mine_status_xref_guid \
                and str(status_date) == str(existing_status.status_date):
            return existing_status

        existing_status.expiry_date = datetime.today()
        existing_status.active_ind = False
        existing_status.save()
    if status_date == '':
        new_status = MineStatus(mine_status_xref_guid=mine_status_xref.mine_status_xref_guid)
    else:
        new_status = MineStatus(
            mine_status_xref_guid=mine_status_xref.mine_status_xref_guid, status_date=status_date)
    mine.mine_status.append(new_status)
    new_status.save()
    mine.save(commit=False)
    return new_status


def _throw_error_if_mine_exists(mine_name):
    # query the mine tables and check if that mine name exists
    if mine_name:
        name_filter = Mine.mine_name.ilike(mine_name.strip())
        mines_name_query = Mine.query.filter(name_filter).filter_by(deleted_ind=False)
        mines_with_name = mines_name_query.all()
        if len(mines_with_name) > 0:
            raise BadRequest(f'Mine No: {mines_with_name[0].mine_no} already has that name.')
