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

from app.api.mines.response_models import ARCHIVE_MINE_DOCUMENT, MINE_DOCUMENT_MODEL


class MineDocumentListResource(Resource, UserMixin):
    @api.doc(description='Returns list of documents associated with mines')
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(MINE_DOCUMENT_MODEL, code=200, envelope='records')
    def get(self, mine_guid):
        mine = Mine.find_by_mine_guid(mine_guid)
        if not mine:
            raise NotFound('Mine not found.')

        return mine.mine_documents


class MineDocumentArchiveResource(Resource, UserMixin):
    parser = reqparse.RequestParser()

    parser.add_argument(
        'mine_document_guids',
        type=list,
        help='Mine Document GUIDs',
        location='json',
        required=True
    )

    @api.doc(
        description='Archives a mine document.',
        params={
            'mine_guid': 'The GUID of the mine the document belongs to.',
            'explosives_permit_guid': 'The GUID of the Mine Document to Archive.'
        }
    )
    @requires_any_of([MINE_ADMIN, EDIT_MAJOR_MINE_APPLICATIONS])
    @api.expect(ARCHIVE_MINE_DOCUMENT)
    @api.response(204, 'Successfully archived documents')
    def patch(self, mine_guid):

        mine = Mine.find_by_mine_guid(mine_guid)
        
        if not mine:
            raise NotFound('Mine not found.')

        args = self.parser.parse_args()
        mine_document_guids = args.get('mine_document_guids')

        print(f'Archiving {len(mine_document_guids)} documents for {mine.mine_guid}')

        documents = MineDocument.find_by_mine_document_guid_many(mine_document_guids)
        print(f'a {len(documents)}')

        if len(documents) != len(mine_document_guids):
            raise NotFound('Doucment not found')

        # for document in documents:
        #     if document.mine_guid != mine_guid:
        #         raise BadRequest('Document not attached to mine')

        MineDocument.mark_as_archived_many(mine_document_guids)

        return None, 204
