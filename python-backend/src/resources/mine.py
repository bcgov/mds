import uuid

from db import db
from flask_restplus import Resource, reqparse
from models.mines import MineIdentifier, MineDetails
from utils.random import random_key_gen
class Mine(Resource):
    parser = reqparse.RequestParser()
    parser.add_argument('name', type=str, required=True, help='This field cannot be blank.')
    def get(self):
        # db.engine.connect()
        try:
            db.engine.connect()
            return {'msg': 'hello world!'}
        except:
            return {'error': 'Cannot establish connection to db'}
    
    def post(self):
        data = Mine.parser.parse_args()
        # Dummy User for now
        dummy_user = 'DummyUser'
        dummy_user_kwargs = { 'create_user': dummy_user, 'update_user': dummy_user }
        mine_identifier = MineIdentifier(mine_guid = uuid.uuid4(), **dummy_user_kwargs)
        mine_identifier.save()

        mine_details = MineDetails(mine_guid=mine_identifier.mine_guid, mine_no=random_key_gen(), mine_name=data['name'], **dummy_user_kwargs)
        mine_details.save()

class MineList(Resource):
    def get(self):
        return {'mines': list(map(lambda x: x.json(), MineIdentifier.query.all()))}
