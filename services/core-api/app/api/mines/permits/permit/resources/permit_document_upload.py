from flask import request
from flask_restx import Resource, reqparse
from werkzeug.exceptions import BadRequest, InternalServerError, NotFound

from app.extensions import api, db
from app.api.utils.access_decorators import requires_role_edit_permit
from app.api.utils.resources_mixins import UserMixin

from app.api.mines.mine.models.mine import Mine
from app.api.services.document_manager_service import DocumentManagerService


class PermitDocumentUploadInitializationResource(Resource, UserMixin):
    @requires_role_edit_permit
    def post(self, mine_guid):
        mine = Mine.find_by_mine_guid(mine_guid)
        if not mine:
            raise NotFound('Mine not found.')

        return DocumentManagerService.initializeFileUploadWithDocumentManager(
            request, mine, 'permits')
