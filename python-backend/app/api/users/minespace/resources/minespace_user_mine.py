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
        try:
            mum = MinespaceUserMine.create_minespace_user_mine(user_id=user_id, mine_guid=guid))
            mum.save()
        except:
            self.create_error_payload(500, "ERROR: user-mine access was not created"), 500
        return mum.user.json()

    @api.doc(params={'user_id': 'User id.', 'mine_guid': 'MDS Mine Guid'})
    @requires_role_mine_admin
    def delete(self, user_id=None, mine_guid=None):
        if not user_id or not mine_guid:
            return self.create_error_payload(400, "user_guid or mine_guid not found"), 400
        user = MinespaceUser.find_by_id(user_id)
        if not user:
            return self.create_error_payload(404, "user not found"), 404
        found = False
        for mum in user.mines:
            if str(mum.mine_guid) == mine_guid:
                db.session.delete(mum)
                found = True
                break
        if not found:
            return self.create_error_payload(404, 'user is not related to the provided mine'), 404
        user.save()
        return ('', 204)
