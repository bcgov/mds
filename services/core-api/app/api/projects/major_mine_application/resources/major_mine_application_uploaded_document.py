from werkzeug.exceptions import NotFound
from flask_restplus import Resource
from app.extensions import api

from app.api.utils.access_decorators import (requires_any_of, EDIT_MAJOR_MINE_APPLICATIONS, MINE_ADMIN)
from app.api.utils.resources_mixins import UserMixin

from app.api.mines.documents.models.mine_document import MineDocument
from app.api.projects.major_mine_application.models.major_mine_application import MajorMineApplication


class MajorMineApplicationUploadedDocumentResource(Resource, UserMixin):
    @api.doc(description='Delete a document from a major mine application.')
    @api.response(204, 'Successfully deleted.')
    @requires_any_of([MINE_ADMIN, EDIT_MAJOR_MINE_APPLICATIONS])
    def delete(self, project_guid, major_mine_application_guid, mine_document_guid):
        major_mine_application = MajorMineApplication.find_by_major_mine_application_guid(major_mine_application_guid)
        mine_document = MineDocument.find_by_mine_document_guid(mine_document_guid)

        if major_mine_application is None:
            raise NotFound('Major Mine Application not found.')
        if mine_document is None:
            raise NotFound('Mine document not found.')
        if mine_document not in major_mine_application.mine_documents:
            raise NotFound('Mine document not found on Major Mine Application.')

        major_mine_application.mine_documents.remove(mine_document)
        major_mine_application.save()

        return None, 204
