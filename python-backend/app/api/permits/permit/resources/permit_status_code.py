from flask_restplus import Resource, reqparse
from datetime import datetime
from flask import current_app, request

from ..models.permit_status_code import PermitStatusCode
from app.extensions import api
from ....utils.access_decorators import requires_role_mine_view, requires_role_mine_create
from ....utils.resources_mixins import UserMixin, ErrorMixin


class PermitStatusCodeResource(Resource, UserMixin, ErrorMixin):
    @api.doc(params={'permit_guid': 'Permit guid.'})
    @requires_role_mine_view
    def get(self):
        return [x.json() for x in PermitStatusCode.query.all()]
