from werkzeug.exceptions import NotFound
from flask import request
from flask_restplus import Resource

from app.extensions import api
from app.api.utils.access_decorators import requires_any_of, MINE_EDIT, MINESPACE_PROPONENT
from app.api.utils.resources_mixins import UserMixin
from app.api.mines.mine.models.mine import Mine
from app.api.services.document_manager_service import DocumentManagerService


class ProjectSummaryDocumentUploadResource(Resource, UserMixin):
    @api.doc(description='Request a document_manager_guid for uploading a document')
    @requires_any_of([MINE_EDIT, MINESPACE_PROPONENT])
    def post(self, mine_guid, project_summary_guid):
        mine = Mine.find_by_mine_guid(mine_guid)
        if not mine:
            raise NotFound('Mine not found')

        return DocumentManagerService.initializeFileUploadWithDocumentManager(
            request, mine, 'project_summaries')
