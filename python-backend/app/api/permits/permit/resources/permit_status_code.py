from flask_restplus import Resource, reqparse
from datetime import datetime
from flask import current_app, request

from ..models.permit_status_code import PermitStatusCode
from app.extensions import api
from ....utils.access_decorators import requires_role_mine_view, requires_role_mine_create
from ....utils.resources_mixins import UserMixin, ErrorMixin
from app.api.permits.response_models import PERMIT_STATUS_CODE_MODEL


class PermitStatusCodeResource(Resource, UserMixin, ErrorMixin):
    @requires_role_mine_view
    @api.marshal_with(PERMIT_STATUS_CODE_MODEL, envelope='records', code=200)
    def get(self):
        return PermitStatusCode.active_options()
