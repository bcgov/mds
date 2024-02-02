from flask import request
from flask_restx import Resource
from werkzeug.exceptions import NotFound

from app.extensions import api
from app.api.mines.mine.models.mine import Mine
from app.api.utils.access_decorators import requires_role_edit_securities
from app.api.utils.resources_mixins import UserMixin
from app.api.services.document_manager_service import DocumentManagerService


class ReclamationInvoiceDocumentListResource(Resource, UserMixin):
    @api.doc(description='Request a document_manager_guid for uploading a document')
    @requires_role_edit_securities
    def post(self, mine_guid):
        mine = Mine.find_by_mine_guid(mine_guid)

        if not mine:
            raise NotFound('Mine not found.')

        return DocumentManagerService.initializeFileUploadWithDocumentManager(
            request, mine, 'reclamation_invoices')
