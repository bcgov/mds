import uuid

from flask_restplus import Resource, reqparse
from flask import request
from app.extensions import api
from ....utils.access_decorators import requires_role_mine_admin
from ....utils.resources_mixins import UserMixin, ErrorMixin
from ..models.minespace_user import MinespaceUser
from ..models.minespace_user_mine import MinespaceUserMine
from app.extensions import db
from app.api.utils.url import get_mines_svc_url


class MinespaceUserResource(Resource, UserMixin, ErrorMixin):
    parser = reqparse.RequestParser()
    parser.add_argument('email', type=str, location='json', required=True)
    parser.add_argument('mine_guids', type=list, location='json', required=True)

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
        else:
            ms_users = MinespaceUser.get_all()
            result = {'users': [x.json() for x in ms_users]}
        return result

    @api.doc(params={'user_id': 'Not expected.'})
    @requires_role_mine_admin
    def post(self, user_id=None):
        if user_id:
            return self.create_error_payload(400, "unexpected user guid"), 400
        data = self.parser.parse_args()
        try:
            new_user = MinespaceUser.create_minespace_user(data.get('email'))
            db.session.commit()
            for guid in data.get('mine_guids'):
                guid = uuid.UUID(guid)  #ensure good formatting
                new_mum = MinespaceUserMine.create_minespace_user_mine(new_user.user_id, guid)
                db.session.commit()
        except Exception as e:
            db.session.rollback()
            return self.create_error_payload(500, "An error occurred: " + str(e)), 500
        return new_user.json()

    @api.doc(params={'user_id': 'user_id to be deleted'})
    @requires_role_mine_admin
    def delete(self, user_id=None):
        if not user_id:
            return self.create_error_payload(400, "user_id not found"), 400
        user = MinespaceUser.find_by_id(user_id)
        if not user:
            return self.create_error_payload(404, "user not found"), 404
        for um in user.mines:
            db.session.delete(um)
        db.session.commit()
        db.session.delete(user)
        db.session.commit()
        return ('', 204)
