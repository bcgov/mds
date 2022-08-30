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
from app.api.projects.information_requirements_table.resources.information_requirements_table_download import InformationRequirementsTableDownloadResource
from app.api.projects.information_requirements_table.resources.information_requirements_table_list import InformationRequirementsTableListResource
from app.api.projects.information_requirements_table.resources.information_requirements_table_document_upload import InformationRequirementsTableDocumentUploadResource
from app.api.projects.information_requirements_table.resources.information_requirements_table_uploaded_document import InformationRequirementsTableUploadedDocumentResource
from app.api.projects.information_requirements_table.resources.information_requirements_table_document_types import InformationRequirementsTableDocumentTypeResource
from app.api.projects.information_requirements_table.resources.requirements_list import RequirementsListResource
from app.api.projects.information_requirements_table.resources.requirements import RequirementsResource
from app.api.projects.major_mine_application.resources.major_mine_application_list import MajorMineApplicationListResource
from app.api.projects.major_mine_application.resources.major_mine_application import MajorMineApplicationResource
from app.api.projects.major_mine_application.resources.major_mine_application_document_upload import MajorMineApplicationDocumentUploadResource
from app.api.projects.major_mine_application.resources.major_mine_application_uploaded_document import MajorMineApplicationUploadedDocumentResource
from app.api.projects.project_permit_package.resources.project_permit_package import ProjectPermitPackageResource, ProjectPermitPackageListResource
from app.api.projects.project_permit_package.resources.project_permit_package_document_upload import ProjectPermitPackageDocumentUploadResource
from app.api.projects.project_permit_package.resources.project_permit_package_uploaded_document import ProjectPermitPackageUploadedDocumentResource


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
api.add_resource(InformationRequirementsTableDownloadResource,
                 '/information-requirements-table/template-download')
api.add_resource(InformationRequirementsTableDocumentUploadResource,
                 '/<string:project_guid>/information-requirements-table/documents')
api.add_resource(InformationRequirementsTableUploadedDocumentResource, '/<string:project_guid>/information-requirements-table/<string:irt_guid>/documents/<string:mine_document_guid>')
api.add_resource(InformationRequirementsTableResource,
                 '/<string:project_guid>/information-requirements-table/<string:irt_guid>')
api.add_resource(InformationRequirementsTableListResource,
                 '/<string:project_guid>/information-requirements-table')
api.add_resource(InformationRequirementsTableStatusCodeResource, '/irt-status-codes')
api.add_resource(InformationRequirementsTableDocumentTypeResource,
                 '/information-requirements-table-document-types')
api.add_resource(RequirementsResource, '/requirements/<string:requirement_guid>')
api.add_resource(RequirementsListResource, '/requirements')

# Major Mine Applications
api.add_resource(MajorMineApplicationListResource, '/<string:project_guid>/major-mine-application')
api.add_resource(
    MajorMineApplicationResource,
    '/<string:project_guid>/major-mine-application/<string:major_mine_application_guid>')
api.add_resource(MajorMineApplicationDocumentUploadResource,
                 '/<string:project_guid>/major-mine-application/documents')
api.add_resource(MajorMineApplicationUploadedDocumentResource, '/<string:project_guid>/major-mine-application/<string:major_mine_application_guid>/documents/<string:mine_document_guid>')

# Project Permit Package
api.add_resource(ProjectPermitPackageListResource, '<string:project_guid>/project-permit-package')
api.add_resource(ProjectPermitPackageResource, '<string:project_guid>/project-permit-package/<string:project_permit_package_guid>')
api.add_resource(ProjectPermitPackageDocumentUploadResource, '/<string:project_guid>/project-permit-package/documents')
api.add_resource(ProjectPermitPackageUploadedDocumentResource, '/<string:project_guid>/project-permit-package/documents/<string:mine_document_guid>')
