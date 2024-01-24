from werkzeug.exceptions import NotFound
from flask_restx import Resource
from flask import request
from app.extensions import api
from app.api.utils.resources_mixins import UserMixin
from app.api.projects.project.models.project import Project
from app.api.mines.mine.models.mine import Mine
from app.api.services.document_manager_service import DocumentManagerService


class InformationRequirementsTableDocumentUploadResource(Resource, UserMixin):
    @api.doc(
        description='Upload final Information Requirements Table (IRT) spreadsheet to S3 bucket.',
        params={'project_guid': 'The GUID of the project the IRT belongs to.'})
    def post(self, project_guid):
        project = Project.find_by_project_guid(project_guid)

        if not project:
            raise NotFound('Project not found.')

        mine = Mine.find_by_mine_guid(str(project.mine_guid))

        if not mine:
            raise NotFound('Mine not found.')

        return DocumentManagerService.initializeFileUploadWithDocumentManager(
            request, mine, 'information_requirements_table')
