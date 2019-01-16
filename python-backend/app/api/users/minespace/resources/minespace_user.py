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

    # @api.doc(params={'user_id': 'User id.'})
    # @requires_role_mine_admin
    # def get(self, user_id=None):
    #     user = {}
    #     if user_id:
    #         user = MinespaceUser.find_by_id(user_id)
    #     if not user and request.args.get('email'):
    #         user = MinespaceUser.find_by_email(request.args.get('email'))
    #     if not user:
    #         return self.create_error_payload(404, "user not found"), 404
    #     if user:
    #         result = user.json()
    #     else:
    #         result = {'users': [x.json() for x in MinespaceUser.get_all()]}
    #     return result

    @api.doc(params={'user_id': 'User id.'})
    @requires_role_mine_admin
    def get(self, user_id=None):
        if user_id or request.args.get('email'):  #looking for a specific user
            user = MinespaceUser.find_by_id(user_id)
            if not user:
                user = MinespaceUser.find_by_email(request.args.get('email'))
                if not user:
                    return self.create_error_payload(404, "user not found"), 404
            result = user.json()
        else:  #get all users (not deleted)
            result = {'users': [x.json() for x in MinespaceUser.get_all()]}
        return result

    @api.doc(params={'user_id': 'Not expected.'})
    @requires_role_mine_admin
    def post(self, user_id=None):
        if user_id:
            return self.create_error_payload(400, "unexpected user guid"), 400
        data = self.parser.parse_args()
        new_user = MinespaceUser.create_minespace_user(data.get('email'), save=False)
        db.session.add(new_user)
        for guid in data.get('mine_guids'):
            guid = uuid.UUID(guid)  #ensure good formatting
            new_mum = MinespaceUserMine.create_minespace_user_mine(
                new_user.user_id, guid, save=False)
        db.session.commit()
        return new_user.json()

    @api.doc(params={'user_id': 'user_id to be deleted'})
    @requires_role_mine_admin
    def delete(self, user_id=None):
        if not user_id:
            return self.create_error_payload(400, "user_id not found")
        user = MinespaceUser.find_by_id(user_id)
        if not user:
            return self.create_error_payload(404, "user not found")
        user.deleted_ind = True
        user.save()
        return ('', 204)
