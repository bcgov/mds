import decimal
import uuid
from datetime import datetime

from flask import request
from flask_restplus import Resource, reqparse

from ..models.document_status import ExpectedDocumentStatus

from app.extensions import jwt, api
from ....utils.resources_mixins import UserMixin, ErrorMixin


class ExpectedDocumentStatusResource(Resource, UserMixin, ErrorMixin):
    #@jwt.requires_roles(["mds-mine-view"])
    def get(self):
        mine_exp_docs_status = ExpectedDocumentStatus.find_all_document_status()
        return {
            'document_status' : list(map(lambda x: x.json(), mine_exp_docs_status) if mine_exp_docs_status else [])
        }