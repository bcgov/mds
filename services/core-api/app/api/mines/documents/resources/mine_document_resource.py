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
from app.api.mines.documents.mine_document_search_util import MineDocumentSearchUtil

from app.api.mines.response_models import ARCHIVE_MINE_DOCUMENT, MINE_DOCUMENT_MODEL


class MineDocumentListResource(Resource, UserMixin):
    @api.doc(description='Returns list of documents associated with mines')
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(MINE_DOCUMENT_MODEL, code=200, envelope='records')
    def get(self, mine_guid):
        parser = reqparse.RequestParser()

        parser.add_argument(
            'is_archived',
            type=bool,
            help='Include archived documents',
            location='args',
            required=False
        )

        parser.add_argument(
            'project_guid',
            type=str,
            help='Filter by documents for given project',
            location='args',
            required=False
        )

        parser.add_argument(
            'project_summary_guid',
            type=str,
            help='Filter by documents for given project summary',
            location='args',
            required=False
        )

        parser.add_argument(
            'project_decision_package_guid',
            type=str,
            help='Filter by documents for given project decision package',
            location='args',
            required=False
        )

        parser.add_argument(
            'major_mine_application_guid',
            type=str,
            help='Filter by documents for given major mine application guid',
            location='args',
            required=False
        )

        mine = Mine.find_by_mine_guid(mine_guid)

        if not mine:
            raise NotFound('Mine not found.')

        args = parser.parse_args()

        return MineDocumentSearchUtil.filter_by(
            mine_guid=mine.mine_guid,
            is_archived=args.get('is_archived'),
            project_guid=args.get('project_guid'),
            project_summary_guid=args.get('project_summary_guid'),
            project_decision_package_guid=args.get('project_decision_package_guid'),
            major_mine_application_guid=args.get('major_mine_application_guid')
        )


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
        description='Archives the given mine documents.',
        params={
            'mine_guid': 'The GUID of the mine the documents belongs to.',
            'mine_document_guids': 'The GUID of the Mine Documents to Archive.'
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

        documents = MineDocument.find_by_mine_document_guid_many(mine_document_guids)

        if len(documents) != len(mine_document_guids):
            raise NotFound('Document not found')

        for document in documents:
            if str(document.mine_guid) != str(mine_guid):
                raise BadRequest('Document not attached to mine')

        MineDocument.mark_as_archived_many(mine_document_guids)

        return None, 204
