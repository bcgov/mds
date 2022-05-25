from werkzeug.exceptions import NotFound
from flask_restplus import Resource
from flask import request, current_app
from werkzeug.datastructures import FileStorage
from app.extensions import api
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.projects.project.models.project import Project
from app.api.mines.mine.models.mine import Mine
from app.api.services.document_manager_service import DocumentManagerService


class InformationRequirementsTableListUploadResource(Resource, UserMixin):
    @api.doc(
        description='Upload final Information Requirements Table (IRT) spreadsheet to S3 bucket.',
        params={'project_guid': 'The GUID of the project the IRT belongs to.'})
    def post(self, project_guid):
        project = Project.find_by_project_guid(project_guid)

        if not project:
            raise NotFound('Project not found.')

        mine = Mine.find_by_mine_guid(project.mine_guid)

        if not mine:
            raise NotFound('Mine not found.')

        return DocumentManagerService.initializeFileUploadWithDocumentManager(
            request, mine, 'information_requirements_table')


class InformationRequirementsTableImportLocalResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument('file', type=FileStorage, required=True, location="files")

    @api.doc(
        description=
        'Import local copy of final Information Requirements Table (IRT) spreadsheet for further processing.',
        params={'project_guid': 'The GUID of the project the IRT belongs to.'})
    @api.expect(parser)
    def post(self, project_guid):
        data = self.parser.parse_args()
        file = data.get('file')

        return 200
