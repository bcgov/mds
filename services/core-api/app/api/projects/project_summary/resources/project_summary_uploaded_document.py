from werkzeug.exceptions import NotFound, Forbidden
from flask_restx import Resource
from app.extensions import api

from app.api.utils.access_decorators import (requires_any_of, MINE_ADMIN, EDIT_PROJECT_SUMMARIES,MINESPACE_PROPONENT)
from app.api.utils.resources_mixins import UserMixin

from app.api.mines.documents.models.mine_document import MineDocument
from app.api.projects.project_summary.models.project_summary import ProjectSummary


class ProjectSummaryUploadedDocumentResource(Resource, UserMixin):
    @api.doc(description='Delete a document from a project description.')
    @api.response(204, 'Successfully deleted.')
    @requires_any_of([MINE_ADMIN, EDIT_PROJECT_SUMMARIES, MINESPACE_PROPONENT])
    def delete(self, project_guid, project_summary_guid, mine_document_guid):
        project_summary = ProjectSummary.find_by_project_summary_guid(project_summary_guid)
        mine_document = MineDocument.find_by_mine_document_guid(mine_document_guid)

        if project_summary is None:
            raise NotFound('Project Description not found.')
        if mine_document is None:
            raise NotFound('Mine document not found.')
                    
        if mine_document not in project_summary.mine_documents:

            for auth in project_summary.authorizations:
                for doc in auth.amendment_documents:
                    if doc.mine_document == mine_document:
                        if project_summary.status_code != "DFT":
                            raise Forbidden('Cannot delete document unless project application is in draft state')
                        doc.delete()
                        mine_document.delete()
                        return None, 204

            raise NotFound('Mine document not found on Project Description.')

        project_summary.mine_documents.remove(mine_document)
        project_summary.save()
        return None, 204
