from flask_restx import Resource

from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all

from app.api.utils.resources_mixins import UserMixin
from app.api.now_applications.models.now_application_progress_status import NOWApplicationProgressStatus
from app.api.now_applications.response_models import APPLICATION_PROGRESS_STATUS_CODES


class NOWApplicationProgressStatusResource(Resource, UserMixin):
    @api.doc(description='Get a list of Application Progress Status Codes', params={})
    @requires_role_view_all
    @api.marshal_with(APPLICATION_PROGRESS_STATUS_CODES, code=200, envelope='records')
    def get(self):
        return NOWApplicationProgressStatus.get_all()