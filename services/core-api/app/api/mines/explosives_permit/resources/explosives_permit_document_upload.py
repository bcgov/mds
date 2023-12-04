from werkzeug.exceptions import NotFound
from flask import request
from flask_restplus import Resource
from flask.globals import current_app

from app.extensions import api
from app.api.utils.access_decorators import requires_any_of, MINE_EDIT, MINESPACE_PROPONENT, EDIT_EXPLOSIVES_PERMIT, EDIT_PERMIT
from app.api.utils.resources_mixins import UserMixin
from app.api.mines.mine.models.mine import Mine
from app.api.services.document_manager_service import DocumentManagerService
from app.api.mines.exceptions.mine_exceptions import MineException


class ExplosivesPermitDocumentUploadResource(Resource, UserMixin):
    @api.doc(description='Request a document_manager_guid for uploading a document')
    @requires_any_of([MINE_EDIT, MINESPACE_PROPONENT, EDIT_EXPLOSIVES_PERMIT, EDIT_PERMIT])
    def post(self, mine_guid, explosives_permit_guid):
        try:
            mine = Mine.find_by_mine_guid(mine_guid)
            if not mine:
                raise MineException('Mine not found')
            return DocumentManagerService.initializeFileUploadWithDocumentManager(
                request, mine, 'explosives_permits')
        except Exception as e:
            current_app.logger.error(e)
            raise MineException(detailed_error = e)