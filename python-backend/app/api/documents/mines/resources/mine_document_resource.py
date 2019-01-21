import decimal
import uuid

from flask import request
from flask_restplus import Resource, reqparse
from datetime import datetime

from ..models.mine_document import MineDocument

from app.extensions import api
from ....utils.access_decorators import requires_role_mine_view
from ....utils.resources_mixins import UserMixin, ErrorMixin


class MineDocumentResource(Resource, UserMixin, ErrorMixin):
    @api.doc(
        params={
            'mine_guid':
            'Optional: Mine number or guid. returns list of documents for the mine'
        })
    @requires_role_mine_view
    def get(self, mine_guid=None):
        if not mine_guid:
            return self.create_error_payload(400, 'no mine_guid provided')
      
        mine_docs = MineDocument.find_by_mine_guid(mine_guid)
        return {'mine_documents': [x.json() for x in mine_docs]}
