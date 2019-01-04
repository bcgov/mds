import decimal
import uuid

from flask import request
from flask_restplus import Resource, reqparse, inputs
from sqlalchemy_filters import apply_sort, apply_pagination

from ...status.models.mine_status import MineStatus
from ...status.models.mine_status_xref import MineStatusXref
from ..models.mine_identity import MineIdentity
from ..models.mineral_tenure_xref import MineralTenureXref
from ....permits.permit.models.permit import Permit
from ...location.models.mine_location import MineLocation
from ...location.models.mine_map_view_location import MineMapViewLocation
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
                name_filter = MineIdentity.mine_name.ilike('%{}%'.format(search_term))
                number_filter = MineIdentity.mine_no.ilike('%{}%'.format(search_term))
                permit_filter = Permit.permit_no.ilike('%{}%'.format(search_term))
                mines_query = MineIdentity.query.filter(name_filter | number_filter)
                permit_query = MineIdentity.query.join(Permit).filter(permit_filter)
                mines_permit_join_query = mines_query.union(permit_query)
                if status_search_term:
                    status_query = MineIdentity.query\
                        .join(MineStatus)\
                        .join(MineStatusXref)\
                        .filter(all_status_filter)
                    mines_permit_join_query = mines_permit_join_query.intersect(status_query)
                result_query, pagination_details = apply_pagination(mines_permit_join_query, page,
                                                                    items_per_page)

            else:
                sort_criteria = [{
                    'model': 'MineIdentity',
                    'field': 'mine_name',
                    'direction': 'asc'
                }]
                if status_search_term:
                    mine_query_with_status = MineIdentity.query\
                        .join(MineStatus)\
                        .join(MineStatusXref)\
                        .filter(all_status_filter)
                    result_query = apply_sort(mine_query_with_status, sort_criteria)
                else:
                    result_query = apply_sort(MineIdentity.query, sort_criteria)

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
            mine_status_xref = MineStatusXref(
                mine_status_xref_guid=uuid.uuid4(),
                mine_operation_status_code=self.mine_operation_code_processor(mine_status, 0),
                mine_operation_status_reason_code=self.mine_operation_code_processor(
                    mine_status, 1),
                mine_operation_status_sub_reason_code=self.mine_operation_code_processor(
                    mine_status, 2),
                **self.get_create_update_dict())
        except AssertionError as e:
            self.raise_error(400, 'Error: {}'.format(e))
        mine_status_xref.save()
        try:
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
            mine_identity = MineIdentity(
                mine_guid=uuid.uuid4(),
                mine_no=generate_mine_no(),
                mine_name=data['name'],
                mine_note=note if note else '',
                major_mine_ind=major_mine_ind,
                mine_region=mine_region,
                **self.get_create_update_dict())
        except AssertionError as e:
            self.raise_error(400, 'Error: {}'.format(e))
        mine_identity.save()

        if lat and lon:
            location = MineLocation(
                mine_location_guid=uuid.uuid4(),
                mine_guid=mine_identity.mine_guid,
                latitude=lat,
                longitude=lon,
                **self.get_create_update_dict())
            location.save()
        mine_status = self.mine_status_processor(status,
                                                 mine_identity.mine_guid) if status else None
        return {
            'mine_guid': str(mine_identity.mine_guid),
            'mine_no': mine_identity.mine_no,
            'mine_name': mine_identity.mine_name,
            'mine_note': mine_identity.mine_note,
            'major_mine_ind': mine_identity.major_mine_ind,
            'latitude': str(location.latitude) if location else None,
            'longitude': str(location.longitude) if location else None,
            'mine_status': mine_status.json() if mine_status else None,
            'mine_region': mine_identity.mine_region if mine_region else None,
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

        if (not tenure and not (lat and lon) and not mine_name and not mine_note and not status
                and not region and major_mine_ind is None):
            self.raise_error(400, 'Error: No fields filled.')
        mine = MineIdentity.find_by_mine_no_or_guid(mine_no_or_guid)
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
    @jwt.requires_roles(["mds-mine-view"])
    def get(self):
        search_term = request.args.get('search')
        if search_term:
            name_filter = MineIdentity.mine_name.ilike('%{}%'.format(search_term))
            number_filter = MineIdentity.mine_no.ilike('%{}%'.format(search_term))
            permit_filter = Permit.permit_no.ilike('%{}%'.format(search_term))
            mines_q = MineIdentity.query.filter(name_filter | number_filter)
            permit_q = MineIdentity.query.join(Permit).filter(permit_filter)
            mines = mines_q.union(permit_q).limit(self.MINE_LIST_RESULT_LIMIT).all()
        else:
            mines = MineIdentity.query.limit(self.MINE_LIST_RESULT_LIMIT).all()

        result = list(map(lambda x: {**x.json_by_name(), **x.json_by_location()}, mines))
        return {'mines': result}
