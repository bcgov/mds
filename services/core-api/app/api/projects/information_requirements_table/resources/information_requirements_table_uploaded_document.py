from werkzeug.exceptions import NotFound
from flask_restplus import Resource
from app.extensions import api

from app.api.utils.access_decorators import (requires_any_of, EDIT_INFORMATION_REQUIREMENTS_TABLE, MINE_ADMIN)
from app.api.utils.resources_mixins import UserMixin

from app.api.mines.documents.models.mine_document import MineDocument
from app.api.projects.information_requirements_table.models.information_requirements_table import InformationRequirementsTable


class InformationRequirementsTableUploadedDocumentResource(Resource, UserMixin):
    @api.doc(description='Delete a document from an information requirements table.')
    @api.response(204, 'Successfully deleted.')
    @requires_any_of([MINE_ADMIN, EDIT_INFORMATION_REQUIREMENTS_TABLE])
    def delete(self, project_guid, irt_guid, mine_document_guid):
        information_requirements_table = InformationRequirementsTable.find_by_irt_guid(irt_guid)
        mine_document = MineDocument.find_by_mine_document_guid(mine_document_guid)

        if information_requirements_table is None:
            raise NotFound('Information Requirements Table not found.')
        if mine_document is None:
            raise NotFound('Mine document not found.')
        if mine_document not in information_requirements_table.mine_documents:
            raise NotFound('Mine document not found on Information Requirements Table.')

        information_requirements_table.mine_documents.remove(mine_document)
        information_requirements_table.save()

        return None, 204
