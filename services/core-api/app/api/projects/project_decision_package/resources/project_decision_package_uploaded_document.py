from werkzeug.exceptions import NotFound
from flask_restplus import Resource
from app.extensions import api

from app.api.utils.access_decorators import (requires_any_of, EDIT_PROJECT_DECISION_PACKAGES, MINE_ADMIN)
from app.api.utils.resources_mixins import UserMixin

from app.api.mines.documents.models.mine_document import MineDocument
from app.api.projects.project_decision_package.models.project_decision_package import ProjectDecisionPackage


class ProjectDecisionPackageUploadedDocumentResource(Resource, UserMixin):
    @api.doc(description='Delete a document from a project decision package.')
    @api.response(204, 'Successfully deleted.')
    @requires_any_of([MINE_ADMIN, EDIT_PROJECT_DECISION_PACKAGES])
    def delete(self, project_guid, project_decision_package_guid, mine_document_guid):
        project_decision_package = ProjectDecisionPackage.find_by_project_decision_package_guid(project_decision_package_guid)
        mine_document = MineDocument.find_by_mine_document_guid(mine_document_guid)

        if project_decision_package is None:
            raise NotFound('Project Decision Package not found.')
        if mine_document is None:
            raise NotFound('Mine document not found.')
        if mine_document not in project_decision_package.mine_documents:
            raise NotFound('Mine document not found on Project Decision Package.')

        project_decision_package.mine_documents.remove(mine_document)
        project_decision_package.save()

        return None, 204
