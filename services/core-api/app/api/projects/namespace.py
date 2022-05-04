from flask_restplus import Namespace

from app.api.projects.project.resources.project import ProjectResource, ProjectListResource
from app.api.projects.project_summary.resources.project_summary import ProjectSummaryResource
from app.api.projects.project_summary.resources.project_summary_list import ProjectSummaryListGetResource, ProjectSummaryListPostResource
from app.api.projects.project_summary.resources.project_summary_document_types import ProjectSummaryDocumentTypeResource
from app.api.projects.project_summary.resources.project_summary_status_codes import ProjectSummaryStatusCodeResource
from app.api.projects.project_summary.resources.project_summary_document_upload import ProjectSummaryDocumentUploadResource
from app.api.projects.project_summary.resources.project_summary_uploaded_document import ProjectSummaryUploadedDocumentResource
from app.api.projects.project_summary.resources.project_summary_authorization_types import ProjectSummaryAuthorizationTypeResource
from app.api.projects.project_summary.resources.project_summary_permit_types import ProjectSummaryPermitTypeResource
from app.api.projects.information_requirements_table.resources.information_requirements_table import InformationRequirementsTableResource
from app.api.projects.information_requirements_table.resources.information_requirements_table_list import InformationRequirementsTableListResource
from app.api.projects.information_requirements_table.resources.information_requirements_table_status_code import InformationRequirementsTableStatusCodeResource
from app.api.projects.information_requirements_table.resources.requirements_list import RequirementsListResource
from app.api.projects.information_requirements_table.resources.requirements import RequirementsResource

api = Namespace('projects', description='Projects actions/options')

# Project
api.add_resource(ProjectListResource, '')
api.add_resource(ProjectResource, '/<string:project_guid>')

# Project Description(Summary)
api.add_resource(ProjectSummaryResource,
                 '/<string:project_guid>/project-summaries/<string:project_summary_guid>')
api.add_resource(
    ProjectSummaryDocumentUploadResource,
    '/<string:project_guid>/project-summaries/<string:project_summary_guid>/documents')
api.add_resource(
    ProjectSummaryUploadedDocumentResource,
    '/<string:project_guid>/project-summaries/<string:project_summary_guid>/documents/<string:mine_document_guid>'
)
api.add_resource(ProjectSummaryListGetResource, '/<string:project_guid>/project-summaries')
api.add_resource(ProjectSummaryListPostResource, '/new/project-summaries/new')
api.add_resource(ProjectSummaryDocumentTypeResource, '/project-summary-document-types')
api.add_resource(ProjectSummaryStatusCodeResource, '/project-summary-status-codes')
api.add_resource(ProjectSummaryPermitTypeResource, '/project-summary-permit-types')
api.add_resource(ProjectSummaryAuthorizationTypeResource, '/project-summary-authorization-types')

# Information Requirements Table (IRT)
api.add_resource(InformationRequirementsTableResource,
                 '/<string:project_guid>/information-requirements-table/<string:irt_guid>')
api.add_resource(InformationRequirementsTableListResource,
                 '/<string:project_guid>/information-requirements-table')
api.add_resource(InformationRequirementsTableStatusCodeResource, '/irt-status-codes')
api.add_resource(RequirementsResource,
                '/requirements/<string:requirement_guid>')
api.add_resource(RequirementsListResource, '/requirements')