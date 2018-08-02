import uuid

from db import db
from flask_restplus import Resource, reqparse
from models.mines import MineIdentity, MineDetail
from utils.random import generate_mine_no


class Mine(Resource):
    parser = reqparse.RequestParser()
    parser.add_argument('name', type=str, required=True, help='This field cannot be blank.')
    
    def post(self):
        data = Mine.parser.parse_args()
        if not data['name']:
            return {'error': 'Must specify a name.'}, 400
        if len(data['name']) > 60:
            return {'error': 'Specified name exceeds 60 characters.'}, 400
        # Dummy User for now
        dummy_user = 'DummyUser'
        dummy_user_kwargs = { 'create_user': dummy_user, 'update_user': dummy_user }
        mine_identity= MineIdentity(mine_guid = uuid.uuid4(), **dummy_user_kwargs)
        mine_identity.save()
        mine_detail = MineDetail(mine_guid=mine_identity.mine_guid, mine_no=generate_mine_no(), mine_name=data['name'], **dummy_user_kwargs)
        mine_detail.save()
        return { 'mine_guid': str(mine_detail.mine_guid), 'mine_no': mine_detail.mine_no, 'mine_name': mine_detail.mine_name }



class MineList(Resource):
    def get(self):
        return { 'mines': list(map(lambda x: x.json(), MineIdentity.query.all())) }
