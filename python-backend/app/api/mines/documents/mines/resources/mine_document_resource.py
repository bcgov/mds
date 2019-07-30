import decimal
import uuid

from flask import request
from flask_restplus import Resource, reqparse, fields
from datetime import datetime
from werkzeug.exceptions import BadRequest, NotFound

from ..models.mine_document import MineDocument

from app.extensions import api
from app.api.mines.mine.models.mine import Mine
from app.api.utils.access_decorators import requires_any_of, VIEW_ALL, MINESPACE_PROPONENT
from app.api.utils.resources_mixins import UserMixin, ErrorMixin
from app.api.mines.mine_api_models import MINE_DOCUMENT_MODEL


class MineDocumentResource(Resource, UserMixin, ErrorMixin):
    @api.doc(description='Returns list of documents associated with mines')
    @api.marshal_with(MINE_DOCUMENT_MODEL, code=200, envelope='records')
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    def get(self, mine_guid):
        mine = Mine.find_by_mine_guid(mine_guid)
        if not mine:
            raise NotFound('Mine not found.')

        return mine.mine_documents
