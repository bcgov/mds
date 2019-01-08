import decimal
import uuid
from datetime import datetime

from flask import request
from flask_restplus import Resource, reqparse

from ..models.document_status import ExpectedDocumentStatus

from app.extensions import api
from ....utils.access_decorators import requires_role_mine_view
from ....utils.resources_mixins import UserMixin, ErrorMixin


class ExpectedDocumentStatusResource(Resource, UserMixin, ErrorMixin):
    # @requires_role_mine_view
    def get(self):
        mine_exp_docs_status = ExpectedDocumentStatus.find_all_document_status()
        return {
            'options': list(map(lambda x: x.json(), mine_exp_docs_status) if mine_exp_docs_status else [])
        }
