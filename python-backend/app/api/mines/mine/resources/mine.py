from decimal import Decimal
import uuid
from datetime import datetime
import json

from flask import request, make_response, current_app
from flask_restplus import Resource, reqparse, inputs, fields
from sqlalchemy_filters import apply_sort, apply_pagination, apply_filters
from werkzeug.exceptions import BadRequest, InternalServerError, NotFound

from ...status.models.mine_status import MineStatus
from ...status.models.mine_status_xref import MineStatusXref

from ..models.mine_type import MineType
from ..models.mine_type_detail import MineTypeDetail

from ..models.mine import Mine
from ..models.mineral_tenure_xref import MineralTenureXref
from ...location.models.mine_location import MineLocation
from ...location.models.mine_map_view_location import MineMapViewLocation
from ....utils.random import generate_mine_no
from app.extensions import api, cache, db
from ....utils.access_decorators import requires_role_mine_view, requires_role_mine_create, requires_any_of, MINE_VIEW, MINESPACE_PROPONENT
from ....utils.resources_mixins import UserMixin, ErrorMixin
from ....constants import MINE_MAP_CACHE, TIMEOUT_12_HOURS
# FIXME: Model import from outside of its namespace
# This breaks micro-service architecture and is done
# for search performance until search can be refactored
from ....permits.permit.models.permit import Permit

mine_location = api.model('MineLocation', {
    'mine_location_guid': fields.String,
    'mine_guid': fields.String,
    'latitude': fields.String,
    'longitude': fields.String,
})

mine_document = api.model('MineDocument', {
    'mine_document_guid': fields.String,
    'mine_guid': fields.String,
    'document_manager_guid': fields.String,
    'document_name': fields.String,
    'active_ind': fields.Boolean,
}) 

permit = api.model('MinePermit', {
    'permit_guid': fields.String,
    'permit_no': fields.String,
})

expected_document_status = api.model('ExpectedDocumentStatus', {
    'exp_document_status_code': fields.String,
    'description': fields.String,
}) 

status = api.model('MineStatus', {
    'mine_status_guid': fields.String,
    'mine_guid': fields.String,
    'mine_status_xref_guid': fields.String,
    'status_values': fields.List(fields.String()),
    'status_labels':fields.List(fields.String),
    'effective_date': fields.Date,
    'expiry_date': fields.Date,
})

mine_tsf = api.model('MineTailingsStorageFacility', {
    'mine_tailings_storage_facility_guid': fields.String,
    'mine_guid': fields.String,
    'mine_tailings_storage_facility_name': fields.String,
})

mine_type_detail = api.model('MineTypeDetail', {
    'mine_type_detail_xref_guid': fields.String,
    'mine_type_guid': fields.String,
    'mine_disturbance_code': fields.String,
    'mine_commodity_code': fields.String,
})

mine_type = api.model('MineType', {
    'mine_type_guid': fields.String,
    'mine_guid': fields.String,
    'mine_tenure_type_code': fields.String,
    'mine_type_detail': fields.List(fields.Nested(mine_type_detail)),
})

mine_verified = api.model('MineVerifiedStatus', {
    'mine_guid': fields.String,
    'mine_name': fields.String,
    'healthy_ind': fields.Boolean,
    'verifying_user': fields.String,
    'verifying_timestamp': fields.Date,
})

mine_expected_document = api.model('MineExpectedDocument', {
    'exp_document_guid': fields.String,
    'req_document_guid': fields.String,
    'mine_guid': fields.String,
    'exp_document_name': fields.String,
    'exp_document_description': fields.String,
    'due_date': fields.Date,
    'received_date': fields.Date,
    'exp_document_status_code': fields.String,
    'expected_document_status': fields.Nested(expected_document_status),
    'hsrc_code': fields.String,
    'related_documents': fields.List(fields.Nested(mine_document)),
})

mines = api.model(
    'Mines', {
        'mine_guid': fields.String,
        'mine_name': fields.String,
        'mine_no': fields.String,
        'mine_note': fields.String,
        'major_mine_ind': fields.Boolean,
        'mine_region': fields.String,
        'mine_permit': fields.List(fields.Nested(permit)),
        'mine_status': fields.List(fields.Nested(status)),
        'mine_tailings_storage_facilities': fields.List(fields.Nested(mine_tsf)),
        'mine_type': fields.List(fields.Nested(mine_type)),
        'verified_status': fields.Nested(mine_verified)
    })

mine = api.inherit('Mine', mines, {
    'mine_location': fields.Nested(mine_location),
    'mine_expected_documents': fields.List(fields.Nested(mine_expected_document)),

})

mine_list_model = api.model(
    'MineList', {
        'mines': fields.List(fields.Nested(mines)),
        'current_page': fields.Integer,
        'total_pages': fields.Integer,
        'items_per_page': fields.Integer,
        'total': fields.Integer,
    })


class MineListResource(Resource, UserMixin):
    parser = reqparse.RequestParser()
    parser.add_argument(
        'mine_name', type=str, help='Name of the mine.', trim=True, required=True)
    parser.add_argument(
        'mine_note',
        type=str,
        help='Any additional notes to be added to the mine.',
        trim=True,
        store_missing=False)
    parser.add_argument(
        'longitude',
        type=lambda x: Decimal(x) if x else None,
        help='Longitude point for the mine.',
        store_missing=False)
    parser.add_argument(
        'latitude',
        type=lambda x: Decimal(x) if x else None,
        help='Latitude point for the mine.',
        store_missing=False)
    parser.add_argument(
        'mine_status',
        action='split',
        help=
        'Status of the mine, to be given as a comma separated string value. Ex: status_code, status_reason_code, status_sub_reason_code ',
        required=True)
    parser.add_argument(
        'major_mine_ind',
        type=inputs.boolean,
        help='Indication if mine is major_mine_ind or regional. Accepts "true", "false", "1", "0".',
        store_missing=False)
    parser.add_argument(
        'mine_region', type=str, help='Region for the mine.', trim=True, required=True)

    @api.doc(
        params={
            '?per_page': 'The number of results to be returned per page.',
            '?page': 'the current page number to be displayed.',
            '?search': 'The search term.',
            '?commodity': 'A commodity to filter the mine list by.',
            '?status': 'A mine status to filter the mine list by.',
            '?tenure': 'A mine tenure type to filter the mine list by.',
            '?region': 'A mine region to filter the mine list by.',
            '?major': 'True or false, filters the mine list by major mines or regional mines.',
            '?tsf': 'True or false, filter the mine list by mines with or without a TSF.',
        },
        description=
        'This endpoint returns a list of all mines filtered on the search paramaters provided.')
    @api.marshal_with(mine_list_model, code=200)
    @requires_any_of([MINE_VIEW, MINESPACE_PROPONENT])
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
    @api.doc(
        description=
        'This endpoint creates a new mine with the information provided and returns it. If an error occurs the appropriate response is returned.',
        responses={})
    @api.marshal_with(mine, code=201)
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
        deleted_filter = [{'field': 'deleted_ind', 'op': '==', 'value': 'False'}]
        mines_query = apply_filters(mines_query, deleted_filter)
        sort_criteria = [{'model': 'Mine', 'field': 'mine_name', 'direction': 'asc'}]
        mines_query = apply_sort(mines_query, sort_criteria)
        return apply_pagination(mines_query, page, items_per_page)


class MineResource(Resource, UserMixin, ErrorMixin):
    parser = reqparse.RequestParser()
    parser.add_argument(
        'mine_name', type=str, help='Name of the mine.', trim=True, store_missing=False)
    parser.add_argument(
        'mine_note',
        type=str,
        help='Any additional notes to be added to the mine.',
        trim=True,
        store_missing=False)
    parser.add_argument(
        'tenure_number_id',
        type=int,
        help='Tenure number for the mine.',
        trim=True,
        store_missing=False)
    parser.add_argument(
        'longitude',
        type=lambda x: Decimal(x) if x else None,
        help='Longitude point for the mine.',
        store_missing=False)
    parser.add_argument(
        'latitude',
        type=lambda x: Decimal(x) if x else None,
        help='Latitude point for the mine.',
        store_missing=False)
    parser.add_argument(
        'mine_status',
        action='split',
        help=
        'Status of the mine, to be given as a comma separated string value. Ex: status_code, status_reason_code, status_sub_reason_code ',
        store_missing=False)
    parser.add_argument(
        'major_mine_ind',
        type=inputs.boolean,
        help='Indication if mine is major_mine_ind or regional. Accepts "true", "false", "1", "0".',
        store_missing=False)
    parser.add_argument(
        'mine_region', type=str, help='Region for the mine.', trim=True, store_missing=False)

    @api.doc(description='This endpoint returns the mine associated with the provided mine number or mine guid. If not found returns the appropriate error', 
    params={'mine_no_or_guid': 'Mine number or guid of the mine to be returned.'})
    @api.marshal_with(mine, code=200)
    @requires_any_of([MINE_VIEW, MINESPACE_PROPONENT])
    def get(self, mine_no_or_guid=None):
        if not mine_no_or_guid:
            raise BadRequest('A mine number or guid must be provided.')

        mine = Mine.find_by_mine_no_or_guid(mine_no_or_guid)
        if not mine:
            raise NotFound('Mine not found')

        return mine

    @api.expect(parser)
    @api.marshal_with(mine, code=200)
    @api.doc(
        description=
        'This endpoint updates a mine using the form-data passed.',
        params={'mine_no_or_guid': 'A mine guid or mine number for the mine to update.'})
    @requires_role_mine_create
    def put(self, mine_no_or_guid=None):
        if not mine_no_or_guid:
            raise BadRequest('A mine number or guid must be provided.')

        mine = Mine.find_by_mine_no_or_guid(mine_no_or_guid)
        if not mine:
            raise NotFound("Mine not found")

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
        result = list(map(lambda x: {**x.json_by_name(), **x.json_by_location()}, mines))
        return {'mines': result}


# Functions shared by the MineListResource and the MineResource
def _mine_operation_code_processor( mine_status, index):
        try:
            return mine_status[index].strip()
        except IndexError:
            return None

def _mine_status_processor( mine_status, mine):
    if not mine_status:
        return mine.mine_status

    current_app.logger.info(f'updating mine no={mine.mine_no} to new_status={mine_status}')
    
    mine_status_xref = MineStatusXref.find_by_codes(
        _mine_operation_code_processor(mine_status, 0),
        _mine_operation_code_processor(mine_status, 1),
        _mine_operation_code_processor(mine_status, 2))
    if not mine_status_xref:
        raise BadRequest(
            'Invalid status_code, reason_code, and sub_reason_code combination.')

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

def _throw_error_if_mine_exists( mine_name):
    # query the mine tables and check if that mine name exists
    if mine_name:
        name_filter = Mine.mine_name.ilike(mine_name.strip())
        mines_name_query = Mine.query.filter(name_filter)
        mines_with_name = mines_name_query.all()
        if len(mines_with_name) > 0:
            raise BadRequest(f'Mine No: {mines_with_name[0].mine_no} already has that name.')