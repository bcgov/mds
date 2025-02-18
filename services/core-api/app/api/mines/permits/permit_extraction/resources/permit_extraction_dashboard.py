from app.api.mines.permits.permit_extraction.models.permit_extraction_task import (
    PermitExtractionTask,
)
from app.api.mines.permits.permit_extraction.models.response_model import (
    EXTRACTION_DASHBOARD,
)
from app.api.utils.access_decorators import VIEW_ALL, requires_any_of
from app.api.utils.resources_mixins import UserMixin
from app.extensions import api
from flask_restx import Resource


class PermitExtractionDashboardResource(Resource, UserMixin):
    @api.doc(description='Get dashboard statistics for permit extraction tasks')
    @api.marshal_with(EXTRACTION_DASHBOARD, code=200)
    @requires_any_of([VIEW_ALL])
    def get(self):
        """Get aggregated statistics about permit extraction tasks"""
        return PermitExtractionTask.get_dashboard_stats()
