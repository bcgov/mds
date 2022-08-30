from werkzeug.exceptions import NotFound
from flask import request
from flask_restplus import Resource

from app.extensions import api
from app.api.utils.access_decorators import requires_any_of, MINE_EDIT, EDIT_PROJECT_PERMIT_PACKAGES
from app.api.utils.resources_mixins import UserMixin
from app.api.projects.project.models.project import Project
from app.api.mines.mine.models.mine import Mine
from app.api.services.document_manager_service import DocumentManagerService


class ProjectPermitPackageDocumentUploadResource(Resource, UserMixin):
    @api.doc(
        description='Request a document_manager_guid for uploading a document',
        params={
            'project_guid':
            'The GUID of the project the permit package document belongs to.'
        })
    @requires_any_of([MINE_EDIT, EDIT_PROJECT_PERMIT_PACKAGES])
    def post(self, project_guid):
        project = Project.find_by_project_guid(project_guid)

        if not project:
            raise NotFound('Project not found.')

        mine = Mine.find_by_mine_guid(str(project.mine_guid))

        if not mine:
            raise NotFound('Mine not found.')

        return DocumentManagerService.initializeFileUploadWithDocumentManager(
            request, mine, 'project_permit_package')
