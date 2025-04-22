from flask_restx import Resource

from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all

from app.api.projects.response_models import PROJECT_SUMMARY_AUTHORIZATION_STATUS_MODEL
from app.api.services.ams_api_service import AMSApiService
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser


class ProjectSummaryAuthorizationStatusesResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument('ams_tracking_numbers', type=list, location='json', store_missing=False, required=True)

    @api.doc(description='Returns the statuses for project summary environment authorizations')
    @api.expect(parser)
    @api.marshal_with(
        PROJECT_SUMMARY_AUTHORIZATION_STATUS_MODEL, code=200, as_list=True)
    @requires_role_view_all
    def post(self):
        data = self.parser.parse_args()
        ams_tracking_numbers = data.get('ams_tracking_numbers')
        return AMSApiService.get_ams_authorization_statuses(ams_tracking_numbers)