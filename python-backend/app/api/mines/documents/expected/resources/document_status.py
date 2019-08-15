import decimal
import uuid
from datetime import datetime

from flask import request
from flask_restplus import Resource, reqparse

from ..models.document_status import ExpectedDocumentStatus

from app.extensions import api
from app.api.utils.access_decorators import requires_any_of, VIEW_ALL, MINESPACE_PROPONENT
from app.api.utils.resources_mixins import UserMixin

from app.api.mines.mine_api_models import EXPECTED_DOCUMENT_STATUS_MODEL


class ExpectedDocumentStatusResource(Resource, UserMixin):
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(EXPECTED_DOCUMENT_STATUS_MODEL, code=200, envelope='records')
    def get(self):
        mine_exp_docs_status = ExpectedDocumentStatus.find_all_document_status()
        return mine_exp_docs_status
