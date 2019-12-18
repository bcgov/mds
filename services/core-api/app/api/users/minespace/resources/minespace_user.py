import uuid

from flask import request
from flask_restplus import Resource, reqparse
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError

from app.extensions import api, db
from app.api.utils.access_decorators import requires_role_mine_admin
from app.api.utils.resources_mixins import UserMixin

from app.api.users.minespace.models.minespace_user import MinespaceUser
from app.api.users.minespace.models.minespace_user_mine import MinespaceUserMine
from app.api.users.response_models import MINESPACE_USER_MODEL


class MinespaceUserListResource(Resource, UserMixin):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('email', type=str, location='json', required=True)
    parser.add_argument('mine_guids', type=list, location='json', required=True)

    @api.doc(params={'email': 'find by email, this will return a list with at most one element'})
    @api.marshal_with(MINESPACE_USER_MODEL, envelope='records')
    @requires_role_mine_admin
    def get(self):
        if request.args.get('email'):
            ms_users = [MinespaceUser.find_by_email(request.args.get('email'))]
        else:
            ms_users = MinespaceUser.get_all()
        return ms_users

    @api.marshal_with(MINESPACE_USER_MODEL)
    @requires_role_mine_admin
    def post(self):
        data = self.parser.parse_args()
        new_user = MinespaceUser.create_minespace_user(data.get('email'))
        new_user.save()
        for guid in data.get('mine_guids'):
            guid = uuid.UUID(guid)               #ensure good formatting
            new_mum = MinespaceUserMine.create(new_user.user_id, guid)
            new_mum.save()
        return new_user


class MinespaceUserResource(Resource, UserMixin):
    @api.marshal_with(MINESPACE_USER_MODEL)
    @requires_role_mine_admin
    def get(self, user_id):
        user = MinespaceUser.find_by_id(user_id)
        if not user:
            raise NotFound("user not found")
        return user

    @requires_role_mine_admin
    def delete(self, user_id):
        user = MinespaceUser.find_by_id(user_id)
        if not user:
            raise NotFound("user not found")
        for um in user.minespace_user_mines:
            db.session.delete(um)
        db.session.commit()
        db.session.delete(user)
        db.session.commit()
        return ('', 204)
