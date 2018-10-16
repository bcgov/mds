import decimal
import uuid

from flask import request
from flask_restplus import Resource, reqparse

from ...status.models.status import MineStatus, MineStatusXref
from ..models.mines import MineIdentity, MineDetail, MineralTenureXref
from ...location.models.location import MineLocation
from ...utils.random import generate_mine_no
from app.extensions import jwt
from ...utils.resources_mixins import UserMixin, ErrorMixin


class Mine(Resource, UserMixin, ErrorMixin):
    parser = reqparse.RequestParser()
    parser.add_argument('name', type=str)
    parser.add_argument('note', type=str)
    parser.add_argument('tenure_number_id', type=int)
    parser.add_argument('longitude', type=decimal.Decimal)
    parser.add_argument('latitude', type=decimal.Decimal)
    parser.add_argument('mine_status', action='split')

    @jwt.requires_roles(["mds-mine-view"])
    def get(self, mine_no):
        mine = MineIdentity.find_by_mine_no_or_guid(mine_no)
        if mine:
            return mine.json()
        return self.create_error_payload(404, 'Mine not found'), 404

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

    @jwt.requires_roles(["mds-mine-create"])
    def post(self, mine_no=None):
        if mine_no:
            self.raise_error(400, 'Error: Unexpected mine number in Url.'), 400

        data = Mine.parser.parse_args()
        lat = data['latitude']
        lon = data['longitude']
        note = data['note']
        location = None
        status = data['mine_status']
        mine_identity = MineIdentity(mine_guid=uuid.uuid4(), **self.get_create_update_dict())
        try:
            mine_detail = MineDetail(
                mine_detail_guid=uuid.uuid4(),
                mine_guid=mine_identity.mine_guid,
                mine_no=generate_mine_no(),
                mine_name=data['name'],
                mine_note=note if note else '',
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
            'latitude': str(location.latitude) if location else None,
            'longitude': str(location.longitude) if location else None,
            'mine_status': mine_status.json() if mine_status else None
        }

    @jwt.requires_roles(["mds-mine-create"])
    def put(self, mine_no):
        data = Mine.parser.parse_args()
        tenure = data['tenure_number_id']
        lat = data['latitude']
        lon = data['longitude']
        mine_name = data['name']
        mine_note = data['note']
        if not tenure and not (lat and lon) and not mine_name and not mine_note:
            self.raise_error(400, 'Error: No fields filled.')
        mine = MineIdentity.find_by_mine_no_or_guid(mine_no)
        if not mine:
            return self.create_error_payload(404, 'Mine not found'), 404
        # Mine Detail
        if mine_name or mine_note:
            mine_detail = mine.mine_detail[0]
            try:
                new_mine_detail = MineDetail(
                    mine_detail_guid=uuid.uuid4(),
                    mine_guid=mine.mine_guid,
                    mine_no=mine_detail.mine_no,
                    mine_name=mine_detail.mine_name,
                    mine_note=mine_detail.mine_note,
                    **self.get_create_update_dict()
                )
                if mine_name:
                    new_mine_detail.mine_name = mine_name
                if mine_note:
                    new_mine_detail.mine_note = mine_note
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

        return mine.json()


class MineList(Resource):
    @jwt.requires_roles(["mds-mine-view"])
    def get(self):
        _map = request.args.get('map', None, type=str)
        if _map and _map.lower() == 'true':
            return {'mines': list(map(lambda x: x.json_for_map(), MineIdentity.query.all()))}

        items_per_page = request.args.get('per_page', 50, type=int)
        page = request.args.get('page', 1, type=int)
        mines = MineIdentity.query.join(MineDetail).order_by(MineDetail.mine_name).paginate(page, items_per_page, False)
        return {
            'mines': list(map(lambda x: x.json(), mines.items)),
            'has_next': mines.has_next,
            'has_prev': mines.has_prev,
            'next_num': mines.next_num,
            'prev_num': mines.prev_num,
            'current_page': mines.page,
            'total_pages': mines.pages,
            'items_per_page': mines.per_page,
            'total': mines.total,
        }


class MineListByName(Resource):
    MINE_LIST_RESULT_LIMIT = 500

    @jwt.requires_roles(["mds-mine-view"])
    def get(self):
        search_term = request.args.get('search')
        if search_term:
            name_filter = MineDetail.mine_name.ilike('%{}%'.format(search_term))
            number_filter = MineDetail.mine_no.ilike('%{}%'.format(search_term))
            mines = MineIdentity.query.join(MineDetail).filter(name_filter | number_filter).limit(self.MINE_LIST_RESULT_LIMIT).all()
        else:
            mines = MineIdentity.query.limit(self.MINE_LIST_RESULT_LIMIT).all()

        result = list(map(lambda x: {**x.json_by_name(), **x.json_by_location()}, mines))
        return {'mines': result}
