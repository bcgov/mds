import decimal
import uuid

from flask import request
from flask_restplus import Resource, reqparse

from ..models.mines import MineIdentity, MineDetail, MineralTenureXref
from ..models.location import MineLocation
from ..utils.random import generate_mine_no
from app.extensions import jwt
from jose import jwt as jwt_jose
from .mixins import UserMixin

class Mine(Resource, UserMixin):
    parser = reqparse.RequestParser()
    parser.add_argument('name', type=str)
    parser.add_argument('note', type=str)
    parser.add_argument('tenure_number_id', type=str)
    parser.add_argument('longitude', type=decimal.Decimal)
    parser.add_argument('latitude', type=decimal.Decimal)

    @jwt.requires_roles(["mds-mine-view"])
    def get(self, mine_no):
        mine = MineIdentity.find_by_mine_no_or_guid(mine_no)
        if mine:
            return mine.json()
        return {'message': 'Mine not found'}, 404

    @jwt.requires_roles(["mds-mine-create"])
    def post(self, mine_no=None):
        if mine_no:
            return {'error': 'Unexpected mine number in Url.'}, 400

        data = Mine.parser.parse_args()
        name = data['name']
        lat = data['latitude']
        lon = data['longitude']
        note = data['note']
        location = None
        if not name:
            return {'error': 'Must specify a name.'}, 400
        if len(name) > 60:
            return {'error': 'Specified name exceeds 60 characters.'}, 400
        user_info = self.get_user_info()
        user_kwargs = {'create_user': user_info, 'update_user': user_info}
        mine_identity = MineIdentity(mine_guid=uuid.uuid4(), **user_kwargs)
        mine_identity.save()
        mine_detail = MineDetail(
            mine_detail_guid=uuid.uuid4(),
            mine_guid=mine_identity.mine_guid,
            mine_no=generate_mine_no(),
            mine_name=name,
            mine_note=note if note else '',
            **user_kwargs
        )
        mine_detail.save()
        if lat and lon:
            location = MineLocation(
                mine_location_guid=uuid.uuid4(),
                mine_guid=mine_identity.mine_guid,
                latitude=lat,
                longitude=lon,
                **user_kwargs
            )
            location.save()

        return {
            'mine_guid': str(mine_detail.mine_guid),
            'mine_no': mine_detail.mine_no,
            'mine_name': mine_detail.mine_name,
            'mine_note': mine_detail.mine_note,
            'latitude': str(location.latitude) if location else None,
            'longitude': str(location.longitude) if location else None,
        }

    @jwt.requires_roles(["mds-mine-create"])
    def put(self, mine_no):
        data = Mine.parser.parse_args()
        tenure = data['tenure_number_id']
        lat = data['latitude']
        lon = data['longitude']
        if not tenure and not (lat and lon):
            return {'error': 'No fields filled.'}, 400
        mine = MineIdentity.find_by_mine_no_or_guid(mine_no)
        if not mine:
            return {'message': 'Mine not found'}, 404
        user_info = self.get_user_info()
        user_kwargs = {'create_user': user_info, 'update_user': user_info}
        # Tenure validation
        if tenure:
            if not tenure.isdigit():
                return {'error': 'Field tenure_id must contain only digits.'}, 400
            if len(tenure) not in [6, 7]:
                return {'error': 'Field tenure_id must be 6 or 7 digits long.'}, 400
            tenure_exists = MineralTenureXref.find_by_tenure(tenure)
            if tenure_exists:
                return {'error': 'Field tenure_id already exists for this mine'}, 400
            tenure = MineralTenureXref(
                mineral_tenure_xref_guid=uuid.uuid4(),
                mine_guid=mine.mine_guid,
                tenure_number_id=tenure,
                **user_kwargs
            )
            tenure.save()
        # Location validation
        if lat and lon:
            location = MineLocation(
                mine_location_guid=uuid.uuid4(),
                mine_guid=mine.mine_guid,
                latitude=lat,
                longitude=lon,
                **user_kwargs
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
        return {'mines': result }
