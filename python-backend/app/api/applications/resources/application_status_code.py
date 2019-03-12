from flask_restplus import Resource, reqparse
from flask import request
from datetime import datetime

from app.extensions import api
from ..models.application_status_code import ApplicationStatusCode
from app.api.utils.resources_mixins import UserMixin, ErrorMixin
from app.api.utils.access_decorators import requires_role_mine_view


class ApplicationStatusCodeResource(Resource, UserMixin, ErrorMixin):
    @requires_role_mine_view
    def get(self):
        return [x.json() for x in ApplicationStatusCode.query.all()]
