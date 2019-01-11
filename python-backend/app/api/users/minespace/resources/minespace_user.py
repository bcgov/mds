from flask_restplus import Resource, reqparse

from app.extensions import api
from ....utils.access_decorators import requires_role_mine_view
from ....utils.resources_mixins import UserMixin, ErrorMixin
from ..models.minespace_user import MinespaceUser


class MinespaceUserResource(Resource, UserMixin, ErrorMixin):
    parser = reqparse.RequestParser()
    parser.add_argument('username', type=str, required=True)

    @api.doc(params={'user_guid': 'User Guid.'})
    @requires_role_mine_view
    def get(self, user_guid=None):
        if user_guid:
            user = MinespaceUser.find_by_guid(mine_guid)
            if not user:
                return self.create_error_payload(500, "user not found"), 500
            return user.json()
        users = MinespaceUser.query.filter_by(deleted_ind=False).all()
        return {'users': [x.json(1) for x in users]}

    @api.doc(params={'user_guid': 'User Guid.'})
    @requires_role_mine_view
    def post(self, user_guid=None):
        if user_guid:
            return self.create_error_payload(400, "unexpected user guid"), 400
        data = self.parser.parse_args()
        new_user = MinespaceUser(username=data.get('username'))
        new_user.save()
        return new_user.json(depth=1)