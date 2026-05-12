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
        response = NowApplicationSearchService().search(now_application_guid, request_data)

        return Response(
            stream_with_context(response.iter_content(chunk_size=1024)),
            mimetype="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
                "Connection": "keep-alive",
            },
        )


class NOWApplicationDocumentIndexResource(Resource, UserMixin):
    @api.doc(
        description=(
            "Index all documents attached to a Notice of Work application so they become searchable. "
            "This downloads each document from Document Manager, processes it with Azure Document "
            "Intelligence to extract text, and indexes the content in Azure AI Search. "
            "Spatial file types are excluded. Re-indexing the same application is safe — "
            "existing records are overwritten by deterministic chunk IDs."
        )
    )
    @requires_role_view_all
    def post(self, now_application_guid):
        _require_feature()
        now_application_identity = NOWApplicationIdentity.find_by_guid(now_application_guid)
        if not now_application_identity:
            raise NotFound('Notice of Work application not found.')

        now_application = now_application_identity.now_application
        if not now_application:
            raise NotFound('Notice of Work application record not found.')

        # Collect all non-spatial documents attached to this application.
        # Spatial file types (e.g. .shp, .kml, .gdb) are excluded per the ticket scope.
        documents = _collect_indexable_documents(now_application)

        if not documents:
            return {'message': 'No indexable documents found for this application.'}, 200

        result = NowApplicationSearchService().index_documents(now_application_guid, documents)
        return result, 200

    @api.doc(description="Cancel the active indexing task for a Notice of Work application.")
    @requires_role_view_all
    def delete(self, now_application_guid):
        _require_feature()
        now_application_identity = NOWApplicationIdentity.find_by_guid(now_application_guid)
        if not now_application_identity:
            raise NotFound('Notice of Work application not found.')

        return NowApplicationSearchService().cancel_indexing(now_application_guid), 200


class NOWApplicationDocumentIndexStatusResource(Resource, UserMixin):
    @api.doc(description="Returns the current Azure Search indexer status for a NoW application.")
    @requires_role_view_all
    def get(self, now_application_guid):
        _require_feature()
        now_application_identity = NOWApplicationIdentity.find_by_guid(now_application_guid)
        if not now_application_identity:
            raise NotFound('Notice of Work application not found.')

        return NowApplicationSearchService().get_index_status(now_application_guid), 200


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

SPATIAL_EXTENSIONS = {'.shp', '.shx', '.dbf', '.prj', '.kml', '.kmz', '.gdb', '.gpx', '.geojson'}


def _collect_indexable_documents(now_application) -> list:
    """
    Returns a list of document metadata dicts for all non-spatial documents
    attached to the NoW application.
    """
    documents = []

    for xref in (now_application.documents or []):
        mine_doc = xref.mine_document
        if not mine_doc or mine_doc.deleted_ind:
            continue

        doc_name = mine_doc.document_name or ''
        if any(doc_name.lower().endswith(ext) for ext in SPATIAL_EXTENSIONS):
            continue

        doc_type = (
            xref.now_application_document_type.description
            if xref.now_application_document_type
            else ''
        )

        documents.append({
            'document_manager_guid': str(mine_doc.document_manager_guid),
            'document_name': doc_name,
            'document_type': doc_type,
            'mine_guid': str(now_application.mine_guid or ''),
            'submitted_date': (
                now_application.submitted_date.isoformat()
                if now_application.submitted_date
                else None
            ),
        })

    return documents
