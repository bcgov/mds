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
        'active_ind': fields.Boolean,
    })


class CoreUserResource(Resource, UserMixin):
    parser = reqparse.RequestParser()
    parser.add_argument(
        'core_user_guid', type=str, help='GUID of the Core user.', store_missing=False)

    @api.marshal_with(core_user_model, envelope='data', code=200)
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
