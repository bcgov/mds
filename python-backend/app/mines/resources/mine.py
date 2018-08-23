import uuid

from flask import request

from flask_restplus import Resource, reqparse
from ..models.mines import MineIdentity, MineDetail, MineralTenureXref
from ..utils.random import generate_mine_no
from app.extensions import jwt


class Mine(Resource):
    parser = reqparse.RequestParser()
    parser.add_argument('name', type=str)
    parser.add_argument('tenure_number_id', type=str)

    @jwt.requires_roles(["mds-mine-view"])
    def get(self, mine_no):
        mine = MineIdentity.find_by_mine_no(mine_no) or MineIdentity.find_by_mine_guid(mine_no)
        if mine:
            return mine.json()
        return {'message': 'Mine not found'}, 404

    @jwt.requires_roles(["mds-mine-create"])
    def post(self, mine_no=None):
        if mine_no:
            return {'error': 'Unexpected mine number in Url.'}, 400

        data = Mine.parser.parse_args()
        if not data['name']:
            return {'error': 'Must specify a name.'}, 400
        if len(data['name']) > 60:
            return {'error': 'Specified name exceeds 60 characters.'}, 400
        # Dummy User for now
        dummy_user = 'DummyUser'
        dummy_user_kwargs = { 'create_user': dummy_user, 'update_user': dummy_user }
        mine_identity= MineIdentity(mine_guid=uuid.uuid4(), **dummy_user_kwargs)
        mine_identity.save()
        mine_detail = MineDetail(mine_guid=mine_identity.mine_guid, mine_no=generate_mine_no(), mine_name=data['name'], **dummy_user_kwargs)
        mine_detail.save()
        return { 'mine_guid': str(mine_detail.mine_guid), 'mine_no': mine_detail.mine_no, 'mine_name': mine_detail.mine_name }

    @jwt.requires_roles(["mds-mine-create"])
    def put(self, mine_no):
        data = Mine.parser.parse_args()
        if not data['tenure_number_id']:
            return {'error': 'Must specify tenure_id.'}, 400
        mine = MineIdentity.find_by_mine_no(mine_no) or MineIdentity.find_by_mine_guid(mine_no)
        if not mine:
            return {'message': 'Mine not found'}, 404
        tenure = data['tenure_number_id']
        if not tenure.isdigit():
            return {'error': 'Field tenure_id must contain only digits.'}, 400
        if len(tenure) != 7:
            return {'error': 'Field tenure_id must be exactly 7 digits long.'}, 400
        tenure_exists = MineralTenureXref.find_by_tenure(tenure)
        if tenure_exists:
            return {'error': 'Field tenure_id already exists for this mine'}, 400
        dummy_user = 'DummyUser'
        dummy_user_kwargs = { 'create_user': dummy_user, 'update_user': dummy_user }
        tenure = MineralTenureXref(mine_guid=mine.mine_guid, tenure_number_id=tenure, **dummy_user_kwargs)
        tenure.save()
        return mine.json()


class MineList(Resource):
    @jwt.requires_roles(["mds-mine-view"])
    def get(self):
        return { 'mines': list(map(lambda x: x.json(), MineIdentity.query.all())) }


class MineListByName(Resource):
    @jwt.requires_roles(["mds-mine-view"])
    def get(self):
        return { 'mines': list(map(lambda x: x.json_by_name(), MineIdentity.query.all())) }
