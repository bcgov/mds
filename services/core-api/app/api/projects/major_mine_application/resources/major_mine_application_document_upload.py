from werkzeug.exceptions import NotFound
from flask import request, current_app
from flask_restplus import Resource

from app.extensions import api
from app.api.utils.access_decorators import requires_any_of, MINE_EDIT, MINESPACE_PROPONENT
from app.api.utils.resources_mixins import UserMixin
from app.api.projects.project.models.project import Project
from app.api.mines.mine.models.mine import Mine
from app.api.services.document_manager_service import DocumentManagerService


class MajorMineApplicationDocumentUploadResource(Resource, UserMixin):
    @api.doc(
        description='Request a document_manager_guid for uploading a document',
        params={
            'project_guid':
            'The GUID of the project the Major Mine Application document belongs to.'
        })
    @requires_any_of([MINE_EDIT, MINESPACE_PROPONENT])
    def post(self, project_guid):
        # current_app.logger.debug(f'In POST to upload resource ...')
        project = Project.find_by_project_guid(project_guid)

        # current_app.logger.debug(f'project: {project}')
        if not project:
            raise NotFound('Project not found.')

        mine = Mine.find_by_mine_guid(str(project.mine_guid))
        # current_app.logger.debug(f'mine: {mine}')

        if not mine:
            raise NotFound('Mine not found.')

        tmp = DocumentManagerService.initializeFileUploadWithDocumentManager(
            request, mine, 'major_mine_application')

        # current_app.logger.debug(f'DocumentManagerService: {tmp}')
        return tmp
