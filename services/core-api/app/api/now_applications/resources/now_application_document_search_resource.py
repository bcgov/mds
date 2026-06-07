from app.api.mines.response_models import NOW_DOCUMENT_SEARCH_MODEL
from app.api.now_applications.models.now_application_identity import NOWApplicationIdentity
from app.api.search.search.now_application_search_service import NowApplicationSearchService
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.feature_flag import Feature, is_feature_enabled
from app.api.utils.resources_mixins import UserMixin
from app.extensions import api
from flask import Response, request, stream_with_context
from flask_restx import Resource
from werkzeug.exceptions import Forbidden, NotFound


def _require_feature():
    if not is_feature_enabled(Feature.NOW_APPLICATION_DOCUMENT_SEARCH):
        raise Forbidden("NoW application document search is not enabled.")


class NOWApplicationDocumentSearchResource(Resource, UserMixin):
    @api.doc(
        description=(
            "Search documents within a specific Notice of Work application using the permits service. "
            "Results are strictly scoped to the requested application — the now_application_guid is "
            "injected as a mandatory filter server-side so documents from other applications can never "
            "appear in results. Uses Server-Sent Events (SSE) to stream results back to the caller."
        )
    )
    @requires_role_view_all
    @api.expect(NOW_DOCUMENT_SEARCH_MODEL, validate=True)
    def post(self, now_application_guid):
        _require_feature()
        now_application_identity = NOWApplicationIdentity.find_by_guid(now_application_guid)
        if not now_application_identity:
            raise NotFound('Notice of Work application not found.')

        request_data = request.json
        response_stream = NowApplicationSearchService().search(now_application_guid, request_data)

        return Response(
            stream_with_context(response_stream),
            mimetype="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
                "Connection": "keep-alive",
            },
        )
