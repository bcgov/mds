import decimal
import uuid

from flask import request
from flask_restplus import Resource, reqparse

from ..models.document import ExpectedDocument

from app.extensions import jwt, api
from ....utils.resources_mixins import UserMixin, ErrorMixin


class ExpectedDocumentResource(Resource, UserMixin, ErrorMixin):

    @api.doc(params={'exp_document_guid': 'Required: Mine number or guid. returns list of expected documents for the mine'})
    @jwt.requires_roles(["mds-mine-view"])
    def get(self, exp_document_guid=None):
        if exp_document_guid == None:
            return self.create_error_payload(401, 'Must provide a expected document guid.')
        mine_exp_doc = ExpectedDocument.find_by_exp_document_guid(mine_guid)
        return { 'expected_mine_documents' : mine_exp_doc.json() }