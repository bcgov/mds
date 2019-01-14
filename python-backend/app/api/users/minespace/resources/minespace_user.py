import uuid

from flask_restplus import Resource, reqparse
from flask import request
from app.extensions import api
from ....utils.access_decorators import requires_role_mine_admin
from ....utils.resources_mixins import UserMixin, ErrorMixin
from ..models.minespace_user import MinespaceUser
from ..models.minespace_user_mine import MinespaceUserMine
from app.extensions import db


class MinespaceUserResource(Resource, UserMixin, ErrorMixin):
    parser = reqparse.RequestParser()
    parser.add_argument('email', type=str, location='json', required=True)
    parser.add_argument('mine_guids', type=list, location='json', required=True)

    @api.doc(params={'user_id': 'User id.'})
    @requires_role_mine_admin
    def get(self, user_id=None):
        if user_id or request.args.get('email'):
            user = MinespaceUser.find_by_id(user_id)
            if not user:
                user = MinespaceUser.find_by_email(request.args.get('email'))
                if not user:
                    return self.create_error_payload(404, "user not found"), 404
            return user.json()
        users = MinespaceUser.get_all()
        return {'users': [x.json() for x in users]}

    @api.doc(params={'user_id': 'User id.'})
    @requires_role_mine_admin
    def post(self, user_id=None):
        if user_id:
            return self.create_error_payload(400, "unexpected user guid"), 400
        data = self.parser.parse_args()
        new_user = MinespaceUser(email=data.get('email'))
        db.session.add(new_user)
        for guid in data.get('mine_guids'):
            guid = uuid.UUID(guid)  #ensure good formatting
            new_user.mines.append(MinespaceUserMine(user_id=new_user.user_id, mine_guid=guid))
        db.session.commit()
        return new_user.json()

    def delete(self, user_id=None):
        if not user_id:
            return self.create_error_payload(400, "user_id not found")
        user = MinespaceUser.find_by_id(user_id)
        if not user:
            return self.create_error_payload(404, "user not found")
        user.deleted_ind = True
        user.save()
        return ('', 204)
