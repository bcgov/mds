
from app.api.mines.response_models import (
    PERMIT_CONDITION_SEARCH_MODEL,
    PERMIT_CONDITION_SEARCH_RESULT_MODEL,
)
from app.api.search.search.permit_search_service import PermitSearchService
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin
from app.extensions import api
from flask import request
from flask_restx import Resource


class PermitConditionsSearchResource(Resource, UserMixin):
    @api.doc(description='Search Permit Conditions using the permit service')
    @requires_role_view_all
    @api.expect(PERMIT_CONDITION_SEARCH_MODEL, validate=True)
    @api.marshal_with(PERMIT_CONDITION_SEARCH_RESULT_MODEL)
    def post(self):
        request_data = request.json

        results = PermitSearchService().search(request_data)

        return results