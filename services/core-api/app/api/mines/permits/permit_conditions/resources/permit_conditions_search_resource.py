from app.api.mines.response_models import PERMIT_CONDITION_SEARCH_MODEL
from app.api.search.search.permit_search_service import PermitSearchService
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin
from app.extensions import api
from flask import Response, request, stream_with_context
from flask_restx import Resource


class PermitConditionsSearchResource(Resource, UserMixin):
    @api.doc(description="Search Permit Conditions using the permit service")
    @requires_role_view_all
    @api.expect(PERMIT_CONDITION_SEARCH_MODEL, validate=True)
    def post(self):
        request_data = request.json
        response = PermitSearchService().search(request_data)

        return Response(
            stream_with_context(response.iter_lines()),
            mimetype="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        )
