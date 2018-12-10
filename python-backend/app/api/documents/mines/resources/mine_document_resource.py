import decimal
import uuid

from flask import request
from flask_restplus import Resource, reqparse
from datetime import datetime

from ..models.mine_document import MineDocument

from app.extensions import jwt, api
from ....utils.resources_mixins import UserMixin, ErrorMixin


class MineDocumentResource(Resource, UserMixin, ErrorMixin):
    @api.doc(
        params={
            'mine_guid':
            'Optional: Mine number or guid. returns list of documents for the mine'
        })
    @jwt.requires_roles(["mds-mine-view"])
    def get(self, mine_guid=None):
        if not mine_guid:
            return self.create_error_payload(400, 'no mine_guid provided')
        mine_docs = MineDocument.find_by_mine_guid(mine_guid)
        if not mine_docs:
            return self.create_error_payload(404, 'mine not found')

        #does this list compreshension work the same as the lambda/map functions
        return [x.json() for x in mine_docs]
