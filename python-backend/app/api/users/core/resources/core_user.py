from flask_restplus import Resource, reqparse, fields
from flask import request
from datetime import datetime
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError

from app.extensions import api
from ..models.core_user import CoreUser
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import requires_role_mine_view, requires_role_mine_create

idir_membership_model = api.model('idir_membership', {
    'idir_membership_name': fields.String,
})

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
        'phone_ext': fields.String,
        'idir_user_detail': fields.Nested(idir_user_detail_model),
        'idir_membership': fields.List(fields.Nested(idir_membership_model)),
        'last_logon': fields.DateTime,
    })


class CoreUserListResource(Resource, UserMixin):
    parser = reqparse.RequestParser()
    parser.add_argument('idir_username', type=str, help='IDIR username.')

    @api.marshal_with(core_user_model, envelope='results', code=200, as_list=True)
    @api.doc(
        description='This endpoint returns a list of all core users.',
        params={'?idir_username': 'An IDIR username to return users for.'})
    #@requires_role_mine_view
    def get(self):
        idir_username = request.args.get('idir_username', None, type=str)

        if idir_username:
            core_users = CoreUser.find_by_idir_username(idir_username)
        else:
            core_users = CoreUser.query.filter_by(active_ind=True).all()

        if not core_users:
            raise NotFound('No users found.')

        return core_users


class CoreUserResource(Resource, UserMixin):
    parser = reqparse.RequestParser()
    parser.add_argument(
        'core_user_guid', type=str, help='GUID of the Core user.', store_missing=False)

    @api.marshal_with(core_user_model, code=200)
    @api.doc(
        description='This endpoint returns a single Core user based on its user guid.',
        params={
            'core_user_guid': 'Core user guid to find a specific user.',
        })
    #@requires_role_mine_view
    def get(self, core_user_guid=None):
        if not core_user_guid:
            raise BadRequest('A Core user guid must be provided.')

        core_user = CoreUser.find_by_core_user_guid(core_user_guid)

        if not core_user:
            raise NotFound('Core user not found.')

        return core_user
