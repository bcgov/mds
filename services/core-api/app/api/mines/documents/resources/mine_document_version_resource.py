import decimal
import uuid

from flask import request
from flask_restplus import Resource, reqparse, fields
from datetime import datetime
from werkzeug.exceptions import BadRequest, NotFound

from app.extensions import api
from app.api.utils.access_decorators import EDIT_MAJOR_MINE_APPLICATIONS, MINE_ADMIN, requires_any_of, VIEW_ALL, MINESPACE_PROPONENT
from app.api.utils.resources_mixins import UserMixin

from app.api.mines.documents.models.mine_document import MineDocument
from app.api.mines.mine.models.mine import Mine

from app.api.mines.response_models import MINE_DOCUMENT_MODEL
from app.api.services.document_manager_service import DocumentManagerService


class MineDocumentVersionListResource(Resource, UserMixin):
    parser = reqparse.RequestParser()

    @api.doc(
        description='Request a document_manager_version_guid for uploading a document',
        params={
            'mine_guid': 'The GUID of the mine the document belongs to',
            'mine_document_guid': 'The GUID of the MineDocument to request a new version for'
        }
    )
    @api.response(200, 'Successfully requested new document manager version')
    def post(self, mine_guid, mine_document_guid):
        mine = Mine.find_by_mine_guid(mine_guid)

        if not mine:
            raise NotFound('Mine not found.')

        mine_document = MineDocument.find_by_mine_document_guid(mine_document_guid)

        if not mine_document:
            raise NotFound('Mine document not found.')

        if str(mine_document.mine_guid) != mine_guid:
            raise BadRequest('Mine document not attached to Mine')

        if mine_document.is_archived:
            raise BadRequest('Cannot create new version of archived document')

        return DocumentManagerService.initializeFileVersionUploadWithDocumentManager(
            request, mine)
