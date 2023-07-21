from werkzeug.exceptions import NotFound
from flask import request
from flask_restplus import Resource

from app.extensions import api
from app.api.utils.access_decorators import requires_any_of, MINE_EDIT, MINESPACE_PROPONENT
from app.api.utils.resources_mixins import UserMixin
from app.api.mines.mine.models.mine import Mine
from app.api.services.document_manager_service import DocumentManagerService


class ProjectSummaryDocumentUploadResource(Resource, UserMixin):
    @api.doc(
        description='Request a document_manager_guid for uploading a document',
        params={
            'project_guid': 'The GUID of the project the Project Summary Document belongs to.',
            'mine_guid': {
                'description': 'The GUID of the mine the Project Summary Document belongs to.',
                'required': True
            }
        })
    @requires_any_of([MINE_EDIT, MINESPACE_PROPONENT])
    def post(self, project_guid, project_summary_guid):
        mine_guid = request.args.get('mine_guid', type=str)
        mine = Mine.find_by_mine_guid(mine_guid)
        if not mine:
            raise NotFound('Mine not found')

        return DocumentManagerService.validateFileNameAndInitializeFileUploadWithDocumentManager(
            request, mine, project_guid, 'project_summaries')
