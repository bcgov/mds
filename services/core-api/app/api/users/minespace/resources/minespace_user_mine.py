import uuid

from flask_restx import Resource, reqparse
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError

from app.extensions import api, db
from app.api.utils.access_decorators import requires_role_mine_admin
from app.api.utils.resources_mixins import UserMixin

from app.api.users.minespace.models.minespace_user import MinespaceUser
from app.api.users.minespace.models.minespace_user_mine import MinespaceUserMine
from app.api.users.response_models import MINESPACE_USER_MODEL


class MinespaceUserMineListResource(Resource, UserMixin):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('mine_guid', type=str, required=True)

    @api.doc(params={'user_id': 'User id.', 'mine_guid': 'MDS Mine Guid'})
    @api.marshal_with(MINESPACE_USER_MODEL, envelope='records')
    @requires_role_mine_admin
    def post(self, user_id=None, mine_guid=None):
        if not user_id:
            raise BadRequest("user_id not found")
        if mine_guid:
            raise BadRequest("unexpected mine_guid")
        data = self.parser.parse_args()
        guid = uuid.UUID(data.get('mine_guid'))  #ensure good formatting

        mum = MinespaceUserMine.create(user_id, guid)
        mum.save()
        return mum.user


class MinespaceUserMineResource(Resource, UserMixin):
    @api.doc(params={'user_id': 'User id.', 'mine_guid': 'MDS Mine Guid'})
    @requires_role_mine_admin
    def delete(self, user_id=None, mine_guid=None):
        if not user_id or not mine_guid:
            raise BadRequest("user_guid or mine_guid not found")
        user = MinespaceUser.find_by_id(user_id)
        if not user:
            raise NotFound("user not found")
        found = False
        for mum in user.mines:
            if str(mum.mine_guid) == mine_guid:
                db.session.delete(mum)
                found = True
                break
        if not found:
            raise NotFound('user is not related to the provided mine')
        user.save()
        return ('', 204)
