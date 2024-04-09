from flask_restx import Resource, reqparse, fields
from flask import request
from datetime import datetime
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError

from app.extensions import api
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import requires_role_view_all, requires_role_mine_edit

from app.api.users.core.models.core_user import CoreUser

idir_user_detail_model = api.model(
    'idir_user_detail', {
        'bcgov_guid': fields.String,
        'username': fields.String,
        'title': fields.String,
        'city': fields.String,
        'department': fields.String,
    })

core_user_model = api.model(
    'core_user', {
        'core_user_guid': fields.String,
        'email': fields.String,
        'phone_no': fields.String,
        'idir_user_detail': fields.Nested(idir_user_detail_model),
        'last_logon': fields.DateTime,
    })


class CoreUserListResource(Resource, UserMixin):
    @api.marshal_with(core_user_model, envelope='results', code=200, as_list=True)
    @api.doc(description='Returns a list of all core users.',
             params={'idir_username': 'An IDIR username to return users for.'})
    @requires_role_view_all
    def get(self):
        idir_username = request.args.get('idir_username', None, type=str)

        if idir_username:
            core_users = CoreUser.find_by_idir_username(idir_username)
        else:
            core_users = CoreUser.query.filter_by(active_ind=True).all()

        return core_users


class CoreUserResource(Resource, UserMixin):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('email',
                        type=str,
                        help='Users email address.',
                        store_missing=False,
                        location="form")
    parser.add_argument('phone_no',
                        type=str,
                        help='Users phone number.',
                        store_missing=False,
                        location="form")
    parser.add_argument('phone_ext',
                        type=str,
                        help='Users phone number extension code.',
                        store_missing=False,
                        location="form")

    @api.marshal_with(core_user_model, code=200)
    @api.doc(description='Returns a single Core user based on its user guid.')
    @requires_role_view_all
    def get(self, core_user_guid):
        core_user = CoreUser.find_by_core_user_guid(core_user_guid)
        if not core_user:
            raise NotFound('Core user not found.')
        return core_user

    @api.expect(parser)
    @api.doc(description='Updates a Core user.',
             responses={
                 400: 'Resource not found.',
                 404: 'Bad request.',
             })
    @api.marshal_with(core_user_model, code=200)
    @requires_role_mine_edit
    def put(self, core_user_guid):
        core_user = CoreUser.find_by_core_user_guid(core_user_guid)

        if not core_user:
            raise NotFound('Core user not found.')

        data = self.parser.parse_args()

        for key, value in data.items():
            setattr(core_user, key, value)

        core_user.save()

        return core_user
