from werkzeug.exceptions import NotFound
from flask_restplus import Resource
from app.extensions import api

from app.api.utils.access_decorators import (requires_any_of, EDIT_PROJECT_PERMIT_PACKAGES, MINE_ADMIN)
from app.api.utils.resources_mixins import UserMixin

from app.api.mines.documents.models.mine_document import MineDocument
from app.api.projects.project_permit_package.models.project_permit_package import ProjectPermitPackage


class ProjectPermitPackageUploadedDocumentResource(Resource, UserMixin):
    @api.doc(description='Delete a document from a project permit package.')
    @api.response(204, 'Successfully deleted.')
    @requires_any_of([MINE_ADMIN, EDIT_PROJECT_PERMIT_PACKAGES])
    def delete(self, project_guid, project_permit_package_guid, mine_document_guid):
        project_permit_package = ProjectPermitPackage.find_by_project_permit_package_guid(project_permit_package_guid)
        mine_document = MineDocument.find_by_mine_document_guid(mine_document_guid)

        if project_permit_package is None:
            raise NotFound('Project Permit Package not found.')
        if mine_document is None:
            raise NotFound('Mine document not found.')
        if mine_document not in project_permit_package.mine_documents:
            raise NotFound('Mine document not found on Project Permit Package.')

        project_permit_package.mine_documents.remove(mine_document)
        project_permit_package.save()

        return None, 204
