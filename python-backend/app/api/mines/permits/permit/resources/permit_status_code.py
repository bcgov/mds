from flask_restplus import Resource, reqparse
from datetime import datetime
from flask import current_app, request

from app.api.mines.permits.permit.models.permit_status_code import PermitStatusCode
from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin, ErrorMixin
from app.api.mines.permits.response_models import PERMIT_STATUS_CODE_MODEL


class PermitStatusCodeResource(Resource, UserMixin, ErrorMixin):
    @requires_role_view_all
    @api.marshal_with(PERMIT_STATUS_CODE_MODEL, envelope='records', code=200)
    def get(self):
        return PermitStatusCode.active_options()
