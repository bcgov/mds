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
        application_status_codes = ApplicationStatusCode.find_all_active_application_status_code()
        if application_status_codes:
            result = [x.json() for x in application_status_codes]
        else:
            result = []
        return result