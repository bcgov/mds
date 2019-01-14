import uuid

from flask_restplus import Resource, reqparse
from flask import request
from app.extensions import api
from ....utils.access_decorators import requires_role_mine_admin
from ....utils.resources_mixins import UserMixin, ErrorMixin
from ..models.minespace_user import MinespaceUser
from ..models.minespace_user_mine import MinespaceUserMine
from app.extensions import db


class MinespaceUserMineResource(Resource, UserMixin, ErrorMixin):
    parser = reqparse.RequestParser()
    parser.add_argument('mine_guid', type=str, required=True)

    @api.doc(params={'user_id': 'User id.', 'mine_guid': 'MDS Mine Guid'})
    @requires_role_mine_admin
    def post(self, user_id=None, mine_guid=None):
        if not user_id:
            return self.create_error_payload(400, "user_id not found"), 400
        if mine_guid:
            return self.create_error_payload(400, "unexpected mine_guid"), 400
        data = self.parser.parse_args()
        guid = uuid.UUID(data.get('mine_guid'))  #ensure good formatting

        user = MinespaceUser.find_by_id(user_id)
        user.mines.append(MinespaceUserMine(user_id=user.user_id, mine_guid=guid))
        user.save()
        return user.json()

    @api.doc(params={'user_id': 'User id.', 'mine_guid': 'MDS Mine Guid'})
    @requires_role_mine_admin
    def delete(self, user_id=None, mine_guid=None):
        if not user_id or not mine_guid:
            return self.create_error_payload(400, "user_guid or mine_guid not found"), 400
        user = MinespaceUser.find_by_id(user_id)
        if not user:
            return self.create_error_payload(500, "user not found"), 500
        found = False
        for mum in user.mines:
            if str(mum.mine_guid) == mine_guid:
                db.session.delete(mum)
                found = True
                break
        if found:
            user.save()
            return ('', 204)
        return self.create_error_payload(500, 'not user mine relation found')
