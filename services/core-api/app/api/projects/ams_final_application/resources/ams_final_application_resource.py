from flask_restx import Resource
from werkzeug.exceptions import BadRequest, NotFound
from app.api.utils.resources_mixins import UserMixin

from app.extensions import api
from app.api.utils.access_decorators import MINESPACE_PROPONENT, requires_any_of, VIEW_ALL, MINE_ADMIN, EDIT_PROJECT_SUMMARIES
from app.api.projects.response_models import AMS_FINAL_APPLICATION_MODEL
from app.api.projects.project_summary.models.project_summary_authorization import ProjectSummaryAuthorization
from app.api.projects.ams_final_application.models.ams_final_application import AmsFinalApplication
from app.api.utils.custom_reqparser import CustomReqparser


class AmsFinalApplicationResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument('ams_final_application_guid', type=str, store_missing=False, required=False)
    parser.add_argument('project_summary_authorization_guid', type=str, store_missing=False, required=True)
    parser.add_argument('submitter_name', type=str, store_missing=False, required=True)
    parser.add_argument('is_agent', type=bool, store_missing=False, required=True)
    parser.add_argument('pre_submitted_files', type=list, location='json', store_missing=False, required=False)
    parser.add_argument('documents', type=list, location='json', store_missing=False, required=False)
    parser.add_argument('is_submitting', type=bool, store_missing=False, required=False)

    @staticmethod
    def check_valid_ams_auth(project_summary_authorization):
        if project_summary_authorization is None:
            raise BadRequest("No project summary authorization found")
        if project_summary_authorization.ams_tracking_number is None:
            raise BadRequest("Authorization must be successfully submitted before creating the final application.")

    @requires_any_of([MINE_ADMIN, MINESPACE_PROPONENT, EDIT_PROJECT_SUMMARIES ])
    @api.expect(parser)
    @api.marshal_with(AMS_FINAL_APPLICATION_MODEL, code=201)    
    def post(self, project_summary_guid, project_summary_authorization_guid):
        auth = ProjectSummaryAuthorization.find_by_project_summary_authorization_guid(project_summary_authorization_guid)
        AmsFinalApplicationResource.check_valid_ams_auth(auth)
        data = self.parser.parse_args()
        ams_final_application_guid = data.get('ams_final_application_guid')
        if ams_final_application_guid:
            raise BadRequest("ams_final_application_guid should not be provided when creating a new AMS Final Application. Use PUT to update an existing application.")
        # Create new
        final_app = AmsFinalApplication.create(**data)
        return final_app, 201
    
    @requires_any_of([MINE_ADMIN, MINESPACE_PROPONENT, EDIT_PROJECT_SUMMARIES ])
    @api.expect(parser)
    @api.marshal_with(AMS_FINAL_APPLICATION_MODEL, code=200)
    def put(self, project_summary_guid, project_summary_authorization_guid):
        data = self.parser.parse_args()
        ams_final_application_guid = data.get('ams_final_application_guid')
        if not ams_final_application_guid:
            raise BadRequest("ams_final_application_guid is required for update.")
        final_app = AmsFinalApplication.find_by_authorization_guid(project_summary_authorization_guid)
        if not final_app:
            raise NotFound("AMS Final Application not found.")
        submitter_name = data.get('submitter_name', None)
        documents = data.get('documents', [])
        is_agent = data.get('is_agent', False)
        pre_submitted_files = data.get('pre_submitted_files', [])
        is_submitting = data.get('is_submitting', False)
        final_app = final_app.update(submitter_name, documents, is_agent, pre_submitted_files, is_submitting)
        return final_app, 200

    

class AmsFinalApplicationListResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument('project_summary_authorization_guid', type=str, store_missing=False, required=False)

    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.expect(parser)
    @api.marshal_with(AMS_FINAL_APPLICATION_MODEL, code=200, as_list=True, envelope="records") 
    def get(self, project_summary_guid):
        data = self.parser.parse_args()
        project_summary_authorization_guid = data.get('project_summary_authorization_guid', None)
        if project_summary_authorization_guid is None:
            final_applications = AmsFinalApplication.find_by_project_summary_guid(project_summary_guid)
            return final_applications
        final_application = AmsFinalApplication.find_by_authorization_guid(project_summary_authorization_guid)
        if final_application is None:
            return []
        return [final_application]
